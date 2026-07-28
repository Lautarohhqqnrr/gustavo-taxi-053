/**
 * RBAC — API pública unificada
 * Gustavo Taxi 053
 *
 * Server Components / Actions:
 *   import { requirePermission, getSessionUser, withPermission } from '@/lib/auth'
 *
 * Client Components:
 *   import { usePermissions, PermissionGate } from '@/lib/auth/client'
 */

export {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  PERMISSIONS,
  PERMISSION_META,
  ADMIN_ROUTE_PERMISSIONS,
  type Role,
  type Permission,
  isValidRole,
  hasPermission,
  hasAnyPermission,
  canAccessAdmin,
  canAccessRoute,
  getPermissionsByGroup,
  resolveEffectivePermissions,
  effectiveHasPermission,
} from './roles'

export {
  getSessionUser,
  requirePermission,
  requireAdminAccess,
  requireRouteAccess,
  sessionHasPermission,
  type SessionUser,
} from './session'

export { withPermission, withPermissions } from './guard'
