import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { Task } from "@relio/db/models/task.model";
import { Organization, Member } from "@relio/db/models/org.model";

export const taskRouter = router({
	getTasks: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				status: z.string().optional(),
				assigneeId: z.string().optional(),
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

			// Build query
			const query: any = {
				organizationId,
			};

			if (input.status) {
				query.status = input.status;
			}

			if (input.assigneeId) {
				query.assigneeId = new mongoose.Types.ObjectId(input.assigneeId);
			}

			// Get tasks for this organization
			const tasks = await Task.find(query)
				.sort({ position: 1, createdAt: -1 })
				.lean();

			return tasks;
		}),
});


