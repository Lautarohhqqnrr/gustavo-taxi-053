import type { Permission } from './roles'
import { requirePermission, type SessionUser } from './session'

/**
 * Wrapper para Server Actions con RBAC.
 *
 * @example
 * export const deleteItem = withPermission('gallery:write', async (session, id: string) => {
 *   // session está autenticado y tiene el permiso
 * })
 */
export function withPermission<TArgs extends unknown[], TResult>(
  permission: Permission,
  handler: (session: SessionUser, ...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const session = await requirePermission(permission)
    return handler(session, ...args)
  }
}

/**
 * Varias acciones con el mismo permiso.
 */
export function withPermissions<TArgs extends unknown[], TResult>(
  permissions: Permission[],
  handler: (session: SessionUser, ...args: TArgs) => Promise<TResult>,
  mode: 'any' | 'all' = 'all'
) {
  return async (...args: TArgs): Promise<TResult> => {
    const { getSessionUser } = await import('./session')
    const { effectiveHasPermission } = await import('./roles')
    const session = await getSessionUser()
    if (!session) throw new Error('No autenticado')

    const ok =
      mode === 'all'
        ? permissions.every((p) => effectiveHasPermission(session.permissions, p))
        : permissions.some((p) => effectiveHasPermission(session.permissions, p))

    if (!ok) throw new Error('No tenés permisos para esta acción')
    return handler(session, ...args)
  }
}