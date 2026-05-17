import { auth } from '@/lib/auth'
import { getSidebarData } from '@/lib/db/collections'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  let userId = session?.user?.id ?? ''

  if (!userId) {
    const { prisma } = await import('@/lib/prisma')
    const demoUser = await prisma.user.findUnique({ where: { email: 'demo@devstash.io' }, select: { id: true } })
    userId = demoUser?.id ?? ''
  }

  const sidebarData = await getSidebarData(userId)

  return <DashboardShell sidebarData={sidebarData}>{children}</DashboardShell>
}
