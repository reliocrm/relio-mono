import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure, publicProcedure } from "../index";
import { Note } from "@relio/db/models/note.model";
import { Organization, Member } from "@relio/db/models/org.model";

export const noteRouter = router({
	getNotes: protectedProcedure
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

			// Get notes for this organization
			const notes = await Note.find({
				orgId: organizationId,
				isDeleted: { $ne: true },
			})
				.sort({ updatedAt: -1, createdAt: -1 })
				.lean();

			return notes;
		}),

	createNote: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				title: z.string().min(1),
				content: z.string().optional(),
				parentDocument: z.string().optional(),
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

			// Create note
			const note = await Note.create({
				orgId: organizationId,
				userId,
				title: input.title,
				content: input.content || "",
				parentDocument: input.parentDocument
					? new mongoose.Types.ObjectId(input.parentDocument)
					: null,
				updatedAt: new Date(),
			});

			return note.toObject();
		}),

	getPublicNote: publicProcedure
		.input(
			z.object({
				noteId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const noteId = new mongoose.Types.ObjectId(input.noteId);

			// Get note - only if published
			const note = await Note.findOne({
				_id: noteId,
				isPublished: true,
				isDeleted: { $ne: true },
			}).lean();

			if (!note) {
				throw new Error("Note not found or not published");
			}

			return note;
		}),
});



