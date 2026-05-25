import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!.replace(
  "&channel_binding=require",
  ""
);
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    console.error(`Demo user ${DEMO_EMAIL} not found — aborting.`);
    process.exit(1);
  }

  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No users to delete.");
    return;
  }

  console.log(`Deleting ${usersToDelete.length} user(s):`);
  usersToDelete.forEach((u) => console.log(`  - ${u.email}`));

  const ids = usersToDelete.map((u) => u.id);
  const emails = usersToDelete.map((u) => u.email);

  // Delete verification tokens for these users (no cascade from User)
  const { count: tokenCount } = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: emails } },
  });

  // Deleting users cascades to: Account, Session, Item, Collection, ItemType (user-owned), Tag
  const { count: userCount } = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\nDeleted:`);
  console.log(`  users:               ${userCount}`);
  console.log(`  verification tokens: ${tokenCount}`);
  console.log(`\nDemo user and their data untouched.`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());