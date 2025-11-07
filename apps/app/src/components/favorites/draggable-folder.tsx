import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import React from "react";

interface FavoriteFolder {
  _id?: any;
  id?: string;
  name: string;
  isOpen?: boolean;
  position?: number;
}

export function DraggableFolder({
  folder,
  children,
}: {
  folder: FavoriteFolder;
  children: React.ReactNode;
}) {
  const folderId = folder._id?.toString() || folder.id || folder._id;
  
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: folderId,
    data: {
      type: "folder",
      item: folder,
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

