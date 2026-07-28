'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { Permission, Role } from './roles'
import { effectiveHasPermission } from './roles'

export type ClientSession = {
  id: string
  email: string
  fullName: string | null
  role: Role
  permissions: Permission[]
} | null

type PermissionsContextValue = {
  session: ClientSession
  /** ¿Tiene este permiso efectivo? */
  can: (permission: Permission) => boolean
  /** ¿Tiene al menos uno? */
  canAny: (permissions: Permission[]) => boolean
  /** ¿Tiene todos? */
  canAll: (permissions: Permission[]) => boolean
  isAdmin: boolean
  isAuthenticated: boolean
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

/**
 * Proveedor de permisos para el panel admin.
 * Pasá la sesión obtenida en el Server Component layout.
 */
export function PermissionsProvider({
  session,
  children,
}: {
  session: ClientSession
  children: ReactNode
}) {
  const can = useCallback(
    (permission: Permission) => {
      if (!session) return false
      return effectiveHasPermission(session.permissions, permission)
    },
    [session]
  )

  const canAny = useCallback(
    (permissions: Permission[]) => permissions.some((p) => can(p)),
    [can]
  )

  const canAll = useCallback(
    (permissions: Permission[]) => permissions.every((p) => can(p)),
    [can]
  )

  const value = useMemo<PermissionsContextValue>(
    () => ({
      session,
      can,
      canAny,
      canAll,
      isAdmin: session?.role === 'admin',
      isAuthenticated: !!session,
    }),
    [session, can, canAny, canAll]
  )

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

/**
 * Hook de permisos RBAC (cliente).
 *
 * @example
 * const { can } = usePermissions()
 * if (can('gallery:write')) { ... }
 */
export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    // Fallback seguro fuera del provider
    return {
      session: null,
      can: () => false,
      canAny: () => false,
      canAll: () => false,
      isAdmin: false,
      isAuthenticated: false,
    }
  }
  return ctx
}

/**
 * Renderiza children solo si el usuario tiene el permiso.
 *
 * @example
 * <PermissionGate permission="users:write">
 *   <UsersManager />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: {
  /** Un permiso */
  permission?: Permission
  /** Varios permisos */
  permissions?: Permission[]
  /** Si true, exige todos; si false, al menos uno */
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}) {
  const { can, canAny, canAll } = usePermissions()

  let allowed = false
  if (permission) {
    allowed = can(permission)
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? canAll(permissions) : canAny(permissions)
  }

  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}

/**
 * Botón/acción que se deshabilita sin permiso.
 */
export function useCanWrite(area: 'gallery' | 'media' | 'blog' | 'reviews' | 'messages' | 'settings' | 'users') {
  const { can } = usePermissions()
  const map = {
    gallery: 'gallery:write',
    media: 'media:write',
    blog: 'blog:write',
    reviews: 'reviews:write',
    messages: 'messages:write',
    settings: 'settings:write',
    users: 'users:write',
  } as const satisfies Record<string, Permission>
  return can(map[area])
}