'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Image,
  Images,
  FileText,
  Star,
  MessageSquare,
  Settings,
  Users,
  KeyRound,
  FolderOpen,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import {
  PermissionsProvider,
  usePermissions,
  type ClientSession,
} from '@/lib/auth/client'
import type { Permission } from '@/lib/auth/roles'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { adminLogout } from '@/actions/auth'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  permission: Permission
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { href: '/admin/galeria', label: 'Galería', icon: Images, permission: 'gallery:read' },
  { href: '/admin/medios', label: 'Medios del sitio', icon: Image, permission: 'media:read' },
  { href: '/admin/biblioteca', label: 'Biblioteca', icon: FolderOpen, permission: 'media:read' },
  { href: '/admin/blog', label: 'Blog', icon: FileText, permission: 'blog:read' },
  { href: '/admin/resenas', label: 'Reseñas', icon: Star, permission: 'reviews:read' },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare, permission: 'messages:read' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, permission: 'users:read' },
  { href: '/admin/permisos', label: 'Permisos', icon: KeyRound, permission: 'users:write' },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings, permission: 'settings:read' },
]

function AdminNav() {
  const pathname = usePathname()
  const { can, session } = usePermissions()
  const visible = NAV.filter((item) => can(item.permission))

  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-white/5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-black">
          GT
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-zinc-100">Admin</span>
          {session && (
            <span className="block truncate text-[10px] text-zinc-500">
              {ROLE_LABELS[session.role]} · {session.email}
            </span>
          )}
        </div>
      </div>
      <nav className="space-y-0.5 p-3">
        {visible.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-4 left-3 right-3">
        <form action={adminLogout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  )
}

/**
 * Shell del panel admin con RBAC integrado.
 */
export function AdminShell({
  session,
  children,
}: {
  session: ClientSession
  children: React.ReactNode
}) {
  return (
    <PermissionsProvider session={session}>
      <div className="flex min-h-screen bg-zinc-950">
        <aside className="relative hidden w-60 shrink-0 border-r border-white/5 bg-zinc-900/50 lg:block">
          <AdminNav />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 lg:hidden">
            <span className="text-sm font-semibold text-zinc-100">GT Admin</span>
            <form action={adminLogout}>
              <button type="submit" className="text-xs text-zinc-500 hover:text-zinc-300">
                Salir
              </button>
            </form>
          </div>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </PermissionsProvider>
  )
}