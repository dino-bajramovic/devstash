import { prisma } from "@/lib/prisma";

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: Date;
};

export type ProfileStats = {
  totalItems: number;
  totalCollections: number;
  byType: { name: string; icon: string; color: string; count: number }[];
};

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: !!user.password,
    createdAt: user.createdAt,
  };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        items: { where: { userId }, select: { id: true } },
      },
    }),
  ]);

  const TYPE_ORDER = ["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"];

  const byType = itemTypes
    .map((t) => ({
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

  return { totalItems, totalCollections, byType };
}