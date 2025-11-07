"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getObjectTypeRoutePath, getViewIconConfig } from "@/lib/utils";
import { useCreateView } from "@/hooks/views";
import { motion, AnimatePresence } from "motion/react";

interface CreateViewSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationSlug: string;
	objectType: "contact" | "property" | "company";
}

// Common status attributes for each object type
const STATUS_ATTRIBUTES: Record<string, Array<{ value: string; label: string; icon?: string }>> = {
	contact: [
		{ value: "status", label: "Status" },
		{ value: "stage", label: "Stage" },
	],
	property: [
		{ value: "status", label: "Status" },
		{ value: "stage", label: "Stage" },
	],
	company: [
		{ value: "status", label: "Status" },
		{ value: "stage", label: "Stage" },
	],
};

export function CreateViewSheet({
	open,
	onOpenChange,
	organizationSlug,
	objectType,
}: CreateViewSheetProps) {
	const navigate = useNavigate();
	const { createView, isLoading } = useCreateView();
	const [viewType, setViewType] = React.useState<"table" | "kanban">("table");
	const [title, setTitle] = React.useState("");
	const [statusAttribute, setStatusAttribute] = React.useState<string>("");
	const [statusPopoverOpen, setStatusPopoverOpen] = React.useState(false);
	const [statusSearchQuery, setStatusSearchQuery] = React.useState("");

	const availableAttributes = STATUS_ATTRIBUTES[objectType] || [];

	const filteredAttributes = React.useMemo(() => {
		if (!statusSearchQuery) return availableAttributes;
		return availableAttributes.filter((attr) =>
			attr.label.toLowerCase().includes(statusSearchQuery.toLowerCase())
		);
	}, [availableAttributes, statusSearchQuery]);

	const selectedAttribute = availableAttributes.find(
		(attr) => attr.value === statusAttribute
	);

	const handleCreate = () => {
		if (!title.trim()) return;

		createView(
			{
				organizationSlug,
				objectType,
				name: title.trim(),
				viewType,
				statusAttribute: viewType === "kanban" ? statusAttribute : undefined,
			},
			{
				onSuccess: (newView) => {
					// Reset form
					setTitle("");
					setViewType("table");
					setStatusAttribute("");
					onOpenChange(false);

					// Navigate to the new view
					const routePath = getObjectTypeRoutePath(objectType);
					navigate({
						to: `/$slug/${routePath}/view/$viewId`,
						params: {
							slug: organizationSlug,
							viewId: newView.id,
						},
					});
				},
				onError: (error) => {
					console.error("Error creating view:", error);
					// TODO: Show error toast
				},
			}
		);
	};

	const handleCancel = () => {
		setTitle("");
		setViewType("table");
		setStatusAttribute("");
		onOpenChange(false);
	};

	// Handle ESC key
	React.useEffect(() => {
		if (!open) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleCancel();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open]);

	// Find the scrollable content area that contains ObjectHeader
	const [container, setContainer] = React.useState<HTMLElement | null>(null);
	const [headerHeight, setHeaderHeight] = React.useState(0);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
		if (open) {
			// Find the scrollable content area inside SidebarInset (the div with flex-1 overflow-y-auto)
			const inset = document.querySelector('[data-slot="sidebar-inset"]') as HTMLElement;
			if (inset) {
				// Find the scrollable content div
				const scrollableDiv = inset.querySelector('.overflow-y-auto') as HTMLElement;
				if (scrollableDiv) {
					setContainer(scrollableDiv);
					// Find ObjectHeader to get its height
					const objectHeader = scrollableDiv.querySelector('[class*="border-b"]') as HTMLElement;
					if (objectHeader) {
						setHeaderHeight(objectHeader.offsetHeight);
					}
				} else {
					setContainer(inset);
				}
			}
		}
	}, [open]);

	if (!mounted) return null;

	const sheetContent = (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					transition={{ type: "spring", damping: 30, stiffness: 300 }}
					className="absolute bg-accent right-0 bottom-0 w-[400px] border-l shadow-xl z-50 flex flex-col pointer-events-auto"
					style={{
						top: `${headerHeight * 2.2}px`,
					}}
				>
						{/* Header */}
						<div className="flex items-center justify-between p-2 border-b">
							<h2 className="text-md">Create view</h2>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleCancel}
								className="h-8 w-8"
							>
								<IconX className="h-4 w-4" />
							</Button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* View Type Selection */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">View type</Label>
								<div className="flex flex-col gap-3">
									{/* Table Option */}
									{(() => {
										const { Icon, bgColor, iconClassName } = getViewIconConfig("table");
										return (
											<button
												type="button"
												onClick={() => setViewType("table")}
												className={cn(
													"relative p-4 rounded-xl border transition-all text-left",
													viewType === "table"
														? "border-primary bg-accent"
														: "border-border hover:border-border/80"
												)}
											>
												<div className="flex items-start gap-3">
													<div className={cn(
														"p-2 rounded-lg flex items-center justify-center shrink-0",
														viewType === "table" ? bgColor : "bg-muted"
													)}>
														<Icon className={cn(
															"h-6 w-6",
															viewType === "table" 
																? iconClassName
																: "text-muted-foreground"
														)} />
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm">Table</div>
														<div className="text-xs text-muted-foreground mt-1">
															Organize your records on a table
														</div>
													</div>
												</div>
											</button>
										);
									})()}

									{/* Kanban Option */}
									{(() => {
										const { Icon, bgColor, iconClassName } = getViewIconConfig("kanban");
										return (
											<button
												type="button"
												onClick={() => setViewType("kanban")}
												className={cn(
													"relative p-4 rounded-xl border transition-all text-left",
													viewType === "kanban"
														? "border-primary bg-primary/5"
														: "border-border hover:border-border/80"
												)}
											>
												<div className="flex items-start gap-3">
													<div className={cn(
														"p-2 rounded-lg flex items-center justify-center shrink-0",
														viewType === "kanban" ? bgColor : "bg-muted"
													)}>
														<Icon className={cn(
															"h-6 w-6",
															viewType === "kanban" 
																? iconClassName
																: "text-muted-foreground"
														)} />
													</div>
													<div className="flex-1 min-w-0">
														<div className="font-medium text-sm">Kanban</div>
														<div className="text-xs text-muted-foreground mt-1">
															Organize your records on a pipeline
														</div>
													</div>
												</div>
											</button>
										);
									})()}
								</div>
							</div>

							{/* Title Input */}
							<div className="space-y-2">
								<Label htmlFor="view-title" className="text-sm font-medium">
									Title
								</Label>
								<Input
									id="view-title"
									placeholder="Enter a title for this view"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && title.trim()) {
											handleCreate();
										}
									}}
									autoFocus
								/>
							</div>

							{/* Status Attribute (only for Kanban) */}
							{viewType === "kanban" && (
								<div className="space-y-2">
									<Label className="text-sm font-medium">Status attribute</Label>
									<Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												className="w-full justify-between font-normal"
											>
												{selectedAttribute ? (
													<span>{selectedAttribute.label}</span>
												) : (
													<span className="text-muted-foreground">
														Select a status attribute
													</span>
												)}
												<IconX className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-full p-0" align="start">
											<Command>
												<CommandInput
													placeholder="Search attributes..."
													value={statusSearchQuery}
													onValueChange={setStatusSearchQuery}
													icon={false}
												/>
												<CommandList>
													<CommandEmpty>No attributes found.</CommandEmpty>
													<CommandGroup>
														{filteredAttributes.map((attr) => (
															<CommandItem
																key={attr.value}
																value={attr.value}
																onSelect={() => {
																	setStatusAttribute(attr.value);
																	setStatusPopoverOpen(false);
																	setStatusSearchQuery("");
																}}
															>
																{attr.icon && (
																	<span className="mr-2">{attr.icon}</span>
																)}
																{attr.label}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="flex items-center justify-end gap-2 p-2 border-t">
							<Button
								variant="ghost"
								onClick={handleCancel}
								className="gap-2"
							>
								Cancel
								<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
									ESC
								</span>
							</Button>
							<Button
								onClick={handleCreate}
								disabled={!title.trim() || isLoading || (viewType === "kanban" && !statusAttribute)}
								className="gap-2"
							>
								Create view
								<span className="text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded">
									↵
								</span>
							</Button>
						</div>
					</motion.div>
			)}
		</AnimatePresence>
	);

	// Render using portal if container found, otherwise render normally
	if (container) {
		return createPortal(
			<div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
				<div className="relative w-full h-full">
					{sheetContent}
				</div>
			</div>,
			container
		);
	}

	return (
		<div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
			<div className="relative w-full h-full">
				{sheetContent}
			</div>
		</div>
	);
}

