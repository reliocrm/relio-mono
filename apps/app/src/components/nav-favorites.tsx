"use client"

import { Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleFavorite } from '@/hooks/favorites/use-toggle-favorite';
import { useFavoriteFolders } from '@/hooks/favorites/use-favorite-folders';
import { IconChevronDown, IconStarFilled, IconStarOff, IconFolder, IconFolderOpen, IconFolderPlus, IconDotsVertical, IconPencil, IconTrash, IconGripVertical, IconUsers, IconBuildingStore, IconBriefcase } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn, getObjectTypeRoutePath, getRecordInitials, getFavoriteRoutePath, getViewIconConfig } from "@/lib/utils";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
} from "@dnd-kit/sortable";
import { DraggableFolder } from "./favorites/draggable-folder";
import { DraggableItem } from "./favorites/draggable-item";
import { Droppable } from "./favorites/droppable";

export function NavFavorites({
  slug
}: {
  slug: string;
}) {
  const trpc = useTRPC();
  const { toggleFavorite } = useToggleFavorite();
  const { folders, createFolder, updateFolder, deleteFolder, updateFavorite } = useFavoriteFolders();
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === "collapsed";
  
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [isFavoritesHovered, setIsFavoritesHovered] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [optimisticFolderStates, setOptimisticFolderStates] = useState<Map<string, boolean>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch favorites
  const favorites = useQuery(
    trpc.favorite.getAllFavorites.queryOptions({
      organizationSlug: slug,
    })
  );

  // Sync optimistic folder states with server state when folders update
  useEffect(() => {
    if (folders.data) {
      setOptimisticFolderStates((prev) => {
        const newMap = new Map(prev);
        // Remove optimistic states for folders that match server state
        folders.data.forEach((folder: any) => {
          const folderId = folder._id?.toString() || folder._id;
          const serverIsOpen = folder.isOpen ?? true;
          if (newMap.get(folderId) === serverIsOpen) {
            newMap.delete(folderId);
          }
        });
        return newMap;
      });
    }
  }, [folders.data]);

  // Group favorites by folder
  const favoritesByFolder = useMemo(() => {
    if (!favorites.data || !folders.data) return new Map();
    
    const map = new Map<string, any[]>();
    folders.data.forEach((folder: any) => {
      const folderId = folder._id?.toString() || folder._id;
      const folderFavorites = favorites.data.filter((fav: any) => {
        const favFolderId = fav.folderId?.toString() || fav.folderId;
        return favFolderId === folderId;
      });
      map.set(folderId, folderFavorites);
    });
    return map;
  }, [favorites.data, folders.data]);

  const rootFavorites = useMemo(() => {
    if (!favorites.data) return [];
    return favorites.data.filter((fav: any) => !fav.folderId);
  }, [favorites.data]);

  const handleCreateFolder = async (e?: React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isCreatingFolder) {
      setIsCreatingFolder(true);
      return;
    }

    if (newFolderName.trim()) {
      await createFolder.mutateAsync({
        name: newFolderName,
        organizationSlug: slug,
        isOpen: true,
      });
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleFolderClick = async (folder: any) => {
    const folderId = folder._id?.toString() || folder._id;
    const newIsOpen = !folder.isOpen;
    
    // Optimistically update the UI immediately
    setOptimisticFolderStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(folderId, newIsOpen);
      return newMap;
    });
    
    // Update on server (don't await - let it happen in background)
    updateFolder.mutateAsync({
      folderId,
      organizationSlug: slug,
      isOpen: newIsOpen,
    }).catch(() => {
      // Revert on error
      setOptimisticFolderStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(folderId);
        return newMap;
      });
    });
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    await updateFolder.mutateAsync({
      folderId,
      organizationSlug: slug,
      name,
    });
    setEditingFolder(null);
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder.mutateAsync({
      folderId,
      organizationSlug: slug,
    });
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedItem(active.data.current?.item);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedItem(null);
      return;
    }

    const activeData = active.data.current as {
      type: "favorite" | "folder";
      item: any;
    };
    const overData = over.data.current as {
      type: "folder" | "root";
      accepts: string[];
    };

    if (activeData.type === "favorite") {
      const favoriteItem = activeData.item;
      const favoriteId = favoriteItem._id?.toString() || favoriteItem.id || favoriteItem._id;

      if (!favoriteId) {
        setDraggedItem(null);
        return;
      }

      try {
        const overIdStr = String(over.id);

        // Check if dropped on folder-content-{folderId} or directly on folder
        if (overIdStr.startsWith("folder-content-")) {
          const folderId = overIdStr.replace("folder-content-", "");
          const targetItems = favoritesByFolder.get(folderId) || [];
          const newPosition =
            targetItems.length > 0
              ? Math.max(...targetItems.map((i: any) => i.position || 0)) + 1000
              : 1000;
          await updateFavorite.mutateAsync({
            favoriteId: String(favoriteId),
            organizationSlug: slug,
            folderId: folderId,
            position: newPosition,
          });
        } else if (overData.type === "folder") {
          // Dropped directly on folder header/name
          const folderId = overIdStr;
          // Check if this is a valid folder ID
          const isValidFolder = folders.data?.some((f: any) => {
            const id = f._id?.toString() || f._id;
            return id === folderId;
          });
          
          if (isValidFolder) {
            const targetItems = favoritesByFolder.get(folderId) || [];
            const newPosition =
              targetItems.length > 0
                ? Math.max(...targetItems.map((i: any) => i.position || 0)) + 1000
                : 1000;
            await updateFavorite.mutateAsync({
              favoriteId: String(favoriteId),
              organizationSlug: slug,
              folderId: folderId,
              position: newPosition,
            });
          }
        } else if (overData.type === "root" || overIdStr === "root") {
          // Dropped into root
          const newPosition =
            rootFavorites.length > 0
              ? Math.max(...rootFavorites.map((i: any) => i.position || 0)) + 1000
              : 1000;
          await updateFavorite.mutateAsync({
            favoriteId: String(favoriteId),
            organizationSlug: slug,
            folderId: null as any,
            position: newPosition,
          });
        } else if (overIdStr.startsWith("remove-from-folder-")) {
          // Remove from folder
          const newPosition =
            rootFavorites.length > 0
              ? Math.max(...rootFavorites.map((i: any) => i.position || 0)) + 1000
              : 1000;
          await updateFavorite.mutateAsync({
            favoriteId: String(favoriteId),
            organizationSlug: slug,
            folderId: null as any,
            position: newPosition,
          });
        } else if (
          overIdStr.startsWith("before-") ||
          overIdStr.startsWith("after-")
        ) {
          const isBefore = overIdStr.startsWith("before-");
          const targetId = overIdStr.replace(/^before-|^after-/, "");

          // Find the target item (in folder or root)
          let targetItem = null;
          let siblings: any[] = [];

          // Check if in a folder
          for (const [, items] of Array.from(favoritesByFolder.entries())) {
            const found = items.find((i: any) => {
              const id = i._id?.toString() || i.id || i._id;
              return id === targetId;
            });
            if (found) {
              targetItem = found;
              siblings = items;
              break;
            }
          }

          // If not in a folder, check root
          if (!targetItem) {
            targetItem = rootFavorites.find((i: any) => {
              const id = i._id?.toString() || i.id || i._id;
              return id === targetId;
            });
            siblings = rootFavorites;
          }

          if (!targetItem) {
            setDraggedItem(null);
            return;
          }

          // Find the index of the target item
          const targetIdx = siblings.findIndex((i: any) => {
            const id = i._id?.toString() || i.id || i._id;
            return id === targetId;
          });

          // Calculate new position
          let newPosition;
          if (isBefore) {
            const prev = siblings[targetIdx - 1];
            if (prev) {
              newPosition = ((prev.position || 0) + (targetItem.position || 0)) / 2;
            } else {
              newPosition = (targetItem.position || 0) - 1000;
            }
          } else {
            const next = siblings[targetIdx + 1];
            if (next) {
              newPosition = ((targetItem.position || 0) + (next.position || 0)) / 2;
            } else {
              newPosition = (targetItem.position || 0) + 1000;
            }
          }

          // Set folderId to match the target item (or null for root)
          const newFolderId = targetItem.folderId?.toString() || targetItem.folderId || null;

          await updateFavorite.mutateAsync({
            favoriteId: String(favoriteId),
            organizationSlug: slug,
            folderId: newFolderId ? String(newFolderId) : (null as any),
            position: newPosition,
          });
        }
      } catch (error) {
        console.error("Error handling favorite:", error);
      }
    }

    setDraggedItem(null);
  };

  // Prepare folder IDs for SortableContext
  const folderIds = useMemo(() => {
    if (!folders.data) return [];
    return folders.data.map((f: any) => (f._id?.toString() || f._id));
  }, [folders.data]);

  // Prepare root favorite IDs for SortableContext
  const rootFavoriteIds = useMemo(() => {
    return rootFavorites.map((f: any) => (f._id?.toString() || f._id));
  }, [rootFavorites]);

  // Map favorites to items with proper IDs
  const mapFavoriteToItem = (fav: any) => {
    const favoriteId = fav._id?.toString() || fav._id;
    return {
      ...fav,
      id: favoriteId,
      _id: favoriteId,
    };
  };

  const folderItems = new Map<string, any[]>();
  folders.data?.forEach((folder: any) => {
    const folderId = folder._id?.toString() || folder._id;
    const items = (favoritesByFolder.get(folderId) || []).map(mapFavoriteToItem);
    folderItems.set(folderId, items);
  });

  const rootItems = rootFavorites.map(mapFavoriteToItem);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup className={cn(isCollapsed && "!mt-6")}>
          <SidebarGroupLabel
            className="group-data-[collapsible=icon]:opacity-100 !p-0"
            onMouseEnter={() => setIsFavoritesHovered(true)}
            onMouseLeave={() => setIsFavoritesHovered(false)}
          >
            <CollapsibleTrigger
              className={cn(
                "h-8 flex items-center px-2 rounded-lg w-full cursor-pointer transition-colors duration-200",
                "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <div className="flex items-center justify-between w-full">
                {isCollapsed ? (
                  <IconStarFilled className="h-4 w-4" />
                ) : (
                  <div className="flex items-center gap-2">
                    <IconChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    <span className="text-xs">Favorites</span>
                  </div>
                )}
                {isFavoritesHovered && !isCollapsed && (
                  <IconFolderPlus
                    className="h-4 w-4 text-muted-foreground hover:text-accent-foreground cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateFolder();
                    }}
                  />
                )}
              </div>
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <SidebarMenu className="space-y-1">
              {/* Create folder input */}
              {isCreatingFolder && (
                <SidebarMenuItem>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateFolder(e);
                      }
                      if (e.key === "Escape") {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    onBlur={() => {
                      if (!newFolderName.trim()) {
                        setIsCreatingFolder(false);
                      }
                    }}
                    placeholder="Folder name"
                    className="h-8 text-sm"
                    autoFocus
                  />
                </SidebarMenuItem>
              )}

              {/* Empty state */}
              {!favorites.isLoading &&
                !folders.isLoading &&
                rootItems.length < 1 &&
                folders.data &&
                folders.data.length < 1 && (
                  <span
                    className={cn(
                      "text-xs cursor-default text-foreground/50 pl-3",
                      "group-data-[collapsible=icon]:hidden",
                    )}
                  >
                    No favorites yet
                  </span>
                )}

              <Droppable id="root">
                <div>
                  {/* Show loading state */}
                  {(favorites.isLoading || folders.isLoading) && (
                    <span
                      className={cn(
                        "text-xs cursor-default text-foreground/50 pl-3",
                        "group-data-[collapsible=icon]:hidden",
                      )}
                    >
                      Loading...
                    </span>
                  )}

                  {/* Show actual content when loaded */}
                  {!favorites.isLoading && !folders.isLoading && (
                    <SortableContext
                      items={[
                        ...folderIds,
                        ...rootFavoriteIds,
                      ]}
                    >
                      {/* Render folders */}
                      {folders.data &&
                        folders.data.map((folder: any) => {
                          const folderId = folder._id?.toString() || folder._id;
                          const folderFavorites = folderItems.get(folderId) || [];
                          // Use optimistic state if available, otherwise use server state
                          const isOpen = optimisticFolderStates.has(folderId)
                            ? optimisticFolderStates.get(folderId)!
                            : (folder.isOpen ?? true);
                          const isLoadingFavorites = favorites.isLoading || folders.isLoading;

                          return (
                            <Droppable
                              key={folderId}
                              id={`remove-from-folder-${folderId}`}
                              isFolder={false}
                            >
                              {(dropProps) => (
                                <DraggableFolder folder={folder}>
                                  {isCollapsed ? (
                                    <SidebarMenuItem className="flex justify-center w-full p-0">
                                      <SidebarMenuButton
                                        tooltip={folder.name}
                                        className={cn(
                                          "transition-colors duration-200 flex items-center justify-center h-8 p-0 m-0",
                                        )}
                                        onClick={() => handleFolderClick(folder)}
                                      >
                                        {isOpen ? (
                                          <IconFolderOpen className="size-4 mx-auto" />
                                        ) : (
                                          <IconFolder className="size-4 mx-auto" />
                                        )}
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  ) : (
                                    <div
                                      className={cn(
                                        "!w-full relative rounded-lg",
                                        dropProps.isOver &&
                                          "border-dashed border-blue-500 bg-blue-100/60",
                                      )}
                                    >
                                      <Droppable id={`before-${folderId}`}>
                                        <div className="absolute w-full h-px -top-1 z-10 transition-all duration-200" />
                                      </Droppable>

                                      <Droppable id={folderId} isFolder>
                                        {(folderDropProps) => (
                                          <div>
                                            <div
                                              className={cn(
                                                "h-8 transition-colors duration-200 w-full flex items-center px-1 rounded-lg cursor-pointer group/folder",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                isCollapsed && "justify-center p-0",
                                                folderDropProps.isOver &&
                                                  folderDropProps.active?.data?.current?.type === "favorite" &&
                                                  "bg-blue-500/10 border border-blue-500",
                                              )}
                                              onMouseEnter={() =>
                                                setHoveredFolder(folderId)
                                              }
                                              onMouseLeave={() =>
                                                setHoveredFolder(null)
                                              }
                                            >
                                            <div
                                              className="flex items-center flex-1 gap-1"
                                              onClick={() =>
                                                handleFolderClick(folder)
                                              }
                                            >
                                              <div className="relative flex items-center justify-center shrink-0">
                                                <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                                                  <IconFolderOpen
                                                    className={cn(
                                                      "h-[14px] w-[14px] stroke-1 transition-all duration-300 ease-in-out transform",
                                                      isOpen
                                                        ? "opacity-100 scale-100"
                                                        : "opacity-0 scale-95",
                                                    )}
                                                  />
                                                  <IconFolder
                                                    className={cn(
                                                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[14px] w-[14px] stroke-1 transition-all duration-300 ease-in-out transform",
                                                      isOpen
                                                        ? "opacity-0 scale-95"
                                                        : "opacity-100 scale-100",
                                                    )}
                                                  />
                                                </div>
                                              </div>
                                              {editingFolder?.id === folderId && editingFolder ? (
                                                <Input
                                                  value={editingFolder.name}
                                                  onChange={(e) =>
                                                    setEditingFolder({
                                                      id: folderId,
                                                      name: e.target.value,
                                                    })
                                                  }
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                      if (editingFolder) {
                                                        handleRenameFolder(
                                                          editingFolder.id,
                                                          editingFolder.name,
                                                        );
                                                      }
                                                      setEditingFolder(null);
                                                    }
                                                  }}
                                                  onBlur={() => {
                                                    const currentEditingFolder = editingFolder;
                                                    if (currentEditingFolder) {
                                                      handleRenameFolder(
                                                        currentEditingFolder.id,
                                                        currentEditingFolder.name,
                                                      );
                                                    }
                                                    setEditingFolder(null);
                                                  }}
                                                  className="h-6 text-sm"
                                                  autoFocus
                                                />
                                              ) : (
                                                <span className="text-sm font-medium">
                                                  {folder.name}
                                                </span>
                                              )}
                                            </div>

                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <IconDotsVertical
                                                  className={cn(
                                                    "h-4 w-4 opacity-0 group-hover/folder:opacity-100 transition-opacity text-muted-foreground hover:text-accent-foreground",
                                                    hoveredFolder === folderId &&
                                                      "opacity-100",
                                                  )}
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                />
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent
                                                align="start"
                                                className="!p-1 space-y-1"
                                              >
                                                <DropdownMenuItem
                                                  onClick={() =>
                                                    setEditingFolder({
                                                      id: folderId,
                                                      name: folder.name,
                                                    })
                                                  }
                                                  className="flex items-center gap-2"
                                                >
                                                  <IconPencil className="h-4 w-4" />
                                                  Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  className="flex items-center gap-2 text-red-500 hover:!text-red-500"
                                                  onClick={() =>
                                                    handleDeleteFolder(folderId)
                                                  }
                                                >
                                                  <IconTrash className="h-4 w-4 text-red-500" />
                                                  Delete folder
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>

                                          <AnimatePresence initial={false}>
                                            {isOpen && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{
                                                  duration: 0.15,
                                                  ease: "easeOut",
                                                }}
                                                style={{ overflow: "hidden" }}
                                              >
                                                <Droppable
                                                  id={`folder-content-${folderId}`}
                                                  isFolder
                                                >
                                                  <div className="pl-5">
                                                    {isLoadingFavorites ? (
                                                      <div className="space-y-1 py-1">
                                                        {[1, 2, 3].map((i) => (
                                                          <div
                                                            key={i}
                                                            className="flex items-center gap-2 px-2 h-8"
                                                          >
                                                            <Skeleton className="h-6 w-6 rounded-sm" />
                                                            <Skeleton className="h-4 flex-1" />
                                                          </div>
                                                        ))}
                                                      </div>
                                                    ) : folderFavorites.length === 0 ? (
                                                      <div className="pl-2 py-1 text-xs text-muted-foreground">
                                                        No items
                                                      </div>
                                                    ) : (
                                                      <SortableContext
                                                        items={folderFavorites.map(
                                                          (i: any) => i.id,
                                                        )}
                                                      >
                                                        {folderFavorites.flatMap(
                                                          (item: any, idx: number) => [
                                                            <Droppable
                                                              key={`before-${item.id}`}
                                                              id={`before-${item.id}`}
                                                            >
                                                              <div className="h-px" />
                                                            </Droppable>,
                                                            <DraggableItem
                                                              key={item.id}
                                                              item={item}
                                                            >
                                                              <FavoriteItem
                                                                record={item.record}
                                                                recordId={
                                                                  item.record?._id?.toString() ||
                                                                  item.record?._id
                                                                }
                                                                objectType={
                                                                  item.objectType
                                                                }
                                                                recordType={getObjectTypeRoutePath(
                                                                  item.objectType,
                                                                )}
                                                                slug={slug}
                                                                hoveredItem={
                                                                  hoveredItem
                                                                }
                                                                setHoveredItem={
                                                                  setHoveredItem
                                                                }
                                                                toggleFavorite={
                                                                  toggleFavorite
                                                                }
                                                              />
                                                            </DraggableItem>,
                                                            idx ===
                                                              folderFavorites.length -
                                                                1 && (
                                                              <Droppable
                                                                key={`after-${item.id}`}
                                                                id={`after-${item.id}`}
                                                              >
                                                                <div className="h-px" />
                                                              </Droppable>
                                                            ),
                                                          ],
                                                        )}
                                                      </SortableContext>
                                                    )}
                                                  </div>
                                                </Droppable>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                        )}
                                      </Droppable>

                                      <Droppable id={`after-${folderId}`}>
                                        <div className="absolute w-full h-px -bottom-px z-10 transition-all duration-200" />
                                      </Droppable>
                                    </div>
                                  )}
                                </DraggableFolder>
                              )}
                            </Droppable>
                          );
                        })}

                      {/* Render root items */}
                      {rootItems.map((item: any) => (
                        <DraggableItem key={item.id} item={item}>
                          <FavoriteItem
                            record={item.record}
                            recordId={
                              item.record?._id?.toString() || item.record?._id
                            }
                            objectType={item.objectType}
                            recordType={getObjectTypeRoutePath(item.objectType)}
                            slug={slug}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem}
                            toggleFavorite={toggleFavorite}
                          />
                        </DraggableItem>
                      ))}
                    </SortableContext>
                  )}
                </div>
              </Droppable>

              <DragOverlay>
                {draggedItem && (
                  <div className="opacity-80 bg-blue-800 rounded-lg shadow-lg border border-blue-700">
                    {draggedItem.name ? (
                      <div className="flex items-center gap-2 px-2 py-1">
                        <IconFolder className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{draggedItem.name}</span>
                      </div>
                    ) : (
                      <FavoriteItem
                        record={draggedItem.record}
                        recordId={
                          draggedItem.record?._id?.toString() ||
                          draggedItem.record?._id
                        }
                        objectType={draggedItem.objectType}
                        recordType={getObjectTypeRoutePath(
                          draggedItem.objectType,
                        )}
                        slug={slug}
                        hoveredItem={null}
                        setHoveredItem={() => {}}
                        toggleFavorite={() => {}}
                      />
                    )}
                  </div>
                )}
              </DragOverlay>
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </DndContext>
  );
}

