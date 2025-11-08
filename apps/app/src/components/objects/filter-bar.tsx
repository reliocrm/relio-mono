"use client";

import * as React from "react";
import {
	IconChevronDown,
	IconFilter,
	IconDotsVertical,
	IconTrash,
	IconPlus,
} from "@tabler/icons-react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { getFieldTypeIcon, formatFieldType } from "@/lib/field-utils";
import { getAvailableFieldsForObjectType } from "@/lib/table-columns";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { AdvancedFilterComponent } from "./advanced-filter";
import type { AdvancedFilter } from "@/lib/filters/types";
import { generateId, createEmptyCondition } from "@/lib/filters/types";

// Filter types based on the backend implementation
export interface FilterCondition {
	id: string;
	field: string;
	operator: string;
	value?: string | number | boolean | string[] | number[] | null;
	valueFrom?: string | number | Date;
	valueTo?: string | number | Date;
}

interface FilterOperator {
	value: string;
	label: string;
	icon?: React.ComponentType<any>;
	requiresValue?: boolean;
	requiresRange?: boolean;
}

interface FilterBarProps {
	objectType: "contact" | "property" | "company";
	filters: FilterCondition[];
	onFiltersChange: (filters: FilterCondition[]) => void;
}

// Available operators based on field types
const getOperatorsForFieldType = (fieldType: string): FilterOperator[] => {
	const baseOperators: FilterOperator[] = [
		{ value: "contains", label: "contains" },
		{ value: "not_contains", label: "not contains" },
		{ value: "starts_with", label: "starts with" },
		{ value: "ends_with", label: "ends with" },
		{ value: "equals", label: "is" },
		{ value: "not_equals", label: "is not" },
		{ value: "is_empty", label: "empty", requiresValue: false },
		{ value: "is_not_empty", label: "not empty", requiresValue: false },
	];

	const numberOperators: FilterOperator[] = [
		{ value: "equals", label: "is" },
		{ value: "not_equals", label: "is not" },
		{ value: "greater_than", label: "greater than" },
		{ value: "greater_than_or_equal", label: "greater than or equal" },
		{ value: "less_than", label: "less than" },
		{ value: "less_than_or_equal", label: "less than or equal" },
		{ value: "between", label: "between", requiresRange: true },
		{ value: "not_between", label: "not between", requiresRange: true },
		{ value: "is_empty", label: "empty", requiresValue: false },
		{ value: "is_not_empty", label: "not empty", requiresValue: false },
	];

	const dateOperators: FilterOperator[] = [
		{ value: "date_is", label: "is" },
		{ value: "date_is_not", label: "is not" },
		{ value: "date_before", label: "before" },
		{ value: "date_after", label: "after" },
		{ value: "date_between", label: "between", requiresRange: true },
		{ value: "date_this_week", label: "this week", requiresValue: false },
		{ value: "date_this_month", label: "this month", requiresValue: false },
		{ value: "date_this_year", label: "this year", requiresValue: false },
		{ value: "is_empty", label: "empty", requiresValue: false },
		{ value: "is_not_empty", label: "not empty", requiresValue: false },
	];

	const booleanOperators: FilterOperator[] = [
		{ value: "equals", label: "is" },
		{ value: "not_equals", label: "is not" },
	];

	switch (fieldType) {
		case "number":
			return numberOperators;
		case "date":
			return dateOperators;
		case "boolean":
			return booleanOperators;
		case "text":
		case "email":
		case "phone":
		case "url":
		default:
			return baseOperators;
	}
};

