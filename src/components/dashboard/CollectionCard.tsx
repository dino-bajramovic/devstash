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
import { mockItems, mockItemTypes } from '@/lib/mock-data'
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

interface Collection {
  id: string
  name: string
  description?: string | null
  isFavorite: boolean
  itemCount: number
  dominantTypeId: string
}

function getCollectionTypeIcons(collectionId: string, dominantTypeId: string) {
  const items = mockItems.filter((item) => item.collectionIds.includes(collectionId))
  const seen = new Set<string>()
  const typeIds = items
    .map((item) => item.itemTypeId)
    .filter((id) => {
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })

  const types = typeIds
    .map((id) => mockItemTypes.find((t) => t.id === id))
    .filter(Boolean) as typeof mockItemTypes

  if (types.length === 0) {
    const fallback = mockItemTypes.find((t) => t.id === dominantTypeId)
    return fallback ? [fallback] : []
  }

  return types
}

export function CollectionCard({ collection }: { collection: Collection }) {
  const typeIcons = getCollectionTypeIcons(collection.id, collection.dominantTypeId)

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/60"
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

      {typeIcons.length > 0 && (
        <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/50">
          {typeIcons.map((type) => {
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
