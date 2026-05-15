import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!.replace("&channel_binding=require", "");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Database connection test ===\n");

  // ── System ItemTypes ───────────────────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({ where: { isSystem: true } });
  console.log(`System ItemTypes (${itemTypes.length}):`);
  itemTypes.forEach((t) => console.log(`  ${t.icon.padEnd(12)} ${t.name.padEnd(10)} ${t.color}`));

  // ── Demo User ──────────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: {
      collections: {
        include: {
          items: {
            include: {
              item: {
                include: {
                  itemType: true,
                  tags: { include: { tag: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log("\nDemo user not found — run `npm run db:seed` first.");
    return;
  }

  console.log(`\nDemo user: ${user.name} <${user.email}>`);
  console.log(`  isPro: ${user.isPro} | emailVerified: ${user.emailVerified?.toISOString().slice(0, 10)}`);
  console.log(`  password hash present: ${!!user.password}`);

  // ── Collections & Items ────────────────────────────────────────────────────
  console.log(`\nCollections (${user.collections.length}):`);
  for (const col of user.collections) {
    console.log(`\n  [${col.name}] — ${col.description}`);
    console.log(`  Items (${col.items.length}):`);
    for (const { item } of col.items) {
      const tags = item.tags.map((t) => t.tag.name).join(", ");
      const preview =
        item.contentType === "URL"
          ? item.url
          : item.content?.slice(0, 60).replace(/\n/g, " ") + "…";
      console.log(`    • [${item.itemType.name}] ${item.title}`);
      console.log(`      ${preview}`);
      if (tags) console.log(`      tags: ${tags}`);
    }
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const [itemCount, tagCount] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.tag.count({ where: { userId: user.id } }),
  ]);

  console.log(`\nTotals — items: ${itemCount} | tags: ${tagCount} | collections: ${user.collections.length}`);
  console.log("\nDatabase OK");
}

main()
  .catch((e) => {
    console.error("Database FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