function FavoriteItem({
  record,
  recordId,
  objectType,
  recordType,
  slug,
  hoveredItem,
  setHoveredItem,
  toggleFavorite,
  dragHandleProps,
}: {
  record: any;
  recordId: string;
  objectType: "contact" | "property" | "company" | "view" | string;
  recordType: string;
  slug: string;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  toggleFavorite: (args: { recordId: string; objectType: "contact" | "property" | "company" }) => void;
  dragHandleProps?: any;
}) {
  // Get the appropriate icon component and background color for the object type
  const getObjectTypeConfig = () => {
    switch (objectType) {
      case "contact":
        return {
          Icon: IconUsers,
          bgColor: "bg-indigo-700",
        };
      case "property":
        return {
          Icon: IconBuildingStore,
          bgColor: "bg-orange-700",
        };
      case "company":
        return {
          Icon: IconBriefcase,
          bgColor: "bg-purple-700",
        };
      default:
        return {
          Icon: IconUsers,
          bgColor: "bg-indigo-700",
        };
    }
  };

  const { Icon: ObjectTypeIcon, bgColor } = getObjectTypeConfig();

  // Only show view icon overlay for views, not for contact, property, company, or custom objects
  const shouldShowViewIcon = objectType === "view";
  const isRecordType = objectType === "contact" || objectType === "property" || objectType === "company";


  return (
    <SidebarMenuItem 
      onMouseEnter={() => setHoveredItem(recordId)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <SidebarMenuButton 
        tooltip={record.firstName ? `${record.firstName} ${record.lastName}` : record.name}
        className={cn(
          isRecordType ? "gap-1" : "gap-2",
          "transition-colors duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center"
        )}
        asChild
      >
        <Link
          to={getFavoriteRoutePath(slug, objectType, recordId, recordType, record.objectType) as any}
          preload="intent"
        >
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <IconGripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          {/* Show avatar for records, icon badge for views */}
          {isRecordType ? (
            <div className="relative flex items-center justify-center shrink-0">
              <Avatar className="h-[18px] w-[18px]">
                <AvatarImage src={record.image} alt={record.name || `${record.firstName} ${record.lastName}`} />
                <AvatarFallback className="text-[8px] font-medium bg-muted">
                  {getRecordInitials(record, objectType)}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="relative flex items-center justify-center shrink-0">
              {/* Base icon - object type icon with colored background (matching nav-records style) */}
              <div className={cn("p-0.5 rounded-sm", bgColor)}>
                <ObjectTypeIcon className="h-[14px] w-[14px] fill-white stroke-white stroke-0" />
              </div>
              {/* Overlay icon - table/view icon with dynamic background based on view type (only show for views, not records or custom objects) */}
              {shouldShowViewIcon && (() => {
                const { Icon, bgColor, iconClassName } = getViewIconConfig(record.viewType);
                return (
                  <div className={cn("absolute border-2 border-zinc-900 p-0.25 rounded-sm flex items-center justify-center", bgColor)} style={{ bottom: '-6px', right: '-6px' }}>
                    <Icon className={cn("h-[10px] w-[10px]", iconClassName)} />
                  </div>
                );
              })()}
            </div>
          )}
          <span className="group-data-[collapsible=icon]:hidden">
            {record.name || `${record.firstName} ${record.lastName}`}
          </span>
        </Link>
      </SidebarMenuButton>
      {hoveredItem === recordId && (
        <SidebarMenuAction 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({ 
              recordId: recordId,
              objectType: objectType as "contact" | "property" | "company"
            });
          }}
        >
          <IconStarOff />
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
}
