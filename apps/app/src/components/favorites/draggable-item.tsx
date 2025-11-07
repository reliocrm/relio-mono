import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import React from "react";

interface FavoriteItem {
  _id?: any;
  id?: string;
  objectId: string;
  objectType: "contact" | "property" | "company";
  folderId?: string | null;
  position?: number;
  record?: any;
}

export function DraggableItem({
  item,
  children,
}: {
  item: FavoriteItem;
  children: React.ReactNode;
}) {
  const itemId = item._id?.toString() || item.id || item._id;
  
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: itemId,
    data: {
      type: "favorite",
      item,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("transition-opacity", isDragging && "opacity-50")}
    >
      {children}
    </div>
  );
}

