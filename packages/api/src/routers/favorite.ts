import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { Favorite, FavoriteFolder } from "@relio/db/models/favorite.model";
import { Organization, Member } from "@relio/db/models/org.model";
import { Contact } from "@relio/db/models/contact.model";
import { Property } from "@relio/db/models/property.model";
import { Company } from "@relio/db/models/company.model";
import { ObjectView } from "@relio/db/models/object.model";

export const favoriteRouter = router({
	getAllFavorites: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
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

			// Get all favorites for this user and organization, sorted by position
			const favorites = await Favorite.find({
				userId,
				organizationId,
			})
				.sort({ position: 1, createdAt: -1 })
				.lean();

			// Populate records based on objectType
			const populatedFavorites = await Promise.all(
				favorites.map(async (favorite) => {
					let record = null;

					if (favorite.objectType === "contact") {
						record = await Contact.findOne({
							_id: favorite.objectId,
							organizationId,
							isDeleted: { $ne: true },
						}).lean();
					} else if (favorite.objectType === "property") {
						record = await Property.findOne({
							_id: favorite.objectId,
							organizationId,
							isDeleted: { $ne: true },
						}).lean();
					} else if (favorite.objectType === "company") {
						record = await Company.findOne({
							_id: favorite.objectId,
							organizationId,
							isDeleted: { $ne: true },
						}).lean();
					} else if (favorite.objectType === "view") {
						record = await ObjectView.findOne({
							_id: favorite.objectId,
							organizationId,
						}).lean();
					}

					// Add recordType to match the component's expectations
					if (record) {
						(record as any).recordType = favorite.objectType;
					}

					return {
						...favorite,
						record: record || null,
					};
				})
			);

			// Filter out favorites where the record was deleted or not found (except views which don't have isDeleted)
			return populatedFavorites.filter((favorite) => {
				if (favorite.objectType === "view") {
					return favorite.record !== null;
				}
				return favorite.record !== null;
			});
		}),

	toggleFavorite: protectedProcedure
		.input(
			z.object({
				recordId: z.string(),
				objectType: z.enum(["contact", "property", "company", "view"]),
				organizationSlug: z.string(),
				folderId: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const recordId = new mongoose.Types.ObjectId(input.recordId);

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

			// Check if record exists and user has access
			let record = null;
			if (input.objectType === "contact") {
				record = await Contact.findOne({
					_id: recordId,
					organizationId,
					isDeleted: { $ne: true },
				}).lean();
			} else if (input.objectType === "property") {
				record = await Property.findOne({
					_id: recordId,
					organizationId,
					isDeleted: { $ne: true },
				}).lean();
			} else if (input.objectType === "company") {
				record = await Company.findOne({
					_id: recordId,
					organizationId,
					isDeleted: { $ne: true },
				}).lean();
			} else if (input.objectType === "view") {
				record = await ObjectView.findOne({
					_id: recordId,
					organizationId,
				}).lean();
			}

			if (!record) {
				throw new Error("Record not found or no access to record");
			}

			// Check if favorite already exists
			const existingFavorite = await Favorite.findOne({
				userId,
				organizationId,
				objectId: recordId,
				objectType: input.objectType,
			}).lean();

			if (existingFavorite) {
				// Remove favorite
				await Favorite.deleteOne({ _id: existingFavorite._id });
				return { favorited: false };
			} else {
				// Get the next position (max position + 1000, or 1000 if no favorites)
				const maxPositionFavorite = await Favorite.findOne({
					userId,
					organizationId,
					folderId: input.folderId || null,
				})
					.sort({ position: -1 })
					.lean();

				const nextPosition = maxPositionFavorite?.position
					? maxPositionFavorite.position + 1000
					: 1000;

				// Add favorite
				const favorite = new Favorite({
					_id: new mongoose.Types.ObjectId(),
					objectId: recordId,
					objectType: input.objectType,
					userId,
					organizationId,
					folderId: input.folderId ? new mongoose.Types.ObjectId(input.folderId) : undefined,
					position: nextPosition,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				await favorite.save();
				return { favorited: true };
			}
		}),

	removeFavorite: protectedProcedure
		.input(
			z.object({
				recordId: z.string(),
				objectType: z.enum(["contact", "property", "company", "view"]),
				organizationSlug: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const recordId = new mongoose.Types.ObjectId(input.recordId);

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

			// Find and delete favorite
			const favorite = await Favorite.findOne({
				userId,
				organizationId,
				objectId: recordId,
				objectType: input.objectType,
			}).lean();

			if (favorite) {
				await Favorite.deleteOne({ _id: favorite._id });
			}

			return { success: true };
		}),

	updateFavorite: protectedProcedure
		.input(
			z.object({
				favoriteId: z.string(),
				organizationSlug: z.string(),
				folderId: z.string().nullable().optional(),
				position: z.number().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const favoriteId = new mongoose.Types.ObjectId(input.favoriteId);

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

			// Verify the favorite belongs to the user
			const favorite = await Favorite.findOne({
				_id: favoriteId,
				userId,
				organizationId,
			}).lean();

			if (!favorite) {
				throw new Error("Favorite not found or unauthorized");
			}

			// Update favorite
			const updateData: any = {
				updatedAt: new Date(),
			};

			if (input.folderId !== undefined) {
				updateData.folderId = input.folderId
					? new mongoose.Types.ObjectId(input.folderId)
					: null;
			}

			if (input.position !== undefined) {
				updateData.position = input.position;
			}

			await Favorite.updateOne({ _id: favoriteId }, updateData);

			return { success: true };
		}),

	getAllFolders: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
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

			// Get all folders for this user and organization, sorted by position
			const folders = await FavoriteFolder.find({
				userId,
				organizationId,
			})
				.sort({ position: 1, createdAt: -1 })
				.lean();

			return folders;
		}),

	createFolder: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				organizationSlug: z.string(),
				isOpen: z.boolean().optional().default(true),
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

			// Get the next position
			const maxPositionFolder = await FavoriteFolder.findOne({
				userId,
				organizationId,
			})
				.sort({ position: -1 })
				.lean();

			const nextPosition = maxPositionFolder?.position
				? maxPositionFolder.position + 1000
				: 1000;

			// Create folder
			const folder = new FavoriteFolder({
				_id: new mongoose.Types.ObjectId(),
				name: input.name,
				userId,
				organizationId,
				isOpen: input.isOpen ?? true,
				position: nextPosition,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await folder.save();

			return folder.toObject();
		}),

	updateFolder: protectedProcedure
		.input(
			z.object({
				folderId: z.string(),
				organizationSlug: z.string(),
				name: z.string().optional(),
				isOpen: z.boolean().optional(),
				position: z.number().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const folderId = new mongoose.Types.ObjectId(input.folderId);

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

			// Verify the folder belongs to the user
			const folder = await FavoriteFolder.findOne({
				_id: folderId,
				userId,
				organizationId,
			}).lean();

			if (!folder) {
				throw new Error("Folder not found or unauthorized");
			}

			// Update folder
			const updateData: any = {
				updatedAt: new Date(),
			};

			if (input.name !== undefined) {
				updateData.name = input.name;
			}

			if (input.isOpen !== undefined) {
				updateData.isOpen = input.isOpen;
			}

			if (input.position !== undefined) {
				updateData.position = input.position;
			}

			await FavoriteFolder.updateOne({ _id: folderId }, updateData);

			const updatedFolder = await FavoriteFolder.findOne({ _id: folderId }).lean();
			return updatedFolder;
		}),

	deleteFolder: protectedProcedure
		.input(
			z.object({
				folderId: z.string(),
				organizationSlug: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const folderId = new mongoose.Types.ObjectId(input.folderId);

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

			// Verify the folder belongs to the user
			const folder = await FavoriteFolder.findOne({
				_id: folderId,
				userId,
				organizationId,
			}).lean();

			if (!folder) {
				throw new Error("Folder not found or unauthorized");
			}

			// Move all favorites in this folder to root (remove folderId)
			await Favorite.updateMany(
				{
					userId,
					organizationId,
					folderId,
				},
				{
					$unset: { folderId: "" },
					updatedAt: new Date(),
				}
			);

			// Delete the folder
			await FavoriteFolder.deleteOne({ _id: folderId });

			return { success: true };
		}),
});

