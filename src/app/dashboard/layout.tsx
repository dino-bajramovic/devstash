import { getUserIdOrDemo } from "@/lib/auth";
import { getSidebarData } from "@/lib/db/collections";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserIdOrDemo();

  const sidebarData = await getSidebarData(userId);

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>;
}
