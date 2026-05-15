import Link from 'next/link'
import {
  Star,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  type LucideIcon,
} from 'lucide-react'
import type { CollectionForDashboard } from '@/lib/db/collections'
import { CollectionMoreButton } from './CollectionMoreButton'

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

export function CollectionCard({ collection }: { collection: CollectionForDashboard }) {
  const { dominantType, types } = collection

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-card/60"
      style={dominantType ? { borderColor: dominantType.color + '60' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-sm text-card-foreground truncate">{collection.name}</h3>
            {collection.isFavorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{collection.itemCount} items</p>
        </div>
        <CollectionMoreButton />
      </div>

      {collection.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
      )}

      {types.length > 0 && (
        <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/50">
          {types.map((type) => {
            const Icon = ICON_MAP[type.icon] ?? File
            return (
              <span key={type.id} style={{ color: type.color }}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            )
          })}
        </div>
      )}
    </Link>
  )
}
