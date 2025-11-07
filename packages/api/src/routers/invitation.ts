import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { Invitation, Organization, Member } from "@relio/db/models/org.model";
import { User } from "@relio/db/models/auth.model";

export const invitationRouter = router({
	createInvitations: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				invitations: z.array(
					z.object({
						email: z.string().email(),
						role: z.string().min(1),
					})
				),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);
			const organizationId = new mongoose.Types.ObjectId(input.organizationId);

			// Verify organization exists
			const organization = await Organization.findById(organizationId).lean();
			if (!organization) {
				throw new Error("Organization not found");
			}

			// Verify user is a member of the organization
			const membership = await Member.findOne({
				userId,
				organizationId,
			}).lean();

			if (!membership) {
				throw new Error("You are not a member of this organization");
			}

			// Verify user has permission to invite (owner or admin)
			if (membership.role !== "owner" && membership.role !== "admin") {
				throw new Error("You do not have permission to invite members");
			}

			// Create invitations
			const createdInvitations = [];
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // Invitations expire in 7 days

			for (const invite of input.invitations) {
				// Check if user already exists
				const existingUser = await User.findOne({
					email: invite.email.toLowerCase(),
				}).lean();

				// Check if user is already a member
				if (existingUser) {
					const existingMember = await Member.findOne({
						userId: existingUser._id,
						organizationId,
					}).lean();

					if (existingMember) {
						// Skip creating invitation if user is already a member
						continue;
					}
				}

				// Check if there's already a pending invitation for this email
				const existingInvitation = await Invitation.findOne({
					organizationId,
					email: invite.email.toLowerCase(),
					status: "pending",
				}).lean();

				if (existingInvitation) {
					// Update existing invitation instead of creating a new one
					await Invitation.updateOne(
						{ _id: existingInvitation._id },
						{
							$set: {
								role: invite.role,
								expiresAt,
								inviterId: userId,
							},
						}
					);
					createdInvitations.push({
						...existingInvitation,
						role: invite.role,
						expiresAt,
					});
					continue;
				}

				// Create new invitation
				const invitation = new Invitation({
					organizationId,
					email: invite.email.toLowerCase(),
					role: invite.role,
					status: "pending",
					expiresAt,
					inviterId: userId,
				});

				await invitation.save();
				createdInvitations.push(invitation.toObject());
			}

			return {
				success: true,
				invitations: createdInvitations,
			};
		}),
});

