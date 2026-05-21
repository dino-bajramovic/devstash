import { Hash, Layers, Star, BookmarkCheck, Pin } from 'lucide-react'
import { getUserIdOrDemo } from '@/lib/auth'
import { getCollectionsForDashboard, getDashboardStats } from '@/lib/db/collections'
import { getPinnedItems, getRecentItems } from '@/lib/db/items'
import { CollectionCard } from '@/components/dashboard/CollectionCard'
import { ItemCard } from '@/components/dashboard/ItemCard'

export default async function DashboardPage() {
  const userId = await getUserIdOrDemo()

  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getCollectionsForDashboard(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ])

  const statCards = [
    { label: 'Total Items', value: stats.totalItems, icon: Hash },
    { label: 'Collections', value: stats.totalCollections, icon: Layers },
    { label: 'Favorite Items', value: stats.favoriteItems, icon: Star },
    { label: 'Favorite Collections', value: stats.favoriteCollections, icon: BookmarkCheck },
  ]

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Collections</h2>
          <a
            href="/collections"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </a>
        </div>
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        )}
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="h-4 w-4 text-muted-foreground" />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Items</h2>
            <a
              href="/items"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
  )
}
