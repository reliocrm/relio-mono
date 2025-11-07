"use client";

import * as React from "react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
	type VisibilityState,
	type ColumnSizingState,
	type ColumnPinningState,
} from "@tanstack/react-table";
import {
	IconChevronUp,
	IconChevronDown,
	IconCheck,
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isSystemField, getFieldType, formatFieldType, getFieldTypeIcon } from "@/lib/field-utils";
import { ViewSettings } from "./view-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBottomBar } from "./table-bottom-bar";
// TableData type - can be Contact, Company, or Property
type TableData = Record<string, any> & {
	_id?: any;
	id?: string;
};

type AggregationType = 
	| "none"
	| "count-empty"
	| "count-filled"
	| "percent-empty"
	| "percent-filled"
	| "sum"
	| "avg"
	| "min"
	| "max";

interface TableViewProps {
	data: TableData[];
	columns: ColumnDef<TableData>[];
	onRowClick?: (row: TableData) => void;
	selectedRows?: Set<string>;
	onSelectionChange?: (selected: Set<string>) => void;
	totalCount?: number; // Total count for infinite scroll support
	aggregations?: Record<string, string | number>; // Pre-calculated aggregations from backend
	columnAggregations?: Record<string, AggregationType>; // Column aggregation types from parent
	onAggregationsChange?: (aggregations: Record<string, AggregationType>) => void; // Callback when aggregations change
	objectType?: "contact" | "company" | "property"; // Object type for ViewSettings
	columnDefs?: Array<{ field: string; headerName: string; width?: number; type?: string; visible?: boolean }>; // Column definitions for ViewSettings
	onColumnDefsChange?: (columnDefs: Array<{ field: string; headerName: string; width?: number; type?: string; visible?: boolean }>) => void; // Callback when columnDefs change
	onLoadMore?: () => void; // Callback to load more data for infinite scroll
	isLoadingMore?: boolean; // Loading state for infinite scroll
}

