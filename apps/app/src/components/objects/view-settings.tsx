"use client";

import * as React from "react";
import {
	IconGripVertical,
	IconDotsVertical,
	IconChevronLeft,
	IconPlus,
	IconX,
	IconTag,
    IconColumns3,
    IconChevronDown,
} from "@tabler/icons-react";
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
} from "@/components/ui/sortable";
import { cn } from "@/lib/utils";
import {
	getAvailableFieldsForObjectType,
	type AvailableField,
} from "@/lib/table-columns";
import {
	getFieldTypeIcon,
	isSystemField,
} from "@/lib/field-utils";

interface ColumnDef {
	field: string;
	headerName: string;
	width?: number;
	type?: string;
	visible?: boolean;
}

interface ViewSettingsProps {
	objectType: "contact" | "company" | "property";
	columnDefs: ColumnDef[];
	onColumnDefsChange: (columnDefs: ColumnDef[]) => void;
	variant?: "button" | "text"; // Variant for the trigger - button (default) or text
}

export function ViewSettings({
	objectType,
	columnDefs,
	onColumnDefsChange,
	variant = "button",
}: ViewSettingsProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [showAddColumn, setShowAddColumn] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
	const [editValue, setEditValue] = React.useState("");

	const availableFields = React.useMemo(
		() => getAvailableFieldsForObjectType(objectType),
		[objectType]
	);

	// Get fields that are already in columnDefs
	const usedFields = React.useMemo(
		() => new Set(columnDefs.map((def) => def.field)),
		[columnDefs]
	);

	// Filter available fields that aren't already added
	const availableToAdd = React.useMemo(() => {
		return availableFields.filter((field) => !usedFields.has(field.field));
	}, [availableFields, usedFields]);

	// Filter available fields by search query
	const filteredAvailableFields = React.useMemo(() => {
		if (!searchQuery) return availableToAdd;
		const query = searchQuery.toLowerCase();
		return availableToAdd.filter(
			(field) =>
				field.headerName.toLowerCase().includes(query) ||
				field.field.toLowerCase().includes(query)
		);
	}, [availableToAdd, searchQuery]);

	// Filter columns by search query
	const filteredColumns = React.useMemo(() => {
		if (!searchQuery) return columnDefs;
		const query = searchQuery.toLowerCase();
		return columnDefs.filter(
			(def) =>
				def.headerName.toLowerCase().includes(query) ||
				def.field.toLowerCase().includes(query)
		);
	}, [columnDefs, searchQuery]);

	const handleAddColumn = (field: AvailableField) => {
		const newColumnDef: ColumnDef = {
			field: field.field,
			headerName: field.headerName,
			width: 150,
			type: field.type,
			visible: true,
		};
		onColumnDefsChange([...columnDefs, newColumnDef]);
		setShowAddColumn(false);
		setSearchQuery("");
	};

	const handleRemoveColumn = (field: string) => {
		onColumnDefsChange(columnDefs.filter((def) => def.field !== field));
	};

	const handleRenameColumn = (field: string, newName: string) => {
		if (!newName.trim()) return;
		onColumnDefsChange(
			columnDefs.map((def) =>
				def.field === field ? { ...def, headerName: newName.trim() } : def
			)
		);
		setEditingColumnId(null);
		setEditValue("");
	}; 

	const handleReorder = (newOrder: ColumnDef[]) => {
		onColumnDefsChange(newOrder);
	};

	const startEditing = (columnDef: ColumnDef) => {
		setEditingColumnId(columnDef.field);
		setEditValue(columnDef.headerName);
	};

	const cancelEditing = () => {
		setEditingColumnId(null);
		setEditValue("");
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{variant === "text" ? (
					<button
						type="button"
						className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
					>
						+ Add column
					</button>
				) : (
					<Button variant="action">
						<IconColumns3 className="h-4 w-4" />
						<span className="font-medium text-white">View settings</span>
						<IconChevronDown className="h-4 w-4 ml-1 text-gray-400 shrink-0" />
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0" align="start">
				<Command>
					{showAddColumn ? (
						<>
							<div className="flex items-center gap-2 px-2 py-1.5 border-b">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => {
										setShowAddColumn(false);
										setSearchQuery("");
									}}
								>
									<IconChevronLeft className="h-4 w-4" />
								</Button>
								<span className="text-sm text-muted-foreground">Add column</span>
							</div>
							<CommandInput
								placeholder="Search attributes..."
								value={searchQuery}
								onValueChange={setSearchQuery}
								icon={false}
							/>
							<CommandList>
								<CommandEmpty>No attributes found.</CommandEmpty>
								<CommandGroup>
									{filteredAvailableFields.map((field) => {
										const FieldIcon = getFieldTypeIcon(field.type);
										return (
											<CommandItem
												key={field.field}
												onSelect={() => handleAddColumn(field)}
												className={cn(
													"group relative rounded-lg flex items-center h-7 gap-1"
												)}
											>
												<FieldIcon className="h-4 w-4 text-muted-foreground shrink-0" />
												<span className="flex-1">{field.headerName}</span>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</>
					) : (
						<>
							<CommandInput
								placeholder="Search columns..."
								value={searchQuery}
								onValueChange={setSearchQuery}
								icon={false}
							/>
							<CommandList>
								<CommandEmpty>No columns found.</CommandEmpty>
								<CommandGroup>
									<Sortable
										value={columnDefs}
										onValueChange={handleReorder}
										getItemValue={(item) => item.field}
									>
										<SortableContent className="flex flex-col">
											{filteredColumns.map((columnDef) => {
												const fieldType = columnDef.type || "text";
												const FieldIcon = getFieldTypeIcon(fieldType);
												const isSystem = isSystemField(columnDef.field);
												const isEditing = editingColumnId === columnDef.field;

												return (
													<SortableItem
														key={columnDef.field}
														value={columnDef.field}
														className="group/item"
													>
														<CommandItem
															onSelect={() => {}}
															className={cn(
																"group relative rounded-lg flex items-center h-7 gap-1",
																"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
															)}
														>
															<SortableItemHandle className="cursor-grab text-muted-foreground hover:text-foreground shrink-0">
																<IconGripVertical className="h-4 w-4" />
															</SortableItemHandle>
															<FieldIcon className="h-4 w-4 text-muted-foreground shrink-0" />
															{isEditing ? (
																<Input
																	value={editValue}
																	onChange={(e) => setEditValue(e.target.value)}
																	onBlur={() => {
																		if (editValue.trim()) {
																			handleRenameColumn(columnDef.field, editValue);
																		} else {
																			cancelEditing();
																		}
																	}}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") {
																			if (editValue.trim()) {
																				handleRenameColumn(columnDef.field, editValue);
																			}
																		} else if (e.key === "Escape") {
																			cancelEditing();
																		}
																	}}
																	className="h-7 flex-1 text-sm"
																	autoFocus
																	onClick={(e) => e.stopPropagation()}
																/>
															) : (
																<span className="flex-1 text-sm truncate">
																	{columnDef.headerName}
																</span>
															)}
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 opacity-0 group-hover/item:opacity-100 hover:bg-transparent rounded-lg ml-auto shrink-0"
																		onClick={(e) => e.stopPropagation()}
																	>
																		<IconDotsVertical className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	{!isSystem && (
																		<>
																			<DropdownMenuItem
																				onClick={() => startEditing(columnDef)}
																			>
																				<IconTag className="h-4 w-4 mr-2" />
																				Change attribute label
																			</DropdownMenuItem>
																			<DropdownMenuSeparator />
																		</>
																	)}
																	<DropdownMenuItem
																		onClick={() => handleRemoveColumn(columnDef.field)}
																		className="text-destructive focus:text-destructive"
																	>
																		<IconX className="h-4 w-4 mr-2" />
																		Remove column
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</CommandItem>
													</SortableItem>
												);
											})}
										</SortableContent>
									</Sortable>
								</CommandGroup>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => setShowAddColumn(true)}
										className={cn(
											"group relative rounded-lg flex items-center h-7 gap-1"
										)}
									>
										<IconPlus className="h-4 w-4" />
										Add column
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	);
}

