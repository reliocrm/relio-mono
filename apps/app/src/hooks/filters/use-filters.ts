import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import type { FilterCondition } from "@/components/objects/filter-bar";

// Backend filter structure
interface FilterGroup {
	id: string;
	logicalOperator: "and" | "or";
	conditions: FilterCondition[];
}

interface AdvancedFilter {
	groups: FilterGroup[];
	globalLogicalOperator: "and" | "or";
}

interface UseFiltersOptions {
	organizationSlug: string;
	objectType: "contact" | "property" | "company";
	viewId?: string;
}

export function useFilters({
	organizationSlug,
	objectType,
	viewId,
}: UseFiltersOptions) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// Get current view filters from view data
	const viewQuery = useQuery(
		trpc.view.getViewById.queryOptions({
			viewId: viewId || "",
		})
	);

	// Extract filters from view (flatten from advanced filter structure)
	const currentFilters = React.useMemo<FilterCondition[]>(() => {
		const view = viewQuery.data;
		
		// Handle both legacy simple filters array and new advanced filter structure
		if (view?.filters) {
			// If it's a simple array (legacy format)
			if (Array.isArray(view.filters)) {
				return view.filters.map((filter: any, index: number) => ({
					id: filter.id || `filter-${index}`,
					field: filter.field || "",
					operator: filter.operator || "",
					value: filter.value,
					valueFrom: filter.valueFrom,
					valueTo: filter.valueTo,
				}));
			}
			
			// If it's advanced filter structure
			if (view.filters.groups && Array.isArray(view.filters.groups)) {
				return view.filters.groups.flatMap((group: any) =>
					group.conditions?.map((condition: any, index: number) => ({
						id: condition.id || `filter-${group.id}-${index}`,
						field: condition.field || "",
						operator: condition.operator || "",
						value: condition.value,
						valueFrom: condition.valueFrom,
						valueTo: condition.valueTo,
					})) || []
				);
			}
		}
		
		return [];
	}, [viewQuery.data]);

	// Update view filters mutation
	const updateViewFiltersMutation = useMutation(
		trpc.view.updateView.mutationOptions({
			onSuccess: async () => {
				console.log("Filter update successful, invalidating queries...");
				
				// Invalidate view queries first
				await queryClient.invalidateQueries({
					queryKey: [["view", "getViewById"]],
				});
				await queryClient.invalidateQueries({
					queryKey: [["view", "getViewsByObjectType"]],
				});

				// Invalidate all data queries for this view to force refetch with new filters
				// This ensures the backend reads the updated filters from the view
				if (objectType === "contact") {
					await queryClient.invalidateQueries({
						queryKey: [["view", "getContactsForView"]],
					});
					console.log("Invalidated getContactsForView queries");
				} else if (objectType === "property") {
					await queryClient.invalidateQueries({
						queryKey: [["view", "getPropertiesForView"]],
					});
					console.log("Invalidated getPropertiesForView queries");
				} else if (objectType === "company") {
					await queryClient.invalidateQueries({
						queryKey: [["view", "getCompaniesForView"]],
					});
					console.log("Invalidated getCompaniesForView queries");
				}
			},
			onError: (error) => {
				console.error("Failed to update filters:", error);
			},
		})
	);

	const updateFilters = React.useCallback(
		(filters: FilterCondition[]) => {
			if (!viewId) {
				console.error("No view ID provided");
				return;
			}

			// Convert simple filter array to advanced filter structure
			const advancedFilter: AdvancedFilter = {
				groups: filters.length > 0 ? [{
					id: "default-group",
					logicalOperator: "and",
					conditions: filters.map((filter) => ({
						id: filter.id,
						field: filter.field,
						operator: filter.operator,
						value: filter.value,
						valueFrom: filter.valueFrom,
						valueTo: filter.valueTo,
					})),
				}] : [],
				globalLogicalOperator: "and",
			};

			console.log("Updating filters:", { viewId, filters, advancedFilter });

			updateViewFiltersMutation.mutate({
				viewId,
				filters: advancedFilter,
			});
		},
		[updateViewFiltersMutation, viewId]
	);

	return {
		filters: currentFilters,
		updateFilters,
		isUpdating: updateViewFiltersMutation.isPending,
		updateError: updateViewFiltersMutation.error,
	};
}
