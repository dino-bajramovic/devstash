"use client";

import { MoreHorizontal } from "lucide-react";

export function CollectionMoreButton() {
  return (
    <button
      className="hover:bg-muted text-muted-foreground rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      aria-label="More options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );
}
