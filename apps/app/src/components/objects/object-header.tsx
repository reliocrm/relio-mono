"use client";

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
	IconPlus,
	IconChevronDown,
	IconDotsVertical,
	IconStar,
	IconPencil,
	IconCopy,
	IconTrash,
	IconCheck,
	IconDatabaseHeart,
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
import { useTRPC } from "@/utils/trpc";
import { cn, getObjectTypeRoutePath, getViewIconConfig } from "@/lib/utils";
import {
	useDuplicateView,
	useDeleteView,
	useUpdateView,
	useSetUserDefaultView,
} from "@/hooks/views";
import { useToggleFavorite } from "@/hooks/favorites/use-toggle-favorite";
import { IconStarFilled } from "@tabler/icons-react";
import { CreateViewSheet } from "./create-view-sheet";
import { ViewSettings } from "./view-settings";

interface ObjectHeaderProps {
	organizationSlug: string;
	objectType: "contact" | "property" | "company";
	currentViewId?: string;
	onViewChange?: (viewId: string) => void;
}

export function ObjectHeader({
	organizationSlug,
	objectType,
	currentViewId,
	onViewChange,
}: ObjectHeaderProps) {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const { toggleFavorite } = useToggleFavorite(organizationSlug);
	const [viewPopoverOpen, setViewPopoverOpen] = React.useState(false);
	const [createViewSheetOpen, setCreateViewSheetOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [renamingViewId, setRenamingViewId] = React.useState<string | null>(null);
	const [renameValue, setRenameValue] = React.useState("");

	const { duplicateView } = useDuplicateView();
	const { deleteView } = useDeleteView();
	const { updateView } = useUpdateView();
	const { setUserDefaultView } = useSetUserDefaultView();

	const favoritesQuery = useQuery(
		trpc.favorite.getAllFavorites.queryOptions({
			organizationSlug,
		})
	);

	const viewsQuery = useQuery(
		trpc.view.getViewsByObjectType.queryOptions({
			organizationSlug,
			objectType,
		})
	);

	const currentViewQuery = useQuery(
		trpc.view.getViewById.queryOptions({
			viewId: currentViewId || "",
		})
	);

	const userDefaultViewQuery = useQuery(
		trpc.view.getUserDefaultView.queryOptions({
			organizationSlug,
			objectType,
		})
	);

	const currentView = currentViewId ? currentViewQuery.data : null;
	const views = viewsQuery.data || [];
	const userDefaultView = userDefaultViewQuery.data;

	const isViewFavorited = React.useCallback(
		(viewId: string) => {
			if (!viewId || !favoritesQuery.data) return false;
			const viewIdStr = viewId.toString();
			return favoritesQuery.data.some((fav: any) => {
				if (fav.objectType !== "view") return false;
				const favObjectId = fav.objectId?.toString() || fav.objectId;
				const favRecordId = fav.record?._id?.toString() || fav.record?._id;
				return favObjectId === viewIdStr || favRecordId === viewIdStr;
			});
		},
		[favoritesQuery.data]
	);

	const isUserDefaultView = React.useCallback(
		(viewId: string) => {
			if (!viewId || !userDefaultView) return false;
			const viewIdStr = viewId.toString().trim();
			const defaultViewId = (userDefaultView._id?.toString() || userDefaultView.id || "").trim();
			// Ensure we're comparing the same format
			return defaultViewId === viewIdStr && defaultViewId !== "";
		},
		[userDefaultView]
	);

	const filteredViews = React.useMemo(() => {
		let filtered = views;
		if (searchQuery) {
			filtered = views.filter((view: any) =>
				view.name?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		// Sort views alphabetically by name
		return [...filtered].sort((a: any, b: any) => {
			const nameA = (a.name || "").toLowerCase();
			const nameB = (b.name || "").toLowerCase();
			return nameA.localeCompare(nameB);
		});
	}, [views, searchQuery]);

	const handleViewSelect = (viewId: string) => {
		setViewPopoverOpen(false);
		if (onViewChange) {
			onViewChange(viewId);
		} else {
			const routePath = getObjectTypeRoutePath(objectType);
			
			navigate({
				to: `/$slug/${routePath}/view/$viewId`,
				params: {
					slug: organizationSlug,
					viewId,
				},
			});
		}
	};

	const handleCreateNewView = () => {
		setViewPopoverOpen(false);
		setCreateViewSheetOpen(true);
	};

	const handleRename = (view: any) => {
		setRenamingViewId(view._id.toString());
		setRenameValue(view.name || "");
	};

	const handleRenameSubmit = (viewId: string) => {
		if (renameValue.trim()) {
			updateView(
				{
					viewId,
					name: renameValue.trim(),
				},
				{
					onSuccess: () => {
						setRenamingViewId(null);
						setRenameValue("");
					},
				}
			);
		}
	};

	const handleDuplicate = (viewId: string) => {
		duplicateView({ viewId });
	};

	const handleDelete = (viewId: string) => {
		if (confirm("Are you sure you want to delete this view?")) {
			deleteView(
				{ viewId },
				{
					onSuccess: () => {
						// Redirect to default view if current view was deleted
						if (currentViewId === viewId) {
							const routePath = getObjectTypeRoutePath(objectType);
							navigate({
								to: `/$slug/${routePath}`,
								params: {
									slug: organizationSlug,
								},
							});
						}
					},
				}
			);
		}
	};

	const handleAddToFavorites = (viewId: string) => {
		if (!viewId) {
			console.error("Cannot favorite view: viewId is missing");
			return;
		}
		
		toggleFavorite(
			{
				recordId: viewId,
				objectType: "view",
			},
			{
				onSuccess: (result) => {
					// Optionally show a toast or update UI
					console.log("Favorite toggled:", result);
				},
				onError: (error) => {
					console.error("Error toggling favorite:", error);
					// Optionally show error toast
				},
			}
		);
	};

	const handleSetAsDefault = (viewId: string) => {
		if (!viewId) {
			console.error("Cannot set default view: viewId is missing");
			return;
		}

		setUserDefaultView(
			{
				organizationSlug,
				objectType,
				viewId,
			},
			{
				onSuccess: () => {
					// Optionally show a toast
					console.log("Default view set successfully");
				},
				onError: (error) => {
					console.error("Error setting default view:", error);
					// Optionally show error toast
				},
			}
		);
	};

	const handleColumnDefsChange = React.useCallback(
		(newColumnDefs: any[]) => {
			if (!currentViewId) return;
			updateView(
				{
					viewId: currentViewId,
					columnDefs: newColumnDefs,
				},
				{
					onSuccess: () => {
						// Query will automatically refetch due to invalidation
					},
				}
			);
		},
		[currentViewId, updateView]
	);

	return (
		<div className="flex flex-col gap-2 p-2 border-b">
			{/* View Selector and View Settings */}
			<div className="flex items-center gap-2">
				<Popover open={viewPopoverOpen} onOpenChange={setViewPopoverOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="action"
						>
							{/* View icon - dynamic based on view type */}
							{(() => {
								const { Icon, bgColor, iconClassName } = getViewIconConfig(currentView?.viewType);
								return (
									<div className={cn("p-0.5 rounded-sm flex items-center justify-center shrink-0", bgColor)}>
										<Icon className={cn("h-[14px] w-[14px]", iconClassName)} />
									</div>
								);
							})()}
							<span className="font-medium text-white">
								{currentView?.name || "Select view"}
							</span>
							<IconChevronDown className="h-4 w-4 ml-1 text-gray-400 shrink-0" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[300px] p-0" align="start">
						<Command>
							<CommandInput
								placeholder="Search views..."
								value={searchQuery}
								onValueChange={setSearchQuery}
								icon={false}
							/>
							<CommandList>
								<CommandEmpty>No views found.</CommandEmpty>
								<CommandGroup className="">
									{filteredViews.map((view: any) => {
										const viewId = view._id?.toString() || view.id;
										const isSelected = viewId === currentViewId;
										const isRenaming = renamingViewId === viewId;

										return (
											<CommandItem
												key={viewId}
												value={view.name}
												onSelect={() => handleViewSelect(viewId)}
												className={cn(
													"group relative rounded-lg flex items-center h-7 gap-1",
													"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
													isSelected && "bg-accent text-accent-foreground",
												)}
											>
												{/* View icon - dynamic based on view type */}
												{(() => {
													const { Icon, bgColor, iconClassName } = getViewIconConfig(view.viewType);
													return (
														<div className={cn("p-0.25 rounded-sm flex items-center justify-center shrink-0", bgColor)}>
															<Icon className={iconClassName} />
														</div>
													);
												})()}
												{isRenaming ? (
													<Input
														value={renameValue}
														onChange={(e) => setRenameValue(e.target.value)}
														onBlur={() => handleRenameSubmit(viewId)}
														onKeyDown={(e) => {
															if (e.key === "Enter") {
																handleRenameSubmit(viewId);
															} else if (e.key === "Escape") {
																setRenamingViewId(null);
																setRenameValue("");
															}
														}}
														className="h-7 flex-1"
														autoFocus
														onClick={(e) => e.stopPropagation()}
													/>
												) : (
                          <div className="flex items-center gap-4">
													  <span className={cn("flex-1", isSelected && "text-blue-400")}>{view.name}</span>
                            {isUserDefaultView(viewId) && (
                              <IconDatabaseHeart className="h-4 w-4 ml-1 text-red-400 shrink-0" />
                            )}
                          </div>
												)}
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-transparent rounded-lg ml-auto"
															onClick={(e) => e.stopPropagation()}
														>
															<IconDotsVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => handleAddToFavorites(viewId)}
														>
															{isViewFavorited(viewId) ? (
																<>
																	<IconStarFilled className="h-4 w-4" />
																	Remove from favorites
																</>
															) : (
																<>
																	<IconStar className="h-4 w-4" />
																	Add to favorites
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleSetAsDefault(viewId)}>
															{isUserDefaultView(viewId) ? (
																<>
																	<IconCheck className="h-4 w-4" />
																	Default view
																</>
															) : (
																<>
																	<IconCheck className="h-4 w-4 opacity-0" />
																	Set as default view
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleRename(view)}>
															<IconPencil className="h-4 w-4" />
															Rename
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDuplicate(viewId)}>
															<IconCopy className="h-4 w-4" />
															Duplicate
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant="destructive"
															onClick={() => handleDelete(viewId)}
														>
															<IconTrash className="h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</CommandItem>
										);
									})}
								</CommandGroup>
                <CommandSeparator />
								<CommandGroup>
									<CommandItem onSelect={handleCreateNewView}>
										<IconPlus className="h-4 w-4" />
										Create new view
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				{currentView && currentViewId && (
					<ViewSettings
						objectType={objectType}
						columnDefs={currentView.columnDefs || []}
						onColumnDefsChange={handleColumnDefsChange}
					/>
				)}
			</div>
			<CreateViewSheet
				open={createViewSheetOpen}
				onOpenChange={setCreateViewSheetOpen}
				organizationSlug={organizationSlug}
				objectType={objectType}
			/>
		</div>
	);
}

