import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { Organization, Member } from "@relio/db/models/org.model";
import { ObjectView } from "@relio/db/models/object.model";
import { User } from "@relio/db/models/auth.model";
import { ObjectViewTypeEnum } from "@relio/db/lib/types";

export const organizationRouter = router({
	getUserOrganizations: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				status: z.enum(["active", "pending", "disabled"]).optional(),
			})
		)
		.query(async ({ input, ctx }) => {
			const userIdString = input.id || ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			// Find all memberships for the user
			const memberships = await Member.find({ userId }).lean();

			if (!memberships || memberships.length === 0) {
				return [];
			}

			// Filter by status if provided
			// Note: Member schema doesn't have status field, so we'll get all memberships
			// If status filtering is needed, it should be added to the Member schema
			let filteredMemberships = memberships;

			// Get organization IDs
			const organizationIds = filteredMemberships.map(
				(member) => member.organizationId
			);

			// Fetch organizations
			const organizations = await Organization.find({
				_id: { $in: organizationIds },
			}).lean();

			return organizations;
		}),
		getCurrentOrganization: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.slug,
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

			return organization;
		}),
	createOrganization: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Organization name is required"),
				slug: z.string().optional(),
				logo: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const userIdString = ctx.session.user.id;
				const userId = new mongoose.Types.ObjectId(userIdString);

				// Generate slug from name if not provided
				let slug = input.slug || input.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "");

				// Check for disallowed slugs
				const disallowedSlugs = [
					"organization",
					"onboarding",
					"no-access",
					"signin",
					"signup",
					"organizations",
					"document",
					"api",
					"getImage",
				];

				if (disallowedSlugs.includes(slug.toLowerCase())) {
					throw new Error("This organization slug is not allowed");
				}

				// Ensure slug is unique by appending a number if needed
				// Only auto-generate unique slug if one wasn't explicitly provided
				let uniqueSlug = slug;
				if (!input.slug) {
					// Auto-generate unique slug if not provided
					let counter = 1;
					while (await Organization.findOne({ slug: uniqueSlug })) {
						uniqueSlug = `${slug}-${counter}`;
						counter++;
					}
				} else {
					// If slug was explicitly provided, check if it exists and throw error
					const existingOrg = await Organization.findOne({ slug }).lean();
					if (existingOrg) {
						throw new Error("Organization with that slug already exists");
					}
				}

				// Create the organization
				const organization = new Organization({
					_id: new mongoose.Types.ObjectId(),
					name: input.name,
					slug: uniqueSlug,
					logo: input.logo,
					createdAt: new Date(),
				});

				await organization.save();

				// Create a member record for the creator (as owner)
				const member = new Member({
					_id: new mongoose.Types.ObjectId(),
					userId,
					organizationId: organization._id,
					role: "owner",
					createdAt: new Date(),
				});

				await member.save();

				// Create default contact view for the organization
				try {
					// Ensure no other default views exist for this organization/objectType
					// (This should be the first view, but we ensure uniqueness anyway)
					await ObjectView.updateMany(
						{
							organizationId: organization._id,
							objectType: "contact",
							isDefault: true,
						},
						{
							$set: { isDefault: false },
						}
					);

					const defaultContactView = new ObjectView({
						name: "All Contacts",
						objectType: "contact",
						organizationId: organization._id,
						columnDefs: [
							{ field: "firstName", headerName: "Name", width: 200, pinned: "left" },
							{ field: "email", headerName: "Email", width: 250 },
							{ field: "title", headerName: "Title", width: 200 },
							{ field: "status", headerName: "Status", width: 150 },
						],
						viewType: ObjectViewTypeEnum.TABLE,
						sortBy: "createdAt",
						sortDirection: "desc",
						isDefault: true,
						isPublic: true,
						createdBy: userId,
						createdAt: new Date(),
					});

					await defaultContactView.save();
				} catch (viewError) {
					console.error("Error creating default contact view:", viewError);
					// Continue even if view creation fails - organization is already created
				}

				// Update user's onboarding status if needed
				try {
					const user = await User.findById(userId);
					if (user && !user.onboardingComplete) {
						user.onboardingComplete = true;
						await user.save();
					}
				} catch (userError) {
					console.error("Error updating user onboarding status:", userError);
					// Continue even if user update fails
				}

				return organization.toObject();
			} catch (error) {
				console.error("Error creating organization:", error);
				throw error;
			}
		}),
});

