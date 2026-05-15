import { prisma } from '@/lib/prisma'

type ItemTypeInfo = {
  id: string
  name: string
  icon: string
  color: string
}

export type CollectionForDashboard = {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  dominantType: ItemTypeInfo | null
  types: ItemTypeInfo[]
}

export type DashboardStats = {
  totalItems: number
  totalCollections: number
  favoriteItems: number
  favoriteCollections: number
}

export async function getCollectionsForDashboard(userId: string): Promise<CollectionForDashboard[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
    },
  })

  return collections.map((col) => {
    const itemCount = col.items.length
    const typeCounts = new Map<string, { count: number; type: ItemTypeInfo }>()

    for (const itemCol of col.items) {
      const { itemType } = itemCol.item
      const existing = typeCounts.get(itemType.id)
      if (existing) {
        existing.count++
      } else {
        typeCounts.set(itemType.id, {
          count: 1,
          type: { id: itemType.id, name: itemType.name, icon: itemType.icon, color: itemType.color },
        })
      }
    }

    const sortedTypes = [...typeCounts.values()].sort((a, b) => b.count - a.count)
    const dominantType = sortedTypes[0]?.type ?? null
    const types = sortedTypes.map((t) => t.type)

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount,
      dominantType,
      types,
    }
  })
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ])

  return { totalItems, totalCollections, favoriteItems, favoriteCollections }
}
