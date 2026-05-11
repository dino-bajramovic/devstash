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
import { mockItemTypes } from '@/lib/mock-data'

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Item {
  id: string
  title: string
  description?: string | null
  isFavorite: boolean
  itemTypeId: string
  tags: string[]
  createdAt: string
}

export function ItemCard({ item }: { item: Item }) {
  const itemType = mockItemTypes.find((t) => t.id === item.itemTypeId)
  const Icon = itemType ? (ICON_MAP[itemType.icon] ?? File) : File

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-card/60 transition-colors cursor-pointer">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ backgroundColor: itemType ? `${itemType.color}20` : undefined }}
      >
        <Icon className="h-4 w-4" style={{ color: itemType?.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium text-card-foreground truncate">{item.title}</h4>
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="shrink-0 text-xs text-muted-foreground mt-0.5">{formatDate(item.createdAt)}</span>
    </div>
  )
}
