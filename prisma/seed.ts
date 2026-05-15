import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!.replace("&channel_binding=require", "");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const systemTypes = [
  { name: "Snippet", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", icon: "Terminal", color: "#f97316" },
  { name: "Note", icon: "StickyNote", color: "#fde047" },
  { name: "Link", icon: "Link", color: "#10b981" },
  { name: "File", icon: "File", color: "#6b7280" },
  { name: "Image", icon: "Image", color: "#ec4899" },
];

async function main() {
  for (const type of systemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    });
    if (!existing) {
      await prisma.itemType.create({
        data: { ...type, isSystem: true, userId: null },
      });
    }
  }
  console.log("Seeded system ItemTypes");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
