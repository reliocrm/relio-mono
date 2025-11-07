import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import React from "react";

interface DroppableProps {
  id: string;
  children:
    | React.ReactNode
    | ((dropProps: { isOver: boolean; active: any }) => React.ReactNode);
  isFolder?: boolean;
  className?: string;
}

export function Droppable({
  id,
  children,
  isFolder,
  className,
}: DroppableProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      type: isFolder ? "folder" : "root",
      accepts: ["favorite", "folder"],
    },
  });

  const isDropZone =
    id.toString().startsWith("before-") ||
    id.toString().startsWith("after-");

  const isValidDrop =
    isOver &&
    (isDropZone
      ? active?.data?.current?.type === "favorite"
      : isFolder
        ? active?.data?.current?.type === "favorite"
        : active?.data?.current?.type === active?.data?.current?.type);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isDropZone
          ? "relative transition-colors border-none rounded-none p-0 m-0"
          : "relative transition-colors rounded-lg border border-transparent",
        isValidDrop &&
          active?.data?.current?.type === "favorite" &&
          !isDropZone &&
          "bg-blue-500/10 border border-blue-500",
        isValidDrop &&
          active?.data?.current?.type === "folder" &&
          !isDropZone &&
          "bg-zinc-800/50",
        isValidDrop && isDropZone && "bg-blue-500/90",
      )}
    >
      {typeof children === "function"
        ? children({ isOver, active })
        : children}
    </div>
  );
}

