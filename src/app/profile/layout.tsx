import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSidebarData } from "@/lib/db/collections";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const sidebarData = await getSidebarData(session.user.id);

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <DashboardShell sidebarData={sidebarData} user={user}>
      {children}
    </DashboardShell>
  );
}