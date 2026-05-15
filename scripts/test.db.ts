import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!.replace("&channel_binding=require", "");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  const itemTypes = await prisma.itemType.findMany();
  console.log(`System ItemTypes (${itemTypes.length}):`);
  itemTypes.forEach((t) => console.log(`  - ${t.name} | ${t.icon} | ${t.color}`));

  const userCount = await prisma.user.count();
  console.log(`\nUsers: ${userCount}`);

  const itemCount = await prisma.item.count();
  console.log(`Items: ${itemCount}`);

  console.log("\nDatabase connection OK");
}

main()
  .catch((e) => {
    console.error("Database connection FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
