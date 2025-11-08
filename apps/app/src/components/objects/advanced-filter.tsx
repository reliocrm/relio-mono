"use client";

import * as React from "react";
import {
	IconChevronDown,
	IconFilter,
	IconDotsVertical,
	IconTrash,
	IconPlus,
	IconRefresh,
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
import type {
	AdvancedFilter,
	FilterGroup,
	FilterCondition,
} from "@/lib/filters/types";
import { getOperatorsForFieldType } from "@/lib/filters/types";
import { generateId, createEmptyCondition } from "@/lib/filters/types";

interface AdvancedFilterProps {
	objectType: "contact" | "property" | "company";
	filter: AdvancedFilter;
	onFilterChange: (filter: AdvancedFilter) => void;
	onClose?: () => void;
}

interface FilterOperator {
	value: string;
	label: string;
	requiresValue?: boolean;
	requiresRange?: boolean;
}

export function AdvancedFilterComponent({
	objectType,
	filter,
	onFilterChange,
	onClose,
}: AdvancedFilterProps) {
	const availableFields = React.useMemo(
		() => getAvailableFieldsForObjectType(objectType),
		[objectType]
	);

	const addCondition = (groupId: string) => {
		const newCondition = createEmptyCondition();
		const updatedFilter = {
			...filter,
			groups: filter.groups.map((group) =>
				group.id === groupId
					? {
							...group,
							conditions: [...group.conditions, newCondition],
						}
					: group
			),
		};
		onFilterChange(updatedFilter);
	};

	const updateCondition = (
		groupId: string,
		conditionId: string,
		updates: Partial<FilterCondition>
	) => {
		const updatedFilter = {
			...filter,
			groups: filter.groups.map((group) =>
				group.id === groupId
					? {
							...group,
							conditions: group.conditions.map((condition) =>
								condition.id === conditionId
									? { ...condition, ...updates }
									: condition
							),
						}
					: group
			),
		};
		onFilterChange(updatedFilter);
	};

	const removeCondition = (groupId: string, conditionId: string) => {
		const updatedFilter = {
			...filter,
			groups: filter.groups.map((group) =>
				group.id === groupId
					? {
							...group,
							conditions: group.conditions.filter(
								(c) => c.id !== conditionId
							),
						}
					: group
			),
		};
		onFilterChange(updatedFilter);
	};

	const toggleLogicalOperator = (groupId: string) => {
		const updatedFilter = {
			...filter,
			groups: filter.groups.map((group) =>
				group.id === groupId
					? {
							...group,
							logicalOperator:
								group.logicalOperator === "and" ? "or" : "and",
						}
					: group
			),
		};
		onFilterChange(updatedFilter as AdvancedFilter);
	};

	const clearAllFilters = () => {
		const emptyFilter: AdvancedFilter = {
			groups: [
				{
					id: generateId(),
					logicalOperator: "and",
					conditions: [createEmptyCondition()],
					groups: [],
				},
			],
			globalLogicalOperator: "and",
		};
		onFilterChange(emptyFilter);
	};

	return (
		<div className="p-4 space-y-4">
			{/* Where label */}
			<div className="flex items-start gap-4">
				<span className="text-sm text-muted-foreground pt-2">Where</span>
				<div className="flex-1 space-y-3">
					{filter.groups.map((group, groupIndex) => (
						<div key={group.id} className="space-y-3">
							{group.conditions.map((condition, conditionIndex) => {
								const field = availableFields.find(
									(f) => f.field === condition.field
								);
								const operators = getOperatorsForFieldType(
									field?.type || "text"
								);
								const operator = operators.find(
									(op) => op.value === condition.operator
								);
								const FieldIcon = field
									? getFieldTypeIcon(field.type)
									: IconFilter;

								return (
									<div key={condition.id} className="flex items-center gap-2">
										{conditionIndex > 0 && (
											<Button
												variant="outline"
												size="sm"
												className="h-7 px-3 text-xs font-medium border-primary text-primary hover:bg-primary/10"
												onClick={() =>
													toggleLogicalOperator(group.id)
												}
											>
												{group.logicalOperator === "and"
													? "And"
													: "Or"}
												<IconRefresh className="h-3 w-3 ml-1" />
											</Button>
										)}
										<FilterConditionRow
											condition={condition}
											field={field}
											operator={operator}
											FieldIcon={FieldIcon}
											availableFields={availableFields}
											operators={operators}
											onUpdate={(updates) =>
												updateCondition(
													group.id,
													condition.id,
													updates
												)
											}
											onRemove={() =>
												removeCondition(group.id, condition.id)
											}
										/>
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between pt-2 border-t">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 text-xs"
					onClick={() => {
						if (filter.groups.length > 0) {
							addCondition(filter.groups[0].id);
						}
					}}
				>
					<IconPlus className="h-4 w-4 mr-1" />
					Add filter
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 text-xs text-muted-foreground hover:text-foreground"
					onClick={clearAllFilters}
				>
					Clear all filters
				</Button>
			</div>
		</div>
	);
}

interface FilterConditionRowProps {
	condition: FilterCondition;
	field: any;
	operator: FilterOperator | undefined;
	FieldIcon: React.ComponentType<any>;
	availableFields: any[];
	operators: FilterOperator[];
	onUpdate: (updates: Partial<FilterCondition>) => void;
	onRemove: () => void;
}

function FilterConditionRow({
	condition,
	field,
	operator,
	FieldIcon,
	availableFields,
	operators,
	onUpdate,
	onRemove,
}: FilterConditionRowProps) {
	const [isFieldOpen, setIsFieldOpen] = React.useState(false);
	const [isOperatorOpen, setIsOperatorOpen] = React.useState(false);
	const [fieldSearchQuery, setFieldSearchQuery] = React.useState("");
	const [localValue, setLocalValue] = React.useState(
		condition.value?.toString() || ""
	);
	const [localValueFrom, setLocalValueFrom] = React.useState(
		condition.valueFrom?.toString() || ""
	);
	const [localValueTo, setLocalValueTo] = React.useState(
		condition.valueTo?.toString() || ""
	);

	React.useEffect(() => {
		setLocalValue(condition.value?.toString() || "");
		setLocalValueFrom(condition.valueFrom?.toString() || "");
		setLocalValueTo(condition.valueTo?.toString() || "");
	}, [condition.value, condition.valueFrom, condition.valueTo]);

	const debouncedUpdateValue = useDebouncedCallback(
		(value: string) => {
			onUpdate({ value: value || undefined });
		},
		500
	);

	const debouncedUpdateRange = useDebouncedCallback(
		(valueFrom: string, valueTo: string) => {
			onUpdate({
				valueFrom: valueFrom || undefined,
				valueTo: valueTo || undefined,
			});
		},
		500
	);

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
	};

	const handleOperatorChange = (newOperator: FilterOperator) => {
		onUpdate({
			operator: newOperator.value,
			value: newOperator.requiresValue === false ? undefined : "",
			valueFrom: undefined,
			valueTo: undefined,
		});
		setIsOperatorOpen(false);
	};

	const formatFilterValue = () => {
		if (!operator || operator.requiresValue === false) return "";

		if (operator.requiresRange && condition.valueFrom && condition.valueTo) {
			return `${condition.valueFrom} - ${condition.valueTo}`;
		}

		return condition.value?.toString() || "";
	};

	const filterValue = formatFilterValue();

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
						<span className="min-w-0 truncate">
							{field?.headerName || "Select field"}
						</span>
						<IconChevronDown className="h-3 w-3 ml-1 shrink-0" />
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
												<span className="flex-1">
													{availableField.headerName}
												</span>
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
										<div className="flex items-center justify-between w-full">
											<span>{op.label}</span>
											{op.value === condition.operator && (
												<CheckIcon className="h-4 w-4 text-primary" />
											)}
										</div>
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
								className="h-7 w-20 text-xs px-2 bg-background rounded-none border-r border-t border-b"
								type={
									field?.type === "number"
										? "number"
										: field?.type === "date"
											? "date"
											: "text"
								}
							/>
							<span className="text-xs text-muted-foreground px-1 bg-muted/50 border-y flex items-center h-7">
								-
							</span>
							<Input
								placeholder="To"
								value={localValueTo}
								onChange={(e) => {
									const newValueTo = e.target.value;
									setLocalValueTo(newValueTo);
									debouncedUpdateRange(localValueFrom, newValueTo);
								}}
								className="h-7 w-20 text-xs px-2 bg-background rounded-none border-r border-t border-b"
								type={
									field?.type === "number"
										? "number"
										: field?.type === "date"
											? "date"
											: "text"
								}
							/>
						</>
					) : (
						<Input
							placeholder="Enter value..."
							value={localValue}
							onChange={(e) => {
								const newValue = e.target.value;
								setLocalValue(newValue);
								debouncedUpdateValue(newValue);
							}}
							className="h-7 min-w-[120px] text-xs px-2 bg-background rounded-none border-r border-t border-b"
							type={
								field?.type === "number"
									? "number"
									: field?.type === "date"
										? "date"
										: "text"
							}
						/>
					)}
				</>
			)}

			{/* Remove Button */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-7 w-7 p-0 bg-muted/50 hover:bg-muted"
					>
						<IconDotsVertical className="h-3.5 w-3.5 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[180px]">
					<DropdownMenuItem
						variant="destructive"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
					>
						<IconTrash className="h-4 w-4" />
						Delete filter
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ButtonGroup>
	);
}

