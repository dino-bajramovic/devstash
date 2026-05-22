import { prisma } from "@/lib/prisma";

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantType: { color: string } | null;
};

export type SidebarData = {
  itemTypes: SidebarItemType[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
};

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [itemTypesRaw, collectionsRaw] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        items: {
          where: { userId },
          select: { id: true },
        },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        items: {
          include: {
            item: { include: { itemType: true } },
          },
        },
      },
    }),
  ]);

  const TYPE_ORDER = [
    "Snippet",
    "Prompt",
    "Command",
    "Note",
    "File",
    "Image",
    "Link",
  ];

  const itemTypes: SidebarItemType[] = itemTypesRaw
    .map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t.items.length,
    }))
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.name);
      const bi = TYPE_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  const collections: SidebarCollection[] = collectionsRaw.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string }>();
    for (const itemCol of col.items) {
      const { itemType } = itemCol.item;
      const existing = typeCounts.get(itemType.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(itemType.id, { count: 1, color: itemType.color });
      }
    }
    const dominant = [...typeCounts.values()].sort(
      (a, b) => b.count - a.count
    )[0];
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantType: dominant ? { color: dominant.color } : null,
    };
  });

  return {
    itemTypes,
    favoriteCollections: collections.filter((c) => c.isFavorite),
    recentCollections: collections.filter((c) => !c.isFavorite),
  };
}

type ItemTypeInfo = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type CollectionForDashboard = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantType: ItemTypeInfo | null;
  types: ItemTypeInfo[];
};

export type DashboardStats = {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
};

export async function getCollectionsForDashboard(
  userId: string
): Promise<CollectionForDashboard[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
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
  });

  return collections.map((col) => {
    const itemCount = col.items.length;
    const typeCounts = new Map<string, { count: number; type: ItemTypeInfo }>();

    for (const itemCol of col.items) {
      const { itemType } = itemCol.item;
      const existing = typeCounts.get(itemType.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(itemType.id, {
          count: 1,
          type: {
            id: itemType.id,
            name: itemType.name,
            icon: itemType.icon,
            color: itemType.color,
          },
        });
      }
    }

    const sortedTypes = [...typeCounts.values()].sort(
      (a, b) => b.count - a.count
    );
    const dominantType = sortedTypes[0]?.type ?? null;
    const types = sortedTypes.map((t) => t.type);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount,
      dominantType,
      types,
    };
  });
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