export function FilterBar({
	objectType,
	filters,
	onFiltersChange,
}: FilterBarProps) {
	const [isAddFilterOpen, setIsAddFilterOpen] = React.useState(false);
	const [editingFilter, setEditingFilter] = React.useState<string | null>(null);
	const [editingValueFilter, setEditingValueFilter] = React.useState<string | null>(null);
	const [openOperatorDropdown, setOpenOperatorDropdown] = React.useState<string | null>(null);
	const [openFieldDropdown, setOpenFieldDropdown] = React.useState<string | null>(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false);
	const [advancedFilter, setAdvancedFilter] = React.useState<AdvancedFilter | null>(null);
	const [isAdvancedFilterMenuOpen, setIsAdvancedFilterMenuOpen] = React.useState(false);
	
	const availableFields = React.useMemo(
		() => getAvailableFieldsForObjectType(objectType),
		[objectType]
	);

	const convertToAdvancedFilter = (filterIds?: string[]) => {
		// Convert selected filters or all filters to advanced filter format
		const filtersToConvert = filterIds
			? filters.filter((f) => filterIds.includes(f.id))
			: filters;

		// If no filters, create an empty condition
		const conditions = filtersToConvert.length > 0
			? filtersToConvert.map((filter) => ({
					id: filter.id,
					field: filter.field,
					operator: filter.operator,
					value: filter.value,
					valueFrom: filter.valueFrom,
					valueTo: filter.valueTo,
				}))
			: [createEmptyCondition()];

		const advancedFilterData: AdvancedFilter = {
			groups: [
				{
					id: generateId(),
					logicalOperator: "and",
					conditions,
					groups: [],
				},
			],
			globalLogicalOperator: "and",
		};

		setAdvancedFilter(advancedFilterData);
		// Keep filters array unchanged - filters stay active, just UI representation changes
		setIsAdvancedFilterOpen(true);
	};

	const openAdvancedFilter = () => {
		// Convert all current filters to advanced filter format
		const conditions = filters.length > 0
			? filters.map((filter) => ({
					id: filter.id,
					field: filter.field,
					operator: filter.operator,
					value: filter.value,
					valueFrom: filter.valueFrom,
					valueTo: filter.valueTo,
				}))
			: [createEmptyCondition()];

		const advancedFilterData: AdvancedFilter = {
			groups: [
				{
					id: generateId(),
					logicalOperator: "and",
					conditions,
					groups: [],
				},
			],
			globalLogicalOperator: "and",
		};

		setAdvancedFilter(advancedFilterData);
		setIsAdvancedFilterOpen(true);
	};

	const isAdvancedFilterActive = React.useMemo(() => {
		if (!advancedFilter) return false;
		// Check if there are any conditions with a field set (not empty)
		return advancedFilter.groups.some((group) =>
			group.conditions.some((condition) => condition.field)
		);
	}, [advancedFilter]);

	// Clear advanced filter state when filters are cleared externally
	React.useEffect(() => {
		if (filters.length === 0 && advancedFilter) {
			setAdvancedFilter(null);
		}
	}, [filters.length]);

	const handleAdvancedFilterChange = (updatedFilter: AdvancedFilter) => {
		// Check if all conditions are empty
		const hasActiveConditions = updatedFilter.groups.some((group) =>
			group.conditions.some((condition) => condition.field)
		);

		if (hasActiveConditions) {
			setAdvancedFilter(updatedFilter);
		} else {
			// Clear advanced filter state when all conditions are empty
			setAdvancedFilter(null);
		}

		// Convert advanced filter back to simple filters
		const simpleFilters: FilterCondition[] = updatedFilter.groups.flatMap(
			(group) =>
				group.conditions
					.filter((condition) => condition.field) // Only include conditions with fields
					.map((condition) => ({
						id: condition.id,
						field: condition.field,
						operator: condition.operator,
						value: condition.value,
						valueFrom: condition.valueFrom,
						valueTo: condition.valueTo,
					}))
		);
		onFiltersChange(simpleFilters);
	};

	const convertToSimpleFilter = () => {
		// Convert advanced filter to simple filters and clear advanced filter state
		if (advancedFilter) {
			const simpleFilters: FilterCondition[] = advancedFilter.groups.flatMap(
				(group) =>
					group.conditions
						.filter((condition) => condition.field) // Only include conditions with fields
						.map((condition) => ({
							id: condition.id,
							field: condition.field,
							operator: condition.operator,
							value: condition.value,
							valueFrom: condition.valueFrom,
							valueTo: condition.valueTo,
						}))
			);
			onFiltersChange(simpleFilters);
			setAdvancedFilter(null);
			setIsAdvancedFilterOpen(false);
		}
	};

	const deleteAdvancedFilter = () => {
		// Clear all filters
		onFiltersChange([]);
		setAdvancedFilter(null);
		setIsAdvancedFilterOpen(false);
	};

	const addNewFilter = (field: any) => {
		const operators = getOperatorsForFieldType(field.type || "text");
		const defaultOperator = operators[0];
		
		const newFilter: FilterCondition = {
			id: `filter-${Date.now()}`,
			field: field.field,
			operator: defaultOperator.value,
			value: defaultOperator.requiresValue === false ? undefined : "",
			valueFrom: undefined,
			valueTo: undefined,
		};
		
		onFiltersChange([...filters, newFilter]);
		setIsAddFilterOpen(false);
		setEditingFilter(newFilter.id);
	};

	const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
		const updatedFilters = filters.map((filter) =>
			filter.id === filterId ? { ...filter, ...updates } : filter
		);
		onFiltersChange(updatedFilters);
	};

	const removeFilter = (filterId: string) => {
		const updatedFilters = filters.filter((filter) => filter.id !== filterId);
		console.log("🗑️ Removing filter:", { filterId, remainingFilters: updatedFilters.length });
		onFiltersChange(updatedFilters);
		setEditingFilter(null);
	};

	const formatFilterValue = (filter: FilterCondition) => {
		const field = availableFields.find(f => f.field === filter.field);
		const operators = getOperatorsForFieldType(field?.type || "text");
		const operator = operators.find(op => op.value === filter.operator);
		
		if (!operator || operator.requiresValue === false) return "";
		
		if (operator.requiresRange && filter.valueFrom && filter.valueTo) {
			return `${filter.valueFrom} - ${filter.valueTo}`;
		}
		
		return filter.value?.toString() || "";
	};

	// Filtered available fields for the add filter popover
	const filteredAvailableFields = React.useMemo(() => {
		if (!searchQuery) return availableFields;
		const query = searchQuery.toLowerCase();
		return availableFields.filter(
			(field) =>
				field.headerName.toLowerCase().includes(query) ||
				field.field.toLowerCase().includes(query)
		);
	}, [availableFields, searchQuery]);

	console.log("🔍 Filters:", filters.length);

	return (
		<>
		<div className="flex items-center gap-2 px-3 py-2">
			{/* Active Filter Chips */}
			<div className="flex items-center gap-2 flex-1 flex-wrap">
				{!isAdvancedFilterActive && filters.map((filter) => {
					const field = availableFields.find(f => f.field === filter.field);
					const operators = getOperatorsForFieldType(field?.type || "text");
					const operator = operators.find(op => op.value === filter.operator);
					const FieldIcon = field ? getFieldTypeIcon(field.type) : IconFilter;
					const filterValue = formatFilterValue(filter);

					return (
						<FilterChip
							key={filter.id}
							filter={filter}
							field={field}
							operator={operator}
							FieldIcon={FieldIcon}
							filterValue={filterValue}
							isEditing={editingFilter === filter.id}
							isEditingValue={editingValueFilter === filter.id}
							isOperatorDropdownOpen={openOperatorDropdown === filter.id}
							isFieldDropdownOpen={openFieldDropdown === filter.id}
							availableFields={availableFields}
							operators={operators}
							onUpdate={(updates) => updateFilter(filter.id, updates)}
							onRemove={() => removeFilter(filter.id)}
							onEdit={() => setEditingFilter(filter.id)}
							onStopEditing={() => setEditingFilter(null)}
							onEditValue={() => setEditingValueFilter(filter.id)}
							onStopEditingValue={() => setEditingValueFilter(null)}
							onOperatorDropdownOpenChange={(open) => setOpenOperatorDropdown(open ? filter.id : null)}
							onFieldDropdownOpenChange={(open) => setOpenFieldDropdown(open ? filter.id : null)}
							onConvertToAdvanced={() => convertToAdvancedFilter([filter.id])}
						/>
					);
				})}

				{/* Add Filter Button */}
				{!isAdvancedFilterActive && (
					<Popover open={isAddFilterOpen} onOpenChange={setIsAddFilterOpen}>
						<PopoverTrigger asChild>
							<Button 
								variant="filter" 
								size="sm" 
								className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
							>
								{filters.length !== 0 ? <IconPlus className="h-4 w-4" /> : "Filter"}
							</Button>
						</PopoverTrigger>
					<PopoverContent className="w-[280px] p-0" align="start">
						<Command>
							<CommandInput
								placeholder="Search attributes..."
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
							<CommandList>
								<CommandEmpty>No fields found.</CommandEmpty>
								<CommandGroup>
									{filteredAvailableFields.map((field) => {
										const FieldIcon = getFieldTypeIcon(field.type);
										return (
											<CommandItem
												key={field.field}
												value={`${field.field} ${field.headerName}`}
												onSelect={() => addNewFilter(field)}
											>
												<div className="flex items-center gap-2 w-full">
													<FieldIcon className="h-4 w-4" />
													<span className="flex-1">{field.headerName}</span>
													<Badge variant="secondary" className="text-xs">
														{formatFieldType(field.type)}
													</Badge>
												</div>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
					</Popover>
				)}

				{/* Advanced Filter Button */}
				{isAdvancedFilterActive && (
					<ButtonGroup className="h-7">
						<Popover 
							open={isAdvancedFilterOpen} 
							onOpenChange={(open) => {
								setIsAdvancedFilterOpen(open);
								if (open && !advancedFilter) {
									openAdvancedFilter();
								}
							}}
						>
							<PopoverTrigger asChild>
								<Button 
									variant="filter" 
									size="sm" 
									className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
								>
									<IconFilter className="h-4 w-4 mr-1" />
									Advanced filter
									{advancedFilter && (
										<span className="ml-1.5 px-1.5 py-0.5 text-xs bg-muted rounded">
											{advancedFilter.groups.reduce(
												(sum, group) => sum + group.conditions.filter((c) => c.field).length,
												0
											)}
										</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[600px] max-h-[80vh] overflow-y-auto p-0" align="start">
								{advancedFilter && (
									<AdvancedFilterComponent
										objectType={objectType}
										filter={advancedFilter}
										onFilterChange={handleAdvancedFilterChange}
										onClose={() => setIsAdvancedFilterOpen(false)}
									/>
								)}
							</PopoverContent>
						</Popover>

						{/* Advanced Filter Menu Button */}
						<DropdownMenu open={isAdvancedFilterMenuOpen} onOpenChange={setIsAdvancedFilterMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="filter"
									size="sm"
									className="h-7 w-7 p-0 bg-muted/80 hover:bg-muted"
									onClick={(e) => {
										e.stopPropagation();
									}}
								>
									<IconDotsVertical className="h-3.5 w-3.5 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										convertToSimpleFilter();
										setIsAdvancedFilterMenuOpen(false);
									}}
								>
									<IconFilter className="h-4 w-4" />
									Convert to simple filter
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={(e) => {
										e.stopPropagation();
										deleteAdvancedFilter();
										setIsAdvancedFilterMenuOpen(false);
									}}
								>
									<IconTrash className="h-4 w-4" />
									Delete filter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</ButtonGroup>
				)}
			</div>
		</div>
	</>
	);

}

// FilterChip component for individual filter display and editing
interface FilterChipProps {
	filter: FilterCondition;
	field: any;
	operator: FilterOperator | undefined;
	FieldIcon: React.ComponentType<any>;
	filterValue: string;
	isEditing: boolean;
	isEditingValue: boolean;
	isOperatorDropdownOpen: boolean;
	isFieldDropdownOpen: boolean;
	availableFields: any[];
	operators: FilterOperator[];
	onUpdate: (updates: Partial<FilterCondition>) => void;
	onRemove: () => void;
	onEdit: () => void;
	onStopEditing: () => void;
	onEditValue: () => void;
	onStopEditingValue: () => void;
	onOperatorDropdownOpenChange: (open: boolean) => void;
	onFieldDropdownOpenChange: (open: boolean) => void;
	onConvertToAdvanced: () => void;
}

function FilterChip({
	filter,
	field,
	operator,
	FieldIcon,
	filterValue,
	isEditing,
	isEditingValue,
	isOperatorDropdownOpen,
	isFieldDropdownOpen,
	availableFields,
	operators,
	onUpdate,
	onRemove,
	onEdit,
	onStopEditing,
	onEditValue,
	onStopEditingValue,
	onOperatorDropdownOpenChange,
	onFieldDropdownOpenChange,
	onConvertToAdvanced,
}: FilterChipProps) {
	const [isFieldOpen, setIsFieldOpen] = React.useState(false);
	const [isOperatorOpen, setIsOperatorOpen] = React.useState(false);
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const [fieldSearchQuery, setFieldSearchQuery] = React.useState("");
	const valueButtonRef = React.useRef<HTMLButtonElement>(null);
	const valueInputRef = React.useRef<HTMLInputElement>(null);
	
	// Local state for input values to enable debouncing
	const [localValue, setLocalValue] = React.useState(filter.value?.toString() || "");
	const [localValueFrom, setLocalValueFrom] = React.useState(filter.valueFrom?.toString() || "");
	const [localValueTo, setLocalValueTo] = React.useState(filter.valueTo?.toString() || "");
	
	// Sync local state when filter changes externally
	React.useEffect(() => {
		setLocalValue(filter.value?.toString() || "");
		setLocalValueFrom(filter.valueFrom?.toString() || "");
		setLocalValueTo(filter.valueTo?.toString() || "");
	}, [filter.value, filter.valueFrom, filter.valueTo]);

	// Position input field below value button and focus it when editing value
	React.useEffect(() => {
		if (isEditingValue && valueButtonRef.current && valueInputRef.current) {
			const updatePosition = () => {
				if (valueButtonRef.current && valueInputRef.current) {
					const buttonRect = valueButtonRef.current.getBoundingClientRect();
					const input = valueInputRef.current;
					input.style.position = "fixed";
					input.style.top = `${buttonRect.bottom + 4}px`;
					input.style.left = `${buttonRect.left}px`;
					input.style.width = `${Math.max(buttonRect.width, 200)}px`;
				}
			};

			updatePosition();
			valueInputRef.current.focus();

			// Update position on scroll/resize
			window.addEventListener("scroll", updatePosition, true);
			window.addEventListener("resize", updatePosition);

			return () => {
				window.removeEventListener("scroll", updatePosition, true);
				window.removeEventListener("resize", updatePosition);
			};
		}
	}, [isEditingValue]);

	// Handle click outside to close value input
	React.useEffect(() => {
		if (!isEditingValue) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				valueInputRef.current &&
				!valueInputRef.current.contains(event.target as Node) &&
				valueButtonRef.current &&
				!valueButtonRef.current.contains(event.target as Node)
			) {
				onStopEditingValue();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isEditingValue, onStopEditingValue]);
	
	// Debounced update function for value input (500ms delay)
	const debouncedUpdateValue = useDebouncedCallback(
		(value: string) => {
			onUpdate({ value: value || undefined });
		},
		500
	);
	
	// Debounced update function for range inputs
	const debouncedUpdateRange = useDebouncedCallback(
		(valueFrom: string, valueTo: string) => {
			onUpdate({
				valueFrom: valueFrom || undefined,
				valueTo: valueTo || undefined,
			});
		},
		500
	);

	// Filtered available fields for the field dropdown
	const filteredFields = React.useMemo(() => {
		if (!fieldSearchQuery) return availableFields;
		const query = fieldSearchQuery.toLowerCase();
		return availableFields.filter(
			(f) =>
				f.headerName.toLowerCase().includes(query) ||
				f.field.toLowerCase().includes(query)
		);
	}, [availableFields, fieldSearchQuery]);

	const handleFieldChange = (newField: any) => {
		const newOperators = getOperatorsForFieldType(newField.type || "text");
		const defaultOperator = newOperators[0];
		
		onUpdate({
			field: newField.field,
			operator: defaultOperator.value,
			value: defaultOperator.requiresValue === false ? undefined : "",
			valueFrom: undefined,
			valueTo: undefined,
		});
		setIsFieldOpen(false);
		setFieldSearchQuery("");
		onFieldDropdownOpenChange(false);
	};

	const handleOperatorChange = (newOperator: FilterOperator) => {
		onUpdate({
			operator: newOperator.value,
			value: newOperator.requiresValue === false ? undefined : "",
			valueFrom: undefined,
			valueTo: undefined,
		});
		setIsOperatorOpen(false);
		onOperatorDropdownOpenChange(false);
	};

	if (isEditing) {
		return (
			<ButtonGroup className="h-7">
				{/* Field Selector */}
				<Popover open={isFieldOpen} onOpenChange={setIsFieldOpen}>
					<PopoverTrigger asChild>
						<Button 
							variant="outline" 
							size="sm" 
							className="h-7 px-2 text-xs bg-muted/50 hover:bg-muted"
						>
							<FieldIcon className="h-3.5 w-3.5 mr-1 shrink-0" />
							<span className="min-w-0 truncate">{field?.headerName || "Field"}</span>
							<IconChevronDown className="h-3 w-3 ml-1 shrink-0" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[250px] p-0" align="start">
						<Command>
							<CommandInput placeholder="Search fields..." />
							<CommandList>
								<CommandEmpty>No fields found.</CommandEmpty>
								<CommandGroup>
									{availableFields.map((availableField) => {
										const Icon = getFieldTypeIcon(availableField.type);
										return (
											<CommandItem
												key={availableField.field}
												value={`${availableField.field} ${availableField.headerName}`}
												onSelect={() => handleFieldChange(availableField)}
											>
												<div className="flex items-center gap-2 w-full">
													<Icon className="h-4 w-4" />
													<span className="flex-1">{availableField.headerName}</span>
													<Badge variant="secondary" className="text-xs">
														{formatFieldType(availableField.type)}
													</Badge>
												</div>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{/* Operator Selector */}
				<Popover open={isOperatorOpen} onOpenChange={setIsOperatorOpen}>
					<PopoverTrigger asChild>
						<Button 
							variant="outline" 
							size="sm" 
							className="h-7 px-2 text-xs bg-muted/50 hover:bg-muted"
						>
							{operator?.label || "Select condition"}
							<IconChevronDown className="h-3 w-3 ml-1 shrink-0" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[180px] p-0" align="start">
						<Command>
							<CommandList>
								<CommandGroup>
									{operators.map((op) => (
										<CommandItem
											key={op.value}
											value={op.label}
											onSelect={() => handleOperatorChange(op)}
										>
											{op.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{/* Value Input */}
				{operator && operator.requiresValue !== false && (
					<>
						{operator.requiresRange ? (
							<>
								<Input
									placeholder="From"
									value={localValueFrom}
									onChange={(e) => {
										const newValueFrom = e.target.value;
										setLocalValueFrom(newValueFrom);
										debouncedUpdateRange(newValueFrom, localValueTo);
									}}
									className="h-7 w-20 text-xs px-2 bg-background border-muted/50 rounded-none border-r border-t border-b"
									type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
								/>
								<span className="text-xs text-muted-foreground px-1 bg-muted/50 border-y border-muted/50 flex items-center h-7">-</span>
								<Input
									placeholder="To"
									value={localValueTo}
									onChange={(e) => {
										const newValueTo = e.target.value;
										setLocalValueTo(newValueTo);
										debouncedUpdateRange(localValueFrom, newValueTo);
									}}
									className="h-7 w-20 text-xs px-2 bg-background border-muted/50 rounded-none"
									type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
								/>
							</>
						) : (
							<Input
								placeholder="enter text..."
								value={localValue}
								onChange={(e) => {
									const newValue = e.target.value;
									setLocalValue(newValue);
									debouncedUpdateValue(newValue);
								}}
								className="h-7 min-w-[120px] text-xs px-2 !bg-background border-muted/50 rounded-none border-r border-t border-b focus:ring-2 focus:ring-ring focus:z-10 relative"
								type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
								onBlur={() => {
									// Ensure final value is saved on blur
									onUpdate({ value: localValue || undefined });
									onStopEditing();
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										// Ensure final value is saved on Enter
										onUpdate({ value: localValue || undefined });
										onStopEditing();
									} else if (e.key === "Escape") {
										// Reset to original value on Escape
										setLocalValue(filter.value?.toString() || "");
										onStopEditing();
									}
								}}
								autoFocus
							/>
						)}
					</>
				)}
			</ButtonGroup>
		);
	}

	return (
		<div className="relative">
			<ButtonGroup className="h-7 group">
			{/* Field Display Button - Click to open dropdown */}
			<Popover 
				open={isFieldDropdownOpen} 
				onOpenChange={(open) => {
					onFieldDropdownOpenChange(open);
					if (!open) {
						setFieldSearchQuery("");
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-7 px-2 text-xs bg-muted/80 hover:bg-muted"
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<FieldIcon className="h-3.5 w-3.5 mr-1 shrink-0" />
						<span className="min-w-0 truncate">{field?.headerName || "Unknown"}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[280px] p-0" align="start">
					<Command>
						<CommandInput
							placeholder="Search attributes..."
							value={fieldSearchQuery}
							onValueChange={setFieldSearchQuery}
						/>
						<CommandList>
							<CommandEmpty>No fields found.</CommandEmpty>
							<CommandGroup>
								{filteredFields.map((availableField) => {
									const Icon = getFieldTypeIcon(availableField.type);
									return (
										<CommandItem
											key={availableField.field}
											value={`${availableField.field} ${availableField.headerName}`}
											onSelect={() => handleFieldChange(availableField)}
										>
											<div className="flex items-center gap-2 w-full">
												<Icon className="h-4 w-4" />
												<span className="flex-1">{availableField.headerName}</span>
												<Badge variant="secondary" className="text-xs">
													{formatFieldType(availableField.type)}
												</Badge>
											</div>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{/* Operator Display Button - Click to open dropdown */}
			{operator && (
				<DropdownMenu open={isOperatorDropdownOpen} onOpenChange={onOperatorDropdownOpenChange}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="h-7 px-2 text-xs bg-muted/80 hover:bg-muted data-[state=open]:bg-muted"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							{operator.label}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[180px]">
						{operators.map((op) => (
							<DropdownMenuItem
								key={op.value}
								onClick={(e) => {
									e.stopPropagation();
									handleOperatorChange(op);
								}}
								className="flex items-center justify-between"
							>
								<span>{op.label}</span>
								{op.value === operator.value && (
									<CheckIcon className="h-4 w-4 text-primary" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{/* Value Display Button - Click to edit value */}
			{operator && operator.requiresValue !== false && (
				<Button
					ref={valueButtonRef}
					variant="outline"
					size="sm"
					className="h-7 px-2 text-xs bg-muted/80 hover:bg-muted"
					onClick={(e) => {
						e.stopPropagation();
						onEditValue();
					}}
				>
					<span className="min-w-0 truncate text-muted-foreground">
						{filterValue || "enter value..."}
					</span>
				</Button>
			)}

				{/* Menu Button */}
				<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="h-7 w-7 p-0 bg-muted/80 hover:bg-muted"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<IconDotsVertical className="h-3.5 w-3.5 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onConvertToAdvanced();
								setIsMenuOpen(false);
							}}
						>
							<IconFilter className="h-4 w-4" />
							Convert to advanced filter
						</DropdownMenuItem>
						<DropdownMenuItem
							variant="destructive"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
								setIsMenuOpen(false);
							}}
						>
							<IconTrash className="h-4 w-4" />
							Delete filter
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ButtonGroup>

			{/* Value Input Field - Appears below value button when editing */}
			{isEditingValue && operator && operator.requiresValue !== false && !operator.requiresRange && (
				<Input
					ref={valueInputRef}
					value={localValue}
					onChange={(e) => {
						const newValue = e.target.value;
						setLocalValue(newValue);
						debouncedUpdateValue(newValue);
					}}
					className="h-9 text-sm px-3 bg-background border-2 border-primary rounded-md shadow-lg z-50"
					type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
					onBlur={() => {
						// Ensure final value is saved on blur
						onUpdate({ value: localValue || undefined });
						onStopEditingValue();
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							// Ensure final value is saved on Enter
							onUpdate({ value: localValue || undefined });
							onStopEditingValue();
						} else if (e.key === "Escape") {
							// Reset to original value on Escape
							setLocalValue(filter.value?.toString() || "");
							onStopEditingValue();
						}
					}}
				/>
			)}
		</div>
	);
}
