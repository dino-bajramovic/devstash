'use client'

import { MoreHorizontal } from 'lucide-react'

export function CollectionMoreButton() {
  return (
    <button
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      aria-label="More options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  )
}
