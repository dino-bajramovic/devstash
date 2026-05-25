import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserIdOrDemo } from "@/lib/auth";
import { getSidebarData } from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, userId] = await Promise.all([
    auth(),
    getUserIdOrDemo(),
  ]);

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, password: true },
    });
    if (dbUser && !dbUser.emailVerified && dbUser.password) {
      redirect("/check-email");
    }
  }

  const sidebarData = await getSidebarData(userId);

  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <DashboardShell sidebarData={sidebarData} user={user}>
      {children}
    </DashboardShell>
  );
}
