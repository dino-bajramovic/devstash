import Link from "next/link";
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
import type { CollectionForDashboard } from "@/lib/db/collections";
import { CollectionMoreButton } from "./CollectionMoreButton";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export function CollectionCard({
  collection,
}: {
  collection: CollectionForDashboard;
}) {
  const { dominantType, types } = collection;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group bg-card hover:bg-card/60 flex flex-col gap-3 rounded-lg border p-4 transition-colors"
      style={
        dominantType ? { borderColor: dominantType.color + "60" } : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-card-foreground truncate text-sm font-medium">
              {collection.name}
            </h3>
            {collection.isFavorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {collection.itemCount} items
          </p>
        </div>
        <CollectionMoreButton />
      </div>

      {collection.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {collection.description}
        </p>
      )}

      {types.length > 0 && (
        <div className="border-border/50 mt-auto flex items-center gap-2 border-t pt-1">
          {types.map((type) => {
            const Icon = ICON_MAP[type.icon] ?? File;
            return (
              <span key={type.id} style={{ color: type.color }}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}
