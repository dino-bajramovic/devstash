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
} from "lucide-react";
import type { ItemForDashboard } from "@/lib/db/items";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ItemCard({ item }: { item: ItemForDashboard }) {
  const Icon = ICON_MAP[item.itemType.icon] ?? File;

  return (
    <div className="border-border bg-card hover:bg-card/60 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${item.itemType.color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: item.itemType.color }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="text-card-foreground truncate text-sm font-medium">
            {item.title}
          </h4>
          {item.isFavorite && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>

        {item.description && (
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="text-muted-foreground mt-0.5 shrink-0 text-xs">
        {formatDate(item.createdAt)}
      </span>
    </div>
  );
}
