import { prisma } from '@/lib/prisma'

export type ItemForDashboard = {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  itemType: {
    id: string
    name: string
    icon: string
    color: string
  }
  tags: string[]
}

const itemInclude = {
  itemType: true,
  tags: { include: { tag: true } },
} as const

function mapItem(item: {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  itemType: { id: string; name: string; icon: string; color: string }
  tags: { tag: { name: string } }[]
}): ItemForDashboard {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  }
}

export async function getPinnedItems(userId: string): Promise<ItemForDashboard[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: 'desc' },
    include: itemInclude,
  })
  return items.map(mapItem)
}

export async function getRecentItems(userId: string): Promise<ItemForDashboard[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: itemInclude,
  })
  return items.map(mapItem)
}
