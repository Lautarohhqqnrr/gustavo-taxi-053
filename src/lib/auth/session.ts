'use server'

import { createClient } from '@/lib/supabase/server'
import {
  type Role,
  type Permission,
  isValidRole,
  canAccessAdmin,
  resolveEffectivePermissions,
  effectiveHasPermission,
} from './roles'

export type SessionUser = {
  id: string
  email: string
  fullName: string | null
  role: Role
  permissions: Permission[]
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single()

    if (!profile || !isValidRole(profile.role)) return null
    if (!canAccessAdmin(profile.role)) return null

    let overrides: { permission: string; granted: boolean }[] = []
    try {
      const { data } = await supabase
        .from('user_permissions')
        .select('permission, granted')
        .eq('user_id', user.id)
      overrides = data ?? []
    } catch {
      overrides = []
    }

    const permissions = resolveEffectivePermissions(profile.role, overrides)

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      permissions,
    }
  } catch {
    return null
  }
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) {
    throw new Error('No autenticado')
  }
  if (!effectiveHasPermission(session.permissions, permission)) {
    throw new Error('No tenés permisos para esta acción')
  }
  return session
}

export async function requireAdminAccess(): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) {
    throw new Error('No autenticado')
  }
  return session
}

export async function requireRouteAccess(pathname: string): Promise<SessionUser> {
  const session = await getSessionUser()
  if (!session) {
    throw new Error('No autorizado')
  }
  const { ADMIN_ROUTE_PERMISSIONS } = await import('./roles')
  const match = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(route + '/'))

  if (match) {
    const needed = ADMIN_ROUTE_PERMISSIONS[match]
    if (!effectiveHasPermission(session.permissions, needed)) {
      throw new Error('No autorizado')
    }
  }

  return session
}

export function sessionHasPermission(
  session: SessionUser | null,
  permission: Permission
): boolean {
  if (!session) return false
  return effectiveHasPermission(session.permissions, permission)
}
