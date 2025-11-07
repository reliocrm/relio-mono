import z from "zod";
import mongoose from "mongoose";
import { router, protectedProcedure } from "../index";
import { ObjectView, UserViewPreference } from "@relio/db/models/object.model";
import { Organization } from "@relio/db/models/org.model";
import { Contact } from "@relio/db/models/contact.model";
import { Property } from "@relio/db/models/property.model";
import {
	advancedFilterToMongoQuery,
	buildSearchQuery,
	combineFilterAndSearch,
} from "../lib/filter-parser";

export const viewRouter = router({
	getDefaultView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string().default("contact"),
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

			const organizationId = organization._id;

			// First, try to get user's preferred view
			const userPreference = await UserViewPreference.findOne({
				userId,
				organizationId,
				objectType: input.objectType,
			}).lean();

			if (userPreference && userPreference.viewId) {
				return {
					viewId: userPreference.viewId.toString(),
				};
			}

			// If no user preference, get the default view for the organization
			const defaultView = await ObjectView.findOne({
				organizationId,
				objectType: input.objectType,
				isDefault: true,
			}).lean();

			if (defaultView && defaultView._id) {
				return {
					viewId: defaultView._id.toString(),
				};
			}

			// If no default view, get the first view for this object type
			const firstView = await ObjectView.findOne({
				organizationId,
				objectType: input.objectType,
			}).lean();

			if (firstView && firstView._id) {
				return {
					viewId: firstView._id.toString(),
				};
			}

			throw new Error("No view found for this organization and object type");
		}),
	getViewById: protectedProcedure
		.input(
			z.object({
				viewId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const viewId = new mongoose.Types.ObjectId(input.viewId);
			const view = await ObjectView.findOne({ _id: viewId }).lean();

			if (!view) {
				throw new Error("View not found");
			}

			return view;
		}),
	getContactsForView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				viewId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(50),
				filters: z.any().optional(), // AdvancedFilter structure
				search: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			const organizationId = organization._id;

			// Get the view to apply filters
			const viewId = new mongoose.Types.ObjectId(input.viewId);
			const view = await ObjectView.findOne({
				_id: viewId,
				organizationId,
			}).lean();

			if (!view) {
				throw new Error("View not found");
			}

			// Base query
			const baseQuery: any = {
				organizationId,
				isDeleted: { $ne: true },
			};

			// Convert advanced filters to MongoDB query
			let filterQuery: any = {};
			if (input.filters) {
				try {
					filterQuery = advancedFilterToMongoQuery(input.filters);
				} catch (error) {
					console.error("Error parsing filters:", error);
					// Continue with empty filter query if parsing fails
				}
			}

			// Build search query
			const searchableFields = ["firstName", "lastName", "email", "phone", "company"];
			const searchQuery = buildSearchQuery(input.search || "", searchableFields);

			// Combine all queries
			const combinedQuery = combineFilterAndSearch(filterQuery, searchQuery);
			const query = Object.keys(combinedQuery).length > 0
				? { ...baseQuery, ...combinedQuery }
				: baseQuery;

			// Get total count (before pagination)
			const total = await Contact.countDocuments(query);

			// Calculate pagination
			const page = input.page || 1;
			const limit = input.limit || 50;
			const skip = (page - 1) * limit;
			const totalPages = Math.ceil(total / limit);

			// Apply sorting if specified in view
			let sortQuery: any = {};
			if (view.sortBy) {
				sortQuery[view.sortBy] = view.sortDirection === "desc" ? -1 : 1;
			} else {
				// Default sort by createdAt descending
				sortQuery.createdAt = -1;
			}

			// Get paginated contacts
			const contacts = await Contact.find(query)
				.sort(sortQuery)
				.skip(skip)
				.limit(limit)
				.lean();

			return {
				contacts,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			};
		}),
	getPropertiesForView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				viewId: z.string(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(50),
			})
		)
		.query(async ({ input }) => {
			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			const organizationId = organization._id;

			// Get the view to apply filters
			const viewId = new mongoose.Types.ObjectId(input.viewId);
			const view = await ObjectView.findOne({
				_id: viewId,
				organizationId,
			}).lean();

			if (!view) {
				throw new Error("View not found");
			}

			// Build query based on view filters
			const query: any = {
				organizationId,
				isDeleted: { $ne: true },
			};

			// Apply filters from view if they exist
			if (view.filters && Array.isArray(view.filters) && view.filters.length > 0) {
				// This is a simplified version - you may need to handle more complex filter logic
				view.filters.forEach((filter: any) => {
					if (filter.field && filter.value !== undefined) {
						if (filter.operator === "equals") {
							query[filter.field] = filter.value;
						} else if (filter.operator === "contains") {
							query[filter.field] = { $regex: filter.value, $options: "i" };
						}
						// Add more filter operators as needed
					}
				});
			}

			// Get total count
			const total = await Property.countDocuments(query);

			// Calculate pagination
			const page = input.page || 1;
			const limit = input.limit || 50;
			const skip = (page - 1) * limit;
			const totalPages = Math.ceil(total / limit);

			// Apply sorting if specified in view
			let sortQuery: any = {};
			if (view.sortBy) {
				sortQuery[view.sortBy] = view.sortDirection === "desc" ? -1 : 1;
			} else {
				// Default sort by createdAt descending
				sortQuery.createdAt = -1;
			}

			// Get paginated properties
			const properties = await Property.find(query)
				.sort(sortQuery)
				.skip(skip)
				.limit(limit)
				.lean();

			return {
				properties,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			};
		}),
	getViewsByObjectType: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string(),
			})
		)
		.query(async ({ input }) => {
			// Get organization by slug
			const organization = await Organization.findOne({
				slug: input.organizationSlug,
			}).lean();

			if (!organization) {
				throw new Error("Organization not found");
			}

			const organizationId = organization._id;

			// Get all views for this object type
			const views = await ObjectView.find({
				organizationId,
				objectType: input.objectType,
			})
				.sort({ isDefault: -1, createdAt: -1 })
				.lean();

			return views.map((view) => ({
				...view,
				id: view._id.toString(),
			}));
		}),
	updateView: protectedProcedure
		.input(
			z.object({
				viewId: z.string(),
				name: z.string().optional(),
				columnDefs: z.any().optional(),
				filters: z.any().optional(),
				filterCondition: z.enum(["and", "or"]).optional(),
				sortBy: z.string().nullable().optional(),
				sortDirection: z.enum(["asc", "desc"]).nullable().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const viewId = new mongoose.Types.ObjectId(input.viewId);

			const view = await ObjectView.findOne({ _id: viewId }).lean();

			if (!view) {
				throw new Error("View not found");
			}

			// Verify user has permission (created the view or is in the organization)
			// For now, we'll allow updates if the view exists
			const updateData: any = {
				updatedAt: new Date(),
			};

			if (input.name !== undefined) {
				updateData.name = input.name;
			}
			if (input.columnDefs !== undefined) {
				updateData.columnDefs = input.columnDefs;
			}
			if (input.filters !== undefined) {
				updateData.filters = input.filters;
			}
			if (input.filterCondition !== undefined) {
				updateData.filterCondition = input.filterCondition;
			}
			if (input.sortBy !== undefined) {
				updateData.sortBy = input.sortBy;
			}
			if (input.sortDirection !== undefined) {
				updateData.sortDirection = input.sortDirection;
			}

			const updatedView = await ObjectView.findOneAndUpdate(
				{ _id: viewId },
				updateData,
				{ new: true }
			).lean();

			if (!updatedView) {
				throw new Error("Failed to update view");
			}

			return {
				...updatedView,
				id: updatedView._id.toString(),
			};
		}),
	deleteView: protectedProcedure
		.input(
			z.object({
				viewId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const viewId = new mongoose.Types.ObjectId(input.viewId);

			const view = await ObjectView.findOne({ _id: viewId }).lean();

			if (!view) {
				throw new Error("View not found");
			}

			// Don't allow deleting default views
			if (view.isDefault) {
				throw new Error("Cannot delete default view");
			}

			// Delete the view
			await ObjectView.deleteOne({ _id: viewId });

			// Also remove any user preferences that reference this view
			await UserViewPreference.deleteMany({ viewId });

			return { success: true };
		}),
	createView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string(),
				name: z.string(),
				viewType: z.enum(["table", "kanban", "map"]).default("table"),
				statusAttribute: z.string().optional(),
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

			const organizationId = organization._id;

			// Get default view to copy columnDefs from
			const defaultView = await ObjectView.findOne({
				organizationId,
				objectType: input.objectType,
				isDefault: true,
			}).lean();

			// Create new view
			const newView = new ObjectView({
				name: input.name,
				objectType: input.objectType,
				organizationId,
				columnDefs: defaultView?.columnDefs || [],
				cardRowFields: defaultView?.cardRowFields || [],
				showAttributeLabels: defaultView?.showAttributeLabels ?? true,
				filters: defaultView?.filters || [],
				filterCondition: defaultView?.filterCondition || "and",
				viewType: input.viewType,
				statusAttribute: input.statusAttribute,
				kanbanConfig: input.viewType === "kanban" ? defaultView?.kanbanConfig || {} : undefined,
				sortBy: defaultView?.sortBy,
				sortDirection: defaultView?.sortDirection || "desc",
				mapConfig: input.viewType === "map" ? defaultView?.mapConfig || {} : undefined,
				createdBy: userId,
				isDefault: false,
				isPublic: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await newView.save();

			return {
				...newView.toObject(),
				id: newView._id.toString(),
			};
		}),
	duplicateView: protectedProcedure
		.input(
			z.object({
				viewId: z.string(),
				currentFilters: z.array(z.any()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const viewId = new mongoose.Types.ObjectId(input.viewId);
			const userIdString = ctx.session.user.id;
			const userId = new mongoose.Types.ObjectId(userIdString);

			const originalView = await ObjectView.findOne({ _id: viewId }).lean();

			if (!originalView) {
				throw new Error("View not found");
			}

			// Create a duplicate with "Copy of" prefix
			const duplicatedView = new ObjectView({
				name: `Copy of ${originalView.name}`,
				objectType: originalView.objectType,
				organizationId: originalView.organizationId,
				columnDefs: originalView.columnDefs,
				cardRowFields: originalView.cardRowFields,
				showAttributeLabels: originalView.showAttributeLabels,
				filters: input.currentFilters || originalView.filters,
				filterCondition: originalView.filterCondition,
				viewType: originalView.viewType,
				statusAttribute: originalView.statusAttribute,
				kanbanConfig: originalView.kanbanConfig,
				sortBy: originalView.sortBy,
				sortDirection: originalView.sortDirection,
				mapConfig: originalView.mapConfig,
				createdBy: userId,
				isDefault: false, // Duplicated views are never default
				isPublic: originalView.isPublic,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await duplicatedView.save();

			return {
				...duplicatedView.toObject(),
				id: duplicatedView._id.toString(),
			};
		}),
	getUserDefaultView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string(),
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

			const organizationId = organization._id;

			// Get user's preferred view
			const userPreference = await UserViewPreference.findOne({
				userId,
				organizationId,
				objectType: input.objectType,
			}).lean();

			if (userPreference && userPreference.viewId) {
				const view = await ObjectView.findOne({
					_id: userPreference.viewId,
				}).lean();

				if (view) {
					return {
						...view,
						id: view._id.toString(),
					};
				}
			}

			return null;
		}),
	setUserDefaultView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string(),
				viewId: z.string(),
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

			const organizationId = organization._id;
			const viewId = new mongoose.Types.ObjectId(input.viewId);

			// Verify view exists and belongs to organization
			const view = await ObjectView.findOne({
				_id: viewId,
				organizationId,
			}).lean();

			if (!view) {
				throw new Error("View not found");
			}

			// Update or create user preference
			// The unique index on (userId, organizationId, objectType) ensures only one default view
			// per user/organization/objectType combination. This findOneAndUpdate will replace
			// any existing default view for this combination.
			
			// First, ensure we don't have any duplicate preferences (safety check)
			// This shouldn't happen due to the unique index, but we'll clean up just in case
			const existingPreferences = await UserViewPreference.find({
				userId,
				organizationId,
				objectType: input.objectType,
			}).lean();
			
			if (existingPreferences.length > 1) {
				// Keep only the most recent one, delete the rest
				const sorted = existingPreferences.sort((a, b) => {
					const aTime = a.updatedAt?.getTime() || a.createdAt?.getTime() || 0;
					const bTime = b.updatedAt?.getTime() || b.createdAt?.getTime() || 0;
					return bTime - aTime;
				});
				
				// Delete all except the most recent
				const idsToDelete = sorted.slice(1).map(p => p._id);
				if (idsToDelete.length > 0) {
					await UserViewPreference.deleteMany({ _id: { $in: idsToDelete } });
				}
			}
			
			// Now update or create the preference
			await UserViewPreference.findOneAndUpdate(
				{
					userId,
					organizationId,
					objectType: input.objectType,
				},
				{
					userId,
					organizationId,
					objectType: input.objectType,
					viewId,
					updatedAt: new Date(),
				},
				{
					upsert: true,
					new: true,
				}
			);

			// Also update the isDefault field on ObjectView documents
			// First, unset isDefault for all other views in this organization/objectType
			await ObjectView.updateMany(
				{
					organizationId,
					objectType: input.objectType,
					_id: { $ne: viewId },
					isDefault: true,
				},
				{
					$set: { isDefault: false, updatedAt: new Date() },
				}
			);

			// Then set isDefault to true for the selected view
			await ObjectView.findOneAndUpdate(
				{
					_id: viewId,
					organizationId,
				},
				{
					$set: { isDefault: true, updatedAt: new Date() },
				}
			);

			return { success: true };
		}),
	removeUserDefaultView: protectedProcedure
		.input(
			z.object({
				organizationSlug: z.string(),
				objectType: z.string(),
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

			const organizationId = organization._id;

			// Remove user preference
			await UserViewPreference.deleteOne({
				userId,
				organizationId,
				objectType: input.objectType,
			});

			return { success: true };
		}),
});

