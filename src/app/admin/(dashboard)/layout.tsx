import { getSessionUser } from '@/lib/auth/session'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionUser()

  return (
    <AdminShell
      session={
        session
          ? {
              id: session.id,
              email: session.email,
              fullName: session.fullName,
              role: session.role,
              permissions: session.permissions,
            }
          : null
      }
    >
      {children}
    </AdminShell>
  )
}