export function TableView({
	data,
	columns,
	onRowClick,
	selectedRows,
	onSelectionChange,
	totalCount,
	aggregations: backendAggregations,
	columnAggregations: externalColumnAggregations,
	onAggregationsChange,
	objectType,
	columnDefs,
	onColumnDefsChange,
	onLoadMore,
	isLoadingMore = false,
}: TableViewProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	
	// Initialize columnVisibility from column definitions' visible property
	// This follows the pattern from tablecn where visibility is managed by TanStack Table
	const initialColumnVisibility = React.useMemo<VisibilityState>(() => {
		const visibility: VisibilityState = {};
		columns.forEach((col) => {
			const colId = (col as any).id || (col as any).accessorKey;
			if (colId) {
				// Check if column has visible property in meta.columnDef
				const columnDef = (col as any).meta?.columnDef;
				if (columnDef && columnDef.visible === false) {
					visibility[colId] = false;
				}
				// Default to visible (true) if not explicitly set to false
			}
		});
		return visibility;
	}, [columns]);
	
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);
	
	// Initialize columnSizing from column definitions to respect widths
	const initialColumnSizing = React.useMemo<ColumnSizingState>(() => {
		const sizing: ColumnSizingState = {};
		columns.forEach((col) => {
			const colId = (col as any).id || (col as any).accessorKey;
			if (colId && col.size) {
				sizing[colId] = col.size;
			}
		});
		return sizing;
	}, [columns]);
	
	const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(initialColumnSizing);
	const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
		left: ["select", "contact"],
	});
	const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
	const [isScrolled, setIsScrolled] = React.useState(false);
	const [localColumnAggregations, setLocalColumnAggregations] = React.useState<Record<string, AggregationType>>({});
	const [containerWidth, setContainerWidth] = React.useState<number>(0);
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const isLoadingMoreRef = React.useRef(false);
	const hasInitializedRef = React.useRef(false);
	const previousDataLengthRef = React.useRef<number>(data.length);
	const onLoadMoreRef = React.useRef(onLoadMore);
	
	// Keep onLoadMore ref up to date
	React.useEffect(() => {
		onLoadMoreRef.current = onLoadMore;
	}, [onLoadMore]);
	
	// Sync loading ref with isLoadingMore prop
	React.useEffect(() => {
		// Always sync the ref with the prop value
		isLoadingMoreRef.current = isLoadingMore;
	}, [isLoadingMore]);
	
	// Reset initialization flag and scroll position when data resets (e.g., navigating to new view)
	React.useEffect(() => {
		// If data length went from non-zero to zero, we've navigated to a new view
		if (previousDataLengthRef.current > 0 && data.length === 0) {
			hasInitializedRef.current = false;
			isLoadingMoreRef.current = false; // Reset loading ref when navigating to new view
			// Reset scroll position to top when navigating to new view
			const container = scrollContainerRef.current;
			if (container) {
				container.scrollTop = 0;
			}
		}
		previousDataLengthRef.current = data.length;
	}, [data.length]);
	
	// Update columnSizing when columns change (to respect width changes)
	React.useEffect(() => {
		const newSizing: ColumnSizingState = {};
		columns.forEach((col) => {
			const colId = (col as any).id || (col as any).accessorKey;
			if (colId && col.size) {
				newSizing[colId] = col.size;
			}
		});
		setColumnSizing((prev) => {
			// Merge with previous sizing to preserve user resizing, but update with new defaults
			const merged = { ...prev };
			Object.keys(newSizing).forEach((key) => {
				// Only set if not already resized by user (not in prev)
				if (!(key in prev)) {
					merged[key] = newSizing[key];
				}
			});
			return merged;
		});
	}, [columns]);

	// Update columnVisibility when columns change (to sync with columnDefs.visible)
	React.useEffect(() => {
		const newVisibility: VisibilityState = {};
		columns.forEach((col) => {
			const colId = (col as any).id || (col as any).accessorKey;
			if (colId) {
				const columnDef = (col as any).meta?.columnDef;
				if (columnDef && columnDef.visible === false) {
					newVisibility[colId] = false;
				}
			}
		});
		setColumnVisibility((prev) => {
			// Merge with previous visibility to preserve user toggles, but update with new defaults
			const merged = { ...prev };
			// Update visibility for columns that have explicit visible property
			columns.forEach((col) => {
				const colId = (col as any).id || (col as any).accessorKey;
				if (colId) {
					const columnDef = (col as any).meta?.columnDef;
					if (columnDef && columnDef.visible === false) {
						merged[colId] = false;
					} else if (columnDef && columnDef.visible === true) {
						// Explicitly visible - remove from visibility state (defaults to visible)
						delete merged[colId];
					}
				}
			});
			return merged;
		});
	}, [columns]);

	// Use external aggregations if provided, otherwise use local state
	const columnAggregations = externalColumnAggregations ?? localColumnAggregations;
	const setColumnAggregations = externalColumnAggregations 
		? (updater: Record<string, AggregationType> | ((prev: Record<string, AggregationType>) => Record<string, AggregationType>)) => {
			const newValue = typeof updater === 'function' ? updater(externalColumnAggregations) : updater;
			onAggregationsChange?.(newValue);
		}
		: setLocalColumnAggregations;

	// Helper to get cell value from row data
	const getCellValue = (row: TableData, column: any): any => {
		const accessorKey = (column.columnDef as any).accessorKey || column.id;
		if (!accessorKey || accessorKey === "select") return null;
		
		// Handle nested paths
		if (accessorKey.includes(".")) {
			return accessorKey.split(".").reduce((obj: any, key: string) => obj?.[key], row);
		}
		
		return row[accessorKey];
	};

	// Helper to check if value is empty
	const isEmpty = (value: any): boolean => {
		if (value === null || value === undefined) return true;
		if (typeof value === "string" && value.trim() === "") return true;
		if (Array.isArray(value) && value.length === 0) return true;
		if (typeof value === "object" && Object.keys(value).length === 0) return true;
		return false;
	};

	// Calculate aggregation for a column
	const calculateAggregation = (
		column: any,
		aggregationType: AggregationType,
		data: TableData[]
	): string | number => {
		if (aggregationType === "none") return "";

		const fieldType = getFieldType((column.columnDef as any).meta?.columnDef || column.columnDef);
		const isNumberField = fieldType === "number";

		// Get all values for this column
		const values = data.map((row) => getCellValue(row, column)).filter((v) => v !== undefined);

		if (aggregationType === "count-empty") {
			return data.filter((row) => isEmpty(getCellValue(row, column))).length;
		}

		if (aggregationType === "count-filled") {
			return data.filter((row) => !isEmpty(getCellValue(row, column))).length;
		}

		if (aggregationType === "percent-empty") {
			const emptyCount = data.filter((row) => isEmpty(getCellValue(row, column))).length;
			return data.length > 0 ? Math.round((emptyCount / data.length) * 100) : 0;
		}

		if (aggregationType === "percent-filled") {
			const filledCount = data.filter((row) => !isEmpty(getCellValue(row, column))).length;
			return data.length > 0 ? Math.round((filledCount / data.length) * 100) : 0;
		}

		// Number field aggregations
		if (isNumberField) {
			const numericValues = values
				.map((v) => {
					const num = typeof v === "string" ? parseFloat(v) : v;
					return typeof num === "number" && !isNaN(num) ? num : null;
				})
				.filter((v): v is number => v !== null);

			if (numericValues.length === 0) return "-";

			if (aggregationType === "sum") {
				return numericValues.reduce((sum, val) => sum + val, 0);
			}

			if (aggregationType === "avg") {
				const sum = numericValues.reduce((sum, val) => sum + val, 0);
				return Math.round((sum / numericValues.length) * 100) / 100;
			}

			if (aggregationType === "min") {
				return Math.min(...numericValues);
			}

			if (aggregationType === "max") {
				return Math.max(...numericValues);
			}
		}

		return "-";
	};

	// Get available aggregations for a column
	const getAvailableAggregations = (column: any): AggregationType[] => {
		const fieldType = getFieldType((column.columnDef as any).meta?.columnDef || column.columnDef);
		const isNumberField = fieldType === "number";
		const isSelectColumn = column.id === "select";

		if (isSelectColumn) return ["none"];

		if (isNumberField) {
			return ["none", "sum", "avg", "min", "max", "count-empty", "count-filled"];
		}

		return ["none", "count-empty", "count-filled", "percent-empty", "percent-filled"];
	};

	// Format aggregation value for display
	const formatAggregationValue = (value: string | number, aggregationType: AggregationType): string => {
		if (value === "" || value === "-") return "";
		
		if (aggregationType === "percent-empty" || aggregationType === "percent-filled") {
			return `${value}%`;
		}

		if (typeof value === "number") {
			// Format numbers with commas for thousands
			return value.toLocaleString();
		}

		return String(value);
	};

	// Add selection column if onSelectionChange is provided
	const tableColumns = React.useMemo<ColumnDef<TableData>[]>(() => {
		// Ensure all columns have proper minSize and maxSize for resizing
		const columnsWithSizing = columns.map((col) => {
			// Skip if it's already the select column or add-column column
			if (col.id === "select" || col.id === "add-column") return col;
			
			return {
				...col,
				minSize: 50, // Enforce 50px minimum
				maxSize: 400, // Enforce 400px maximum
				enableResizing: col.enableResizing !== false, // Enable resizing unless explicitly disabled
			};
		});

		const result: ColumnDef<TableData>[] = [];

		// Add selection column if onSelectionChange is provided
		if (onSelectionChange) {
			const selectionColumn: ColumnDef<TableData> = {
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => {
					return (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => e.stopPropagation()}
							aria-label="Select row"
						/>
					);
				},
				enableSorting: false,
				enableHiding: false,
				enableResizing: false,
				enablePinning: true,
				size: 40,
				minSize: 40,
				maxSize: 40,
			};
			result.push(selectionColumn);
		}

		result.push(...columnsWithSizing);

		// Add "Add column" placeholder column that expands to fill remaining width
		const addColumnColumn: ColumnDef<TableData> = {
			id: "add-column",
			header: () => {
				// Only show ViewSettings if objectType and columnDefs are provided
				if (objectType && columnDefs && onColumnDefsChange) {
					return (
						<div className="flex items-center justify-start h-full">
							<ViewSettings
								objectType={objectType}
								columnDefs={columnDefs}
								onColumnDefsChange={onColumnDefsChange}
								variant="text"
							/>
						</div>
					);
				}
				// Fallback to text if ViewSettings props not provided
				return (
					<div className="flex items-center justify-start h-full text-muted-foreground/50 hover:text-muted-foreground transition-colors">
						<span className="text-sm">+ Add column</span>
					</div>
				);
			},
			cell: () => null,
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
			enablePinning: false,
			size: 200, // Default size, will be adjusted to fill remaining space
			minSize: 150,
			maxSize: Infinity,
		};
		result.push(addColumnColumn);

		return result;
	}, [columns, onSelectionChange, objectType, columnDefs, onColumnDefsChange]);

	const table = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnSizingChange: setColumnSizing,
		onColumnPinningChange: setColumnPinning,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnVisibility,
			columnSizing,
			columnPinning,
			rowSelection,
		},
		enableColumnResizing: true,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		defaultColumn: {
			minSize: 50,
			maxSize: 400,
		},
		initialState: {
			columnPinning: {
				left: ["select", "contact"],
			},
		},
	});

	// Sync row selection with external state
	React.useEffect(() => {
		if (selectedRows && onSelectionChange) {
			const currentSelected = new Set(
				Object.keys(rowSelection)
					.filter((key) => rowSelection[key])
					.map((key) => {
						const row = table.getRowModel().rows[parseInt(key)];
						return (row.original as any)._id?.toString() || (row.original as any).id;
					})
			);
			const currentArray = [...currentSelected].sort();
			const selectedArray = [...selectedRows].sort();
			if (JSON.stringify(currentArray) !== JSON.stringify(selectedArray)) {
				onSelectionChange(currentSelected);
			}
		}
	}, [rowSelection, table, selectedRows, onSelectionChange]);

	// Track container width and horizontal scroll, and handle infinite scroll
	React.useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) {
			return;
		}

		const handleScroll = () => {
			const hasScrolled = container.scrollLeft > 0;
			setIsScrolled(hasScrolled);

			// Infinite scroll: check if we're near the bottom
			// Use ref to avoid stale closure issues
			const currentOnLoadMore = onLoadMoreRef.current;
			// Trust the prop over the ref - if prop says we're not loading, allow loading
			// The ref is just for preventing rapid-fire calls before prop updates
			if (!currentOnLoadMore || isLoadingMore) {
				return;
			}
			
			const scrollTop = container.scrollTop;
			const scrollHeight = container.scrollHeight;
			const clientHeight = container.clientHeight;
			
			// Footer is sticky at bottom with h-10 (40px)
			// We need to check if we've scrolled past the tbody content
			// The tfoot is sticky, so scrollHeight includes it, but we want to trigger before reaching it
			const footerHeight = 40; // h-10 = 40px
			const threshold = 200; // Trigger 00px before footer
			// Calculate distance from bottom of scrollable content (excluding sticky footer)
			const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
			
			// Trigger when we're close to the bottom, accounting for the sticky footer
			const isNearBottom = distanceFromBottom <= (threshold + footerHeight);
			
			// Check if there's more data to load
			const hasMore = totalCount === undefined || data.length < totalCount;
			
			// On initial mount, only trigger if we actually need scrolling (scrollHeight > clientHeight)
			// This prevents premature loading when navigating to a new view where content fits in viewport
			const needsScrolling = scrollHeight > clientHeight;
			const isInitialCheck = !hasInitializedRef.current;
			
			// Mark as initialized after first check
			if (isInitialCheck) {
				hasInitializedRef.current = true;
			}
			
			// Skip initial trigger if container doesn't need scrolling yet
			// This prevents premature loading when navigating to a new view
			// Only skip if there's no scrollbar needed (content fits in viewport)
			if (isInitialCheck && !needsScrolling) {
				return;
			}
			
			if (isNearBottom && hasMore) {
				// Set ref to prevent multiple simultaneous calls
				// The prop will update when the query starts loading
				isLoadingMoreRef.current = true;
				currentOnLoadMore();
				// Note: isLoadingMoreRef will be reset by the useEffect when isLoadingMore prop becomes false
			}
		};

		const handleResize = () => {
			setContainerWidth(container.clientWidth);
			handleScroll();
		};

		// Check initial scroll position and width
		handleResize();

		// Use passive listener for better performance
		container.addEventListener("scroll", handleScroll, { passive: true });
		
		// Track container width changes
		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});
		resizeObserver.observe(container);

		return () => {
			container.removeEventListener("scroll", handleScroll);
			resizeObserver.disconnect();
		};
	}, [data, totalCount, isLoadingMore]); // Re-run when data or loading state changes (onLoadMore is accessed via ref)

	// Calculate and update "add-column" column width to fill remaining space
	React.useEffect(() => {
		if (!containerWidth || !table) return;

		const visibleColumns = table.getVisibleLeafColumns();
		const addColumnCol = visibleColumns.find((col) => col.id === "add-column");
		if (!addColumnCol) return;

		// Calculate total width of all columns except add-column
		const otherColumnsWidth = visibleColumns
			.filter((col) => col.id !== "add-column")
			.reduce((sum, col) => sum + col.getSize(), 0);

		// Calculate remaining width (subtract a bit for borders/spacing)
		const remainingWidth = Math.max(150, containerWidth - otherColumnsWidth - 2);

		// Update add-column size if it's different
		const currentSize = addColumnCol.getSize();
		if (Math.abs(currentSize - remainingWidth) > 1) {
			setColumnSizing((prev) => ({
				...prev,
				"add-column": remainingWidth,
			}));
		}
	}, [containerWidth, table, columnSizing, columnVisibility]);

	// Calculate minimum table width based on column sizes
	const minTableWidth = React.useMemo(() => {
		if (!table) return 0;
		const visibleColumns = table.getVisibleLeafColumns();
		return visibleColumns.reduce((sum, col) => sum + col.getSize(), 0);
	}, [table, columnSizing, columnVisibility]);

	return (
		<div className="flex flex-col h-full w-full overflow-hidden relative">
			<div ref={scrollContainerRef} className="flex-1 overflow-auto relative">
				<table 
					className="border-separate border-spacing-0 caption-bottom text-sm" 
					style={{ 
						tableLayout: "fixed",
						width: "100%",
						minWidth: `${minTableWidth}px`,
					}}
				>
					<thead className="[&_tr]:border-b">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b hover:bg-transparent">
								{headerGroup.headers.map((header, index) => {
									const isPinned = header.column.getIsPinned();
									const isPinnedLeft = isPinned === "left";
									const canSort = header.column.getCanSort();
									const isSorted = header.column.getIsSorted();
									const isResizing = header.column.getIsResizing();

									const isSelectColumn = header.column.id === "select";
									const isAddColumnColumn = header.column.id === "add-column";
									// Check if previous column is select column
									const prevHeader = headerGroup.headers[index - 1];
									const isAfterSelect = prevHeader?.column.id === "select";
									
									// Calculate left offset for pinned columns
									// Select column should always be at 0, other pinned columns follow
									const leftOffset = isPinnedLeft 
										? (isSelectColumn ? 0 : header.getStart("left"))
										: undefined;

									// Check if this is the last pinned column
									const nextHeader = headerGroup.headers[index + 1];
									const isLastPinned = isPinnedLeft && (!nextHeader || nextHeader.column.getIsPinned() !== "left");

									const isClickable = !isSelectColumn && !isPinnedLeft && !isAddColumnColumn;

									return (
										<th
											key={header.id}
											className={cn(
												"sticky top-0 bg-zinc-800 py-2 text-left font-normal text-sm h-10 align-middle overflow-hidden",
												isPinnedLeft ? "z-30" : "z-20",
												!isSelectColumn && !isAfterSelect && !isAddColumnColumn && "border border-border/50",
												!isSelectColumn && isAfterSelect && "border-t border-b border-r border-border/50",
												isSelectColumn && "border-b border-border/50",
												isAddColumnColumn && "border border-border/50",
												isSelectColumn ? "px-2" : "px-3",
												isResizing && "bg-muted/50",
												isClickable && "cursor-pointer group/header"
											)}
											style={{
												position: "sticky",
												top: 0,
												width: header.getSize(),
												minWidth: header.column.columnDef.minSize ?? (isSelectColumn ? 40 : 50),
												maxWidth: header.column.columnDef.maxSize ?? (isSelectColumn ? 40 : 400),
												left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
												...(isLastPinned && isScrolled && {
													boxShadow: "4px 0 6px 0 rgba(0, 0, 0, 0.4)"
												})
											}}
										>
											{isSelectColumn || isPinnedLeft || isAddColumnColumn ? (
												<div className="flex items-center justify-start min-w-0 h-full">
													{header.isPlaceholder ? null : (
														<div className="truncate w-full">
															{flexRender(header.column.columnDef.header, header.getContext())}
														</div>
													)}
												</div>
											) : (
												<div className="relative w-full h-full min-w-0">
													{/* Hover background overlay */}
													<div className="absolute inset-0 bg-muted/30 opacity-0 group-hover/header:opacity-100 transition-opacity pointer-events-none z-0" />
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<button
																type="button"
																className="absolute inset-0 flex items-center gap-2 w-full h-full text-left hover:text-foreground transition-colors px-3 z-10 cursor-pointer min-w-0"
																onClick={(e) => {
																	e.stopPropagation();
																}}
															>
																{header.isPlaceholder ? null : (
																	<div className="flex items-center gap-1 flex-1 min-w-0">
																		<div className="truncate flex-1 min-w-0">
																			{flexRender(header.column.columnDef.header, header.getContext())}
																		</div>
																		{isSorted && (
																			<div className="flex flex-col shrink-0">
																				<IconChevronUp
																					className={cn(
																						"h-3 w-3",
																						isSorted === "asc" ? "text-foreground" : "text-muted-foreground/30"
																					)}
																				/>
																				<IconChevronDown
																					className={cn(
																						"h-3 w-3 -mt-1",
																						isSorted === "desc" ? "text-foreground" : "text-muted-foreground/30"
																					)}
																				/>
																			</div>
																		)}
																	</div>
																)}
															</button>
														</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														{(() => {
															const fieldName = (header.column.columnDef as any).accessorKey || header.column.id;
															const columnDef = (header.column.columnDef as any).meta?.columnDef || header.column.columnDef;
															const fieldType = getFieldType(columnDef);
															const isSystem = isSystemField(fieldName);
															
															const FieldIcon = getFieldTypeIcon(fieldType);
															
															return (
																<>
																	{/* Field Type Display */}
																	<div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border flex items-center gap-2">
																		<FieldIcon className="h-3.5 w-3.5" />
																		<span>
																			Type: {formatFieldType(fieldType)}
																			{isSystem && " (System)"}
																		</span>
																	</div>
																	{canSort && (
																		<>
																			<DropdownMenuItem
																				onClick={() => header.column.toggleSorting(false)}
																			>
																				<IconChevronUp className="h-4 w-4 mr-2" />
																				Sort ascending
																			</DropdownMenuItem>
																			<DropdownMenuItem
																				onClick={() => header.column.toggleSorting(true)}
																			>
																				<IconChevronDown className="h-4 w-4 mr-2" />
																				Sort descending
																			</DropdownMenuItem>
																			<DropdownMenuSeparator />
																		</>
																	)}
																	{!isSystem && (
																		<>
																			<DropdownMenuItem
																				onClick={() => {
																					// TODO: Implement edit column label
																				}}
																			>
																				Edit column label
																			</DropdownMenuItem>
																			<DropdownMenuSeparator />
																		</>
																	)}
																	{header.column.getCanHide() && (
																		<DropdownMenuItem
																			onClick={() => header.column.toggleVisibility(false)}
																		>
																			Hide column
																		</DropdownMenuItem>
																	)}
																</>
															);
														})()}
													</DropdownMenuContent>
													</DropdownMenu>
												</div>
											)}
											{header.column.getCanResize() && header.column.id !== "select" && !isPinnedLeft && (
												<div
													role="separator"
													aria-orientation="vertical"
													aria-label={`Resize ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.column.id} column`}
													tabIndex={0}
													className={cn(
														"after:-translate-x-1/2 -right-px absolute top-0 z-50 h-full w-0.5 cursor-ew-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:left-1/2 after:h-full after:w-[18px] after:content-[''] hover:bg-primary focus:bg-primary focus:outline-none",
														isResizing ? "bg-primary opacity-100" : "opacity-0 hover:opacity-100"
													)}
													onDoubleClick={() => header.column.resetSize()}
													onMouseDown={header.getResizeHandler()}
													onTouchStart={header.getResizeHandler()}
												/>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td
									colSpan={tableColumns.length}
									className="h-24 text-center text-muted-foreground p-2 align-middle"
								>
									No results found.
								</td>
							</tr>
						) : (
							<>
								{table.getRowModel().rows.map((row) => {
								const id = (row.original as any)._id?.toString() || (row.original as any).id;
								const isSelected = selectedRows?.has(id);

								return (
									<tr
										key={row.id}
										data-state={isSelected && "selected"}
										className={cn(
											"border-b border-border/50 cursor-pointer transition-colors",
											isSelected && "bg-blue-500/10"
										)}
										onClick={() => onRowClick?.(row.original)}
									>
										{row.getVisibleCells().map((cell, cellIndex) => {
											const isPinned = cell.column.getIsPinned();
											const isPinnedLeft = isPinned === "left";
											
											const isSelectColumn = cell.column.id === "select";
											const isAddColumnColumn = cell.column.id === "add-column";
											// Check if previous cell is select column
											const prevCell = row.getVisibleCells()[cellIndex - 1];
											const isAfterSelect = prevCell?.column.id === "select";
											
											// Calculate left offset for pinned columns
											// Select column should always be at 0, other pinned columns follow
											const leftOffset = isPinnedLeft 
												? (isSelectColumn ? 0 : cell.column.getStart("left"))
												: undefined;

											// Check if this is the last pinned column
											const nextCell = row.getVisibleCells()[cellIndex + 1];
											const isLastPinned = isPinnedLeft && (!nextCell || nextCell.column.getIsPinned() !== "left");

											return (
												<td
													key={cell.id}
													className={cn(
														"py-2 text-sm align-middle overflow-hidden",
														!isSelectColumn && !isAfterSelect && !isAddColumnColumn && "border border-border/50",
														!isSelectColumn && isAfterSelect && "border-t border-b border-r border-border/50",
														isSelectColumn && "border-b border-border/50",
														isAddColumnColumn && "border border-border/50",
														isSelectColumn ? "px-2" : "px-3",
														isPinnedLeft && "sticky z-20",
														!isPinnedLeft && "relative z-0"
													)}
													style={{
														width: cell.column.getSize(),
														minWidth: cell.column.columnDef.minSize ?? (isSelectColumn ? 40 : 50),
														maxWidth: cell.column.columnDef.maxSize ?? (isSelectColumn ? 40 : 400),
														left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
														...(isLastPinned && isScrolled && {
															boxShadow: "10px 0 10px 0 rgba(0, 0, 0, 0.5)"
														})
													}}
												>
													{isSelectColumn || isAddColumnColumn ? (
														<div className="flex items-center justify-center h-full">
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</div>
													) : (
														<div className="truncate w-full">
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</div>
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
							{/* Skeleton rows for infinite scroll loading */}
							{isLoadingMore && (() => {
								const headerGroup = table.getHeaderGroups()[0]; // Use first header group
								return Array.from({ length: 5 }).map((_, skeletonIndex) => (
									<tr
										key={`skeleton-${skeletonIndex}`}
										className="border-b border-border/50"
									>
										{headerGroup.headers.map((header, cellIndex) => {
											const isPinned = header.column.getIsPinned();
											const isPinnedLeft = isPinned === "left";
											const isSelectColumn = header.column.id === "select";
											const isAddColumnColumn = header.column.id === "add-column";
											const prevHeader = headerGroup.headers[cellIndex - 1];
											const isAfterSelect = prevHeader?.column.id === "select";
											
											const leftOffset = isPinnedLeft 
												? (isSelectColumn ? 0 : header.getStart("left"))
												: undefined;

											const nextHeader = headerGroup.headers[cellIndex + 1];
											const isLastPinned = isPinnedLeft && (!nextHeader || nextHeader.column.getIsPinned() !== "left");

											return (
												<td
													key={`skeleton-${skeletonIndex}-${header.id}`}
													className={cn(
														"py-2 text-sm align-middle overflow-hidden",
														!isSelectColumn && !isAfterSelect && !isAddColumnColumn && "border border-border/50",
														!isSelectColumn && isAfterSelect && "border-t border-b border-r border-border/50",
														isSelectColumn && "border-b border-border/50",
														isAddColumnColumn && "border border-border/50",
														isSelectColumn ? "px-2" : "px-3",
														isPinnedLeft && "sticky z-20 bg-zinc-800",
														!isPinnedLeft && "relative z-0"
													)}
													style={{
														width: header.getSize(),
														minWidth: header.column.columnDef.minSize ?? (isSelectColumn ? 40 : 50),
														maxWidth: header.column.columnDef.maxSize ?? (isSelectColumn ? 40 : 400),
														left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
														...(isLastPinned && isScrolled && {
															boxShadow: "10px 0 10px 0 rgba(0, 0, 0, 0.5)"
														})
													}}
												>
													{isSelectColumn ? (
														<div className="flex items-center justify-center h-full">
															<Skeleton className="h-4 w-4 rounded" />
														</div>
													) : isAddColumnColumn ? (
														<div className="flex items-center justify-center h-full">
															{/* Empty */}
														</div>
													) : (
														<div className="flex items-center h-full">
															<Skeleton className="h-4 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
														</div>
													)}
												</td>
											);
										})}
									</tr>
								));
							})()}
							</>
						)}
					</tbody>
					<tfoot className="[&_tr]:border-t">
						{table.getHeaderGroups().map((headerGroup) => {
							// Get aggregation label helper
							const getAggregationLabel = (type: AggregationType): string => {
								const labels: Record<AggregationType, string> = {
									"none": "None",
									"count-empty": "Count empty",
									"count-filled": "Count filled",
									"percent-empty": "Percent empty",
									"percent-filled": "Percent filled",
									"sum": "Sum",
									"avg": "Average",
									"min": "Min",
									"max": "Max",
								};
								return labels[type];
							};

							return (
								<tr key={headerGroup.id} className="border-t hover:bg-transparent">
									{headerGroup.headers.map((header, index) => {
										const isPinned = header.column.getIsPinned();
										const isPinnedLeft = isPinned === "left";
										const isSelectColumn = header.column.id === "select";
										const isAddColumnColumn = header.column.id === "add-column";
										const prevHeader = headerGroup.headers[index - 1];
										const isAfterSelect = prevHeader?.column.id === "select";
										
										const nextHeader = headerGroup.headers[index + 1];
										const isNextPinned = nextHeader?.column.getIsPinned() === "left";
										const isNextContactColumn = nextHeader?.column.id === "contact" || (nextHeader?.column.columnDef as any)?.id === "contact";
										
										// Check if select column should span to contact column
										const shouldSpanToContact = isSelectColumn && isPinnedLeft && isNextPinned && isNextContactColumn;
										
										// Skip rendering contact column footer if it's pinned and comes after select
										const isContactColumn = header.column.id === "contact" || (header.column.columnDef as any)?.id === "contact";
										const isContactAfterSelect = isPinnedLeft && isContactColumn && prevHeader?.column.id === "select";
										
										if (isContactAfterSelect && prevHeader && prevHeader.column.getIsPinned() === "left") {
											return null; // Skip this cell, it's covered by the select column's colspan
										}
										
										const leftOffset = isPinnedLeft 
											? (isSelectColumn ? 0 : header.getStart("left"))
											: undefined;

										const isLastPinned = isPinnedLeft && (!nextHeader || nextHeader.column.getIsPinned() !== "left");

										// Get aggregation type - check both column.id and accessorKey
										const columnId = header.column.id;
										const accessorKeyForLookup = (header.column.columnDef as any).accessorKey || columnId;
										const aggregationType = columnAggregations[columnId] || columnAggregations[accessorKeyForLookup] || "none";
										const availableAggregations = getAvailableAggregations(header.column);
										
										// Use backend aggregation if available, otherwise calculate locally
										const accessorKey = (header.column.columnDef as any).accessorKey || header.column.id;
										// Check if we have backend aggregations and this column has a non-none aggregation
										// backendAggregations will be undefined if query hasn't run, or an object (possibly empty) if it has
										const hasBackendAggregation = 
											backendAggregations && 
											aggregationType !== "none" && 
											Object.keys(backendAggregations).length > 0 &&
											backendAggregations[accessorKey] !== undefined;
										const aggregationValue = hasBackendAggregation
											? backendAggregations[accessorKey]
											: calculateAggregation(header.column, aggregationType, data);
										const formattedValue = formatAggregationValue(aggregationValue, aggregationType);

										// Calculate combined width for select + contact span
										const combinedWidth = shouldSpanToContact && nextHeader
											? header.getSize() + nextHeader.getSize()
											: header.getSize();

										return (
											<td
												key={header.id}
												colSpan={shouldSpanToContact ? 2 : undefined}
											className={cn(
												"sticky bottom-0 bg-zinc-800 py-2 text-left font-normal text-sm h-10 align-middle overflow-hidden",
												isPinnedLeft ? "z-30" : "z-20",
												!isSelectColumn && !isAfterSelect && !isAddColumnColumn && "border border-border/50",
												!isSelectColumn && isAfterSelect && "border-t border-b border-r border-border/50",
												isSelectColumn && "border-t border-border/50",
												isAddColumnColumn && "border border-border/50",
												shouldSpanToContact && "border-r border-border/50",
												isSelectColumn ? "px-2" : "px-3",
												!isSelectColumn && !isPinnedLeft && !isAddColumnColumn && "cursor-pointer"
											)}
												style={{
													position: "sticky",
													bottom: 0,
													width: combinedWidth,
													minWidth: header.column.columnDef.minSize ?? (isSelectColumn ? 40 : 50),
													maxWidth: header.column.columnDef.maxSize ?? (isSelectColumn ? 40 : 400),
													left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
													...(isLastPinned && isScrolled && {
														boxShadow: "4px 0 6px 0 rgba(0, 0, 0, 0.4)"
													})
												}}
											>
												{isSelectColumn ? (
													<div className="flex items-center justify-end">
														{totalCount !== undefined ? (
                                                            <div className="text-sm flex gap-1">
															<span className="font-semibold">
																{totalCount.toLocaleString()}
															</span>
                                                            <span className="text-muted-foreground">
                                                                count
                                                            </span>
                                                            </div>
														) : (
															<span className="text-xs text-muted-foreground">
																{table.getFilteredRowModel().rows.length.toLocaleString()}
															</span>
														)}
													</div>
												) : isPinnedLeft || isAddColumnColumn ? (
													// Empty cell for pinned columns (except select) and add-column
													<span></span>
												) : (
													<div className="relative w-full h-full group/footer">
														{/* Hover background overlay */}
														<div className="absolute inset-0 bg-muted/30 opacity-0 group-hover/footer:opacity-100 transition-opacity pointer-events-none z-0" />
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<button
																	type="button"
																	className="absolute inset-0 flex items-center justify-start w-full h-full text-left hover:text-foreground transition-colors px-3 z-10 cursor-pointer min-w-0"
																	onClick={(e) => e.stopPropagation()}
																>
																	{formattedValue ? (
																		<span className="text-foreground truncate min-w-0">{formattedValue}</span>
																	) : (
																		<span className="text-muted-foreground/50 text-xs truncate min-w-0">+ Add calculation</span>
																	)}
																</button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="start" className="w-48">
																<div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border">
																	Aggregations
																</div>
																	{availableAggregations.map((aggType) => (
																	<DropdownMenuItem
																		key={aggType}
																		onClick={() => {
																			const columnId = header.column.id;
																			const newAggregations = {
																				...columnAggregations,
																				[columnId]: aggType,
																			};
																			setColumnAggregations(newAggregations);
																			onAggregationsChange?.(newAggregations);
																		}}
																		className="flex items-center justify-between"
																	>
																		<span>{getAggregationLabel(aggType)}</span>
																		{aggregationType === aggType && (
																			<IconCheck className="h-4 w-4" />
																		)}
																	</DropdownMenuItem>
																))}
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tfoot>
				</table>
			</div>
			{objectType && selectedRows && selectedRows.size > 0 && (
				<TableBottomBar
					selectedRows={selectedRows}
					objectType={objectType}
					data={data}
					onSelectionChange={onSelectionChange || (() => {})}
				/>
			)}
		</div>
	);
}

