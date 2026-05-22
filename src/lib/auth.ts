import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getUserIdOrDemo(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return demoUser?.id ?? "";
}
