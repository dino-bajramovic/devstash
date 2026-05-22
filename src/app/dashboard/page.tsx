import { Hash, Layers, Star, BookmarkCheck, Pin } from "lucide-react";
import { getUserIdOrDemo } from "@/lib/auth";
import {
  getCollectionsForDashboard,
  getDashboardStats,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";

export default async function DashboardPage() {
  const userId = await getUserIdOrDemo();

  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getCollectionsForDashboard(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  const statCards = [
    { label: "Total Items", value: stats.totalItems, icon: Hash },
    { label: "Collections", value: stats.totalCollections, icon: Layers },
    { label: "Favorite Items", value: stats.favoriteItems, icon: Star },
    {
      label: "Favorite Collections",
      value: stats.favoriteCollections,
      icon: BookmarkCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your developer knowledge hub
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="border-border bg-card rounded-lg border p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <Icon className="text-muted-foreground h-4 w-4" />
              </div>
              <p className="text-card-foreground text-2xl font-bold">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Collections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Collections</h2>
          <a
            href="/collections"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            View all
          </a>
        </div>
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No collections yet.</p>
        )}
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Pin className="text-muted-foreground h-4 w-4" />
            <h2 className="text-base font-semibold">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Items</h2>
            <a
              href="/items"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              View all
            </a>
          </div>
          <div className="space-y-2">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
