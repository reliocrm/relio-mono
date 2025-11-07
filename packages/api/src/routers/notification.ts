import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { Notification } from "@relio/db/models/notification.model";
import { Organization, Member } from "@relio/db/models/org.model";
import { User } from "@relio/db/models/auth.model";

export const notificationRouter = router({
	getNotifications: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				type: z.enum(["all", "notifications", "requests", "archived"]).optional().default("all"),
			})
		)
		.query(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			// Verify user is a member of this organization
			const membership = await Member.findOne({
				userId,
				organizationId: organization._id,
			}).lean();

			if (!membership) {
				throw new Error("You are not a member of this organization");
			}

			const organizationId = organization._id;

			// Build query based on type
			let query: any = {
				userId,
				organizationId,
			};

			if (input.type === "notifications") {
				query = {
					...query,
					$or: [
						{ type: { $ne: "request" } },
						{ type: { $exists: false } },
					],
					archived: false,
				};
			} else if (input.type === "requests") {
				query = {
					...query,
					type: "request",
					archived: false,
				};
			} else if (input.type === "archived") {
				query = {
					...query,
					archived: true,
				};
			}
			// If type is "all", we don't add additional filters

			const notifications = await Notification.find(query)
				.sort({ createdAt: -1 })
				.lean();

			// Populate requestUserId if it exists (for requests)
			const populatedNotifications = await Promise.all(
				notifications.map(async (notification: any) => {
					// Check if notification has a requestUserId field (for join requests)
					// Since the schema doesn't explicitly define this, we'll check the data field
					let user = null;
					if (notification.data?.requestUserId) {
						const foundUser = await User.findById(notification.data.requestUserId).lean();
						if (foundUser && foundUser._id) {
							user = {
								...foundUser,
								_id: foundUser._id.toString(),
							};
						}
					}

					return {
						...notification,
						_id: notification._id.toString(),
						userId: notification.userId.toString(),
						organizationId: notification.organizationId?.toString(),
						// Map body to message for compatibility
						message: notification.body || notification.title,
						notificationType: notification.type === "request" ? "request" : "notification",
						user,
						_creationTime: notification.createdAt?.getTime() || Date.now(),
					};
				})
			);

			return populatedNotifications;
		}),

	toggleReadStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;

			const notification = await Notification.findById(input.id).lean();

			if (!notification) {
				throw new Error("Notification not found");
			}

			// Verify the notification belongs to the user
			if (notification.userId.toString() !== userIdString) {
				throw new Error("Unauthorized");
			}

			const updated = await Notification.findByIdAndUpdate(
				input.id,
				{
					read: !notification.read,
					archived: !notification.read, // Archive when marking as read
					updatedAt: new Date(),
				},
				{ new: true }
			).lean();

			if (!updated || !updated._id) {
				throw new Error("Failed to update notification");
			}

			return {
				...updated,
				_id: updated._id.toString(),
				userId: updated.userId.toString(),
				organizationId: updated.organizationId?.toString(),
			};
		}),

	removeNotification: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;

			const notification = await Notification.findById(input.id).lean();

			if (!notification) {
				throw new Error("Notification not found");
			}

			// Verify the notification belongs to the user
			if (notification.userId.toString() !== userIdString) {
				throw new Error("Unauthorized");
			}

			await Notification.findByIdAndDelete(input.id);

			return { success: true };
		}),

	createNotification: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				userId: z.string().optional(),
				type: z.string(),
				title: z.string(),
				body: z.string().optional(),
				data: z.record(z.string(), z.any()).optional(),
				requestUserId: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = input.userId || ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			const organizationId = organization._id;

			// Build data object
			const notificationData: any = {
				_id: new mongoose.Types.ObjectId(),
				userId,
				organizationId,
				type: input.type,
				title: input.title,
				body: input.body,
				read: false,
				archived: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Add requestUserId to data if provided
			if (input.requestUserId) {
				notificationData.data = {
					...(input.data || {}),
					requestUserId: input.requestUserId,
				};
			} else if (input.data) {
				notificationData.data = input.data;
			}

			const notification = new Notification(notificationData);
			await notification.save();

			if (!notification._id) {
				throw new Error("Failed to create notification");
			}

			return {
				...notification.toObject(),
				_id: notification._id.toString(),
				userId: notification.userId.toString(),
				organizationId: notification.organizationId?.toString(),
			};
		}),

	markAllAsRead: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			// Verify user is a member of this organization
			const membership = await Member.findOne({
				userId,
				organizationId: organization._id,
			}).lean();

			if (!membership) {
				throw new Error("You are not a member of this organization");
			}

			const organizationId = organization._id;

			// Mark all unread notifications as read and archived
			const result = await Notification.updateMany(
				{
					userId,
					organizationId,
					archived: false,
				},
				{
					$set: {
						read: true,
						archived: true,
						updatedAt: new Date(),
					},
				}
			);

			return {
				success: true,
				message: "All notifications marked as read and archived",
				count: result.modifiedCount,
			};
		}),
});

