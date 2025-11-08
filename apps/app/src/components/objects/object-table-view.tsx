"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { TableView } from "./table-view";
import { getColumnsForObjectType, convertColumnDefsToColumns } from "@/lib/table-columns.tsx";
import { useUpdateView } from "@/hooks/views";
// TableData type - can be Contact, Company, or Property
type TableData = Record<string, any> & {
	_id?: any;
	id?: string;
};

interface ObjectTableViewProps {
	organizationSlug: string;
	objectType: "contact" | "company" | "property";
	viewId: string;
}

export function ObjectTableView({
	organizationSlug,
	objectType,
	viewId,
}: ObjectTableViewProps) {
	const trpc = useTRPC();
	const { updateView } = useUpdateView();
	const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
	const [columnAggregations, setColumnAggregations] = React.useState<Record<string, string>>({});
	const [page, setPage] = React.useState(1);
	const [hasReachedEnd, setHasReachedEnd] = React.useState(false);
	
	// Track page changes
	React.useEffect(() => {
		console.log("📄 Page state changed to:", page);
	}, [page]);
	const [accumulatedData, setAccumulatedData] = React.useState<TableData[]>([]);
	const pageSize = 100;

	// Fetch view configuration
	const viewQuery = useQuery(
		trpc.view.getViewById.queryOptions({
			viewId,
		})
	);

	// Fetch data based on object type
	const contactsQuery = useQuery({
		...trpc.view.getContactsForView.queryOptions({
			organizationSlug,
			viewId,
			page,
			limit: pageSize,
		}),
		enabled: objectType === "contact" && !!viewId,
	});

	const propertiesQuery = useQuery({
		...trpc.view.getPropertiesForView.queryOptions({
			organizationSlug,
			viewId,
			page,
			limit: pageSize,
		}),
		enabled: objectType === "property" && !!viewId,
	});

	const companiesQuery = useQuery({
		...trpc.view.getCompaniesForView.queryOptions({
			organizationSlug,
			viewId,
			page,
			limit: pageSize,
		}),
		enabled: objectType === "company" && !!viewId,
	});

	// Get base columns for object type
	const baseColumns = React.useMemo(
		() => getColumnsForObjectType(objectType),
		[objectType]
	);

	// Convert view columnDefs to table columns
	const columns = React.useMemo(() => {
		if (!viewQuery.data?.columnDefs) return baseColumns;
		return convertColumnDefsToColumns(viewQuery.data.columnDefs, baseColumns, objectType);
	}, [viewQuery.data?.columnDefs, baseColumns, objectType]);

	// Build aggregation request payload
	const aggregationPayload = React.useMemo(() => {
		type AggregationType = "none" | "count-empty" | "count-filled" | "percent-empty" | "percent-filled" | "sum" | "avg" | "min" | "max";
		const payload: Record<string, { type: AggregationType; columnDef?: any }> = {};
		
		// Only include non-"none" aggregations
		Object.entries(columnAggregations).forEach(([columnId, aggType]) => {
			if (aggType !== "none") {
				// Find the column definition - check both id and accessorKey
				const column = columns.find((col) => {
					const id = (col as any).id;
					const accessorKey = (col as any).accessorKey;
					return id === columnId || accessorKey === columnId;
				});
				
				if (column) {
					// Use accessorKey as the key for backend, fallback to columnId
					const accessorKey = (column as any).accessorKey || (column as any).id || columnId;
					payload[accessorKey] = {
						type: aggType as AggregationType,
						columnDef: (column as any).meta?.columnDef || column,
					};
				}
			}
		});
		
		return payload;
	}, [columnAggregations, columns]);

	// Fetch aggregations from backend when they change
	const aggregationsQuery = useQuery({
		...trpc.view.getAggregationsForView.queryOptions({
			organizationSlug,
			viewId,
			objectType,
			aggregations: aggregationPayload,
		}),
		enabled: Object.keys(aggregationPayload).length > 0 && !!viewId,
	});

	// Track the viewId that the accumulated data belongs to
	const accumulatedDataViewIdRef = React.useRef<string>(viewId);
	
	// Track the filters to detect when they change
	// Initialize with empty string to detect first real filter change
	const previousFiltersRef = React.useRef<string>("");
	
	// Track when filters changed to ensure we only use fresh data
	const filterChangeTimestampRef = React.useRef<number>(0);

	// Reset accumulated data when viewId changes
	React.useEffect(() => {
		if (accumulatedDataViewIdRef.current !== viewId) {
			accumulatedDataViewIdRef.current = viewId;
			setAccumulatedData([]);
			setPage(1);
			setHasReachedEnd(false); // Reset end flag when changing views
			console.log("🔄 ViewId changed - resetting pagination state");
			// Reset filters ref when viewId changes to detect filter changes in new view
			previousFiltersRef.current = "";
			// Reset filter change timestamp
			filterChangeTimestampRef.current = 0;
		}
	}, [viewId]);

	// Reset accumulated data when filters change
	React.useEffect(() => {
		const currentFilters = JSON.stringify(viewQuery.data?.filters || {});
		// Reset if filters changed (including going from empty to non-empty or vice versa)
		if (previousFiltersRef.current !== currentFilters) {
			// Skip reset on initial mount (when ref is empty string)
			if (previousFiltersRef.current !== "") {
				console.log("🔄 Filters changed - resetting pagination state and accumulated data", {
					previous: previousFiltersRef.current,
					current: currentFilters
				});
				setAccumulatedData([]);
				setPage(1);
				setHasReachedEnd(false);
				// Record when filters changed to ensure we only use fresh data
				filterChangeTimestampRef.current = Date.now();
			}
			previousFiltersRef.current = currentFilters;
		}
	}, [viewQuery.data?.filters]);

	// Accumulate data as pages load
	React.useEffect(() => {
		// Only accumulate data if it matches the current viewId
		// This prevents accumulating stale data from a previous viewId
		if (accumulatedDataViewIdRef.current !== viewId) {
			return;
		}

		// Don't accumulate if query is still loading or fetching for page 1 (initial load or refetch)
		// EXCEPT when accumulatedData is empty (filter was just reset) - in that case, we want to update
		// even if fetching to replace the empty state with new filtered data
		// For pages > 1, we allow accumulation even if fetching (for infinite scroll)
		if (page === 1 && accumulatedData.length > 0 && (
			(objectType === "contact" && (contactsQuery.isLoading || contactsQuery.isFetching)) ||
			(objectType === "property" && (propertiesQuery.isLoading || propertiesQuery.isFetching)) ||
			(objectType === "company" && (companiesQuery.isLoading || companiesQuery.isFetching))
		)) {
			return;
		}

		if (objectType === "contact" && contactsQuery.data?.contacts) {
			// If filters were recently changed and we're waiting for fresh data,
			// don't use stale cached data - wait for the refetch to complete
			if (filterChangeTimestampRef.current > 0 && 
			    contactsQuery.isFetching && 
			    !contactsQuery.isLoading &&
			    accumulatedData.length === 0) {
				console.log("⏳ Waiting for fresh data after filter change...");
				return;
			}
			
			// Once fresh data arrives after filter change, reset the timestamp
			if (filterChangeTimestampRef.current > 0 && !contactsQuery.isFetching) {
				filterChangeTimestampRef.current = 0;
			}

			console.log("🔄 Contact data received:", {
				page,
				newContactsCount: contactsQuery.data.contacts.length,
				totalCount: contactsQuery.data.pagination?.total,
				currentAccumulatedCount: accumulatedData.length,
				isLoading: contactsQuery.isLoading,
				isFetching: contactsQuery.isFetching,
				isPlaceholderData: contactsQuery.isPlaceholderData
			});
			
			setAccumulatedData((prev) => {
				// If we're on page 1, replace all data. Otherwise, append new data
				if (page === 1) {
					console.log("📝 Page 1: Replacing all data with", contactsQuery.data.contacts.length, "contacts");
					return contactsQuery.data.contacts as TableData[];
				}
				// Append new contacts, avoiding duplicates
				const newContacts = contactsQuery.data.contacts as TableData[];
				const existingIds = new Set(prev.map((item) => (item as any)._id?.toString() || (item as any).id));
				const uniqueNew = newContacts.filter((item) => {
					const id = (item as any)._id?.toString() || (item as any).id;
					return !existingIds.has(id);
				});
				console.log("📝 Page", page + ": Appending", uniqueNew.length, "new contacts. Total will be:", prev.length + uniqueNew.length);
				
				// If no new unique contacts were added and we're on page > 1, we've reached the end
				if (uniqueNew.length === 0 && page > 1) {
					console.log("🏁 No more unique contacts to add - reached end of data");
					setHasReachedEnd(true);
				}
				
				return [...prev, ...uniqueNew];
			});
		} else if (objectType === "property" && propertiesQuery.data?.properties) {
			// If filters were recently changed and we're waiting for fresh data,
			// don't use stale cached data - wait for the refetch to complete
			if (filterChangeTimestampRef.current > 0 && 
			    propertiesQuery.isFetching && 
			    !propertiesQuery.isLoading &&
			    accumulatedData.length === 0) {
				console.log("⏳ Waiting for fresh data after filter change...");
				return;
			}
			
			// Once fresh data arrives after filter change, reset the timestamp
			if (filterChangeTimestampRef.current > 0 && !propertiesQuery.isFetching) {
				filterChangeTimestampRef.current = 0;
			}

			setAccumulatedData((prev) => {
				if (page === 1) {
					return propertiesQuery.data.properties as TableData[];
				}
				const newProperties = propertiesQuery.data.properties as TableData[];
				const existingIds = new Set(prev.map((item) => (item as any)._id?.toString() || (item as any).id));
				const uniqueNew = newProperties.filter((item) => {
					const id = (item as any)._id?.toString() || (item as any).id;
					return !existingIds.has(id);
				});
				
				// If no new unique properties and we're on page > 1, we've reached the end
				if (uniqueNew.length === 0 && page > 1) {
					console.log("🏁 No more unique properties to add - reached end of data");
					setHasReachedEnd(true);
				}
				
				return [...prev, ...uniqueNew];
			});
		} else if (objectType === "company" && companiesQuery.data?.companies) {
			// If filters were recently changed and we're waiting for fresh data,
			// don't use stale cached data - wait for the refetch to complete
			if (filterChangeTimestampRef.current > 0 && 
			    companiesQuery.isFetching && 
			    !companiesQuery.isLoading &&
			    accumulatedData.length === 0) {
				console.log("⏳ Waiting for fresh data after filter change...");
				return;
			}
			
			// Once fresh data arrives after filter change, reset the timestamp
			if (filterChangeTimestampRef.current > 0 && !companiesQuery.isFetching) {
				filterChangeTimestampRef.current = 0;
			}

			setAccumulatedData((prev) => {
				if (page === 1) {
					return companiesQuery.data.companies as TableData[];
				}
				const newCompanies = companiesQuery.data.companies as TableData[];
				const existingIds = new Set(prev.map((item) => (item as any)._id?.toString() || (item as any).id));
				const uniqueNew = newCompanies.filter((item) => {
					const id = (item as any)._id?.toString() || (item as any).id;
					return !existingIds.has(id);
				});
				
				// If no new unique companies and we're on page > 1, we've reached the end
				if (uniqueNew.length === 0 && page > 1) {
					console.log("🏁 No more unique companies to add - reached end of data");
					setHasReachedEnd(true);
				}
				
				return [...prev, ...uniqueNew];
			});
		}
	}, [objectType, contactsQuery.data, contactsQuery.isLoading, contactsQuery.isFetching, propertiesQuery.data, propertiesQuery.isLoading, propertiesQuery.isFetching, companiesQuery.data, companiesQuery.isLoading, companiesQuery.isFetching, page, viewId]);

	// Get data based on object type - use accumulated data
	const data = React.useMemo(() => {
		return accumulatedData;
	}, [accumulatedData]);

	// Get total count for infinite scroll support
	const totalCount = React.useMemo(() => {
		let count;
		if (objectType === "contact") {
			count = contactsQuery.data?.pagination?.total;
		} else if (objectType === "property") {
			count = propertiesQuery.data?.pagination?.total;
		} else if (objectType === "company") {
			count = companiesQuery.data?.pagination?.total;
		}
		
		console.log("📊 Total count updated:", {
			objectType,
			totalCount: count,
			currentDataLength: accumulatedData.length
		});
		
		return count;
	}, [objectType, contactsQuery.data?.pagination?.total, propertiesQuery.data?.pagination?.total, companiesQuery.data?.pagination?.total, accumulatedData.length]);

	const isLoading =
		viewQuery.isLoading ||
		(objectType === "contact" && contactsQuery.isLoading && page === 1) ||
		(objectType === "property" && propertiesQuery.isLoading && page === 1) ||
		(objectType === "company" && companiesQuery.isLoading && page === 1);
	
	const isLoadingMore =
		(objectType === "contact" && contactsQuery.isLoading && page > 1) ||
		(objectType === "property" && propertiesQuery.isLoading && page > 1) ||
		(objectType === "company" && companiesQuery.isLoading && page > 1);
		
	// Track isLoadingMore changes
	React.useEffect(() => {
		console.log("⏳ isLoadingMore state changed:", {
			isLoadingMore,
			page,
			objectType,
			contactsLoading: objectType === "contact" ? contactsQuery.isLoading : "N/A",
			propertiesLoading: objectType === "property" ? propertiesQuery.isLoading : "N/A", 
			companiesLoading: objectType === "company" ? companiesQuery.isLoading : "N/A"
		});
	}, [isLoadingMore, page, objectType, contactsQuery.isLoading, propertiesQuery.isLoading, companiesQuery.isLoading]);
	
	// Track when we reach the total count
	React.useEffect(() => {
		if (totalCount !== undefined && accumulatedData.length >= totalCount) {
			console.log("✅ Reached total count - should stop loading:", {
				accumulatedDataLength: accumulatedData.length,
				totalCount,
				difference: accumulatedData.length - totalCount
			});
		}
	}, [accumulatedData.length, totalCount]);
	
	// Track hasReachedEnd flag changes
	React.useEffect(() => {
		console.log("🏁 hasReachedEnd flag changed:", {
			hasReachedEnd,
			accumulatedDataLength: accumulatedData.length,
			totalCount,
			page
		});
	}, [hasReachedEnd, accumulatedData.length, totalCount, page]);

	// Handle loading more data
	const handleLoadMore = React.useCallback(() => {
		// Safeguard: Don't load more if we've reached the end (0 new results from backend)
		if (hasReachedEnd) {
			console.log("🛑 handleLoadMore blocked - reached end of data:", {
				hasReachedEnd,
				accumulatedDataLength: accumulatedData.length,
				totalCount
			});
			return;
		}
		
		// Safeguard: Don't load more if we already have all the data
		if (totalCount !== undefined && accumulatedData.length >= totalCount) {
			console.log("🛑 handleLoadMore blocked - already have all data:", {
				accumulatedDataLength: accumulatedData.length,
				totalCount
			});
			return;
		}
		
		console.log("📈 handleLoadMore called, incrementing page");
		setPage((prev) => {
			console.log(`📄 Page changing: ${prev} → ${prev + 1}`);
			return prev + 1;
		});
	}, [hasReachedEnd, totalCount, accumulatedData.length]); // Include dependencies to check against current data

	const handleRowClick = (_row: TableData) => {
		// TODO: Navigate to record detail page when route is available
		// const id = (row as any)._id?.toString() || (row as any).id;
		// const routePath = getObjectTypeRoutePath(objectType);
		// navigate({
		// 	to: `/$slug/${routePath}/$recordId`,
		// 	params: {
		// 		slug: organizationSlug,
		// 		recordId: id,
		// 	},
		// });
	};

	const handleColumnDefsChange = React.useCallback(
		(newColumnDefs: Array<{ field: string; headerName: string; width?: number; type?: string; visible?: boolean }>) => {
			if (!viewId) return;
			updateView(
				{
					viewId,
					columnDefs: newColumnDefs,
				},
				{
					onSuccess: () => {
						// Query will automatically refetch due to invalidation
					},
				}
			);
		},
		[viewId, updateView]
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!viewQuery.data) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-muted-foreground">View not found</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full">
			<TableView
				data={data}
				columns={columns}
				onRowClick={handleRowClick}
				selectedRows={selectedRows}
				onSelectionChange={setSelectedRows}
				totalCount={totalCount}
				aggregations={aggregationsQuery.data}
				columnAggregations={columnAggregations as Record<string, "none" | "count-empty" | "count-filled" | "percent-empty" | "percent-filled" | "sum" | "avg" | "min" | "max">}
				onAggregationsChange={(newAggregations) => {
					// Convert AggregationType to string for state
					const stringAggregations: Record<string, string> = {};
					Object.entries(newAggregations).forEach(([key, value]) => {
						stringAggregations[key] = value as string;
					});
					setColumnAggregations(stringAggregations);
				}}
				objectType={objectType}
				columnDefs={viewQuery.data?.columnDefs || []}
				onColumnDefsChange={handleColumnDefsChange}
				onLoadMore={handleLoadMore}
				isLoadingMore={isLoadingMore}
				hasReachedEnd={hasReachedEnd}
			/>
		</div>
	);
}

