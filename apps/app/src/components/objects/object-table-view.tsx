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
	const [accumulatedData, setAccumulatedData] = React.useState<TableData[]>([]);
	const pageSize = 50;

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

	// Reset accumulated data when viewId changes
	React.useEffect(() => {
		if (accumulatedDataViewIdRef.current !== viewId) {
			accumulatedDataViewIdRef.current = viewId;
			setAccumulatedData([]);
			setPage(1);
		}
	}, [viewId]);

	// Accumulate data as pages load
	React.useEffect(() => {
		// Only accumulate data if it matches the current viewId
		// This prevents accumulating stale data from a previous viewId
		if (accumulatedDataViewIdRef.current !== viewId) {
			return;
		}

		// Don't accumulate if query is still loading or fetching for page 1 (initial load or refetch)
		// For pages > 1, we allow accumulation even if fetching (for infinite scroll)
		if (page === 1 && (
			(objectType === "contact" && (contactsQuery.isLoading || contactsQuery.isFetching)) ||
			(objectType === "property" && (propertiesQuery.isLoading || propertiesQuery.isFetching))
		)) {
			return;
		}

		if (objectType === "contact" && contactsQuery.data?.contacts) {
			setAccumulatedData((prev) => {
				// If we're on page 1, replace all data. Otherwise, append new data
				if (page === 1) {
					return contactsQuery.data.contacts as TableData[];
				}
				// Append new contacts, avoiding duplicates
				const newContacts = contactsQuery.data.contacts as TableData[];
				const existingIds = new Set(prev.map((item) => (item as any)._id?.toString() || (item as any).id));
				const uniqueNew = newContacts.filter((item) => {
					const id = (item as any)._id?.toString() || (item as any).id;
					return !existingIds.has(id);
				});
				return [...prev, ...uniqueNew];
			});
		} else if (objectType === "property" && propertiesQuery.data?.properties) {
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
				return [...prev, ...uniqueNew];
			});
		}
	}, [objectType, contactsQuery.data, contactsQuery.isLoading, contactsQuery.isFetching, propertiesQuery.data, propertiesQuery.isLoading, propertiesQuery.isFetching, page, viewId]);

	// Get data based on object type - use accumulated data
	const data = React.useMemo(() => {
		return accumulatedData;
	}, [accumulatedData]);

	// Get total count for infinite scroll support
	const totalCount = React.useMemo(() => {
		if (objectType === "contact") {
			return contactsQuery.data?.pagination?.total;
		}
		if (objectType === "property") {
			return propertiesQuery.data?.pagination?.total;
		}
		return undefined;
	}, [objectType, contactsQuery.data?.pagination?.total, propertiesQuery.data?.pagination?.total]);

	const isLoading =
		viewQuery.isLoading ||
		(objectType === "contact" && contactsQuery.isLoading && page === 1) ||
		(objectType === "property" && propertiesQuery.isLoading && page === 1);
	
	const isLoadingMore =
		(objectType === "contact" && contactsQuery.isLoading && page > 1) ||
		(objectType === "property" && propertiesQuery.isLoading && page > 1);

	// Handle loading more data
	const handleLoadMore = React.useCallback(() => {
		setPage((prev) => prev + 1);
	}, [page]);

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
			/>
		</div>
	);
}

