'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/session'
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  resolveEffectivePermissions,
  isValidRole,
  type Permission,
  type Role,
} from '@/lib/auth/roles'

export type PermissionOverride = {
  permission: Permission
  granted: boolean
}

/**
 * Obtiene overrides de un usuario.
 */
export async function getUserPermissionOverrides(userId: string) {
  await requirePermission('users:read')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission, granted')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return (data ?? []) as PermissionOverride[]
}

/**
 * Calcula matriz de permisos efectivos para un usuario (rol + overrides).
 */
export async function getEffectivePermissionsForUser(userId: string) {
  await requirePermission('users:read')
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || !isValidRole(profile.role)) {
    return { role: null as Role | null, overrides: [], effective: [] as Permission[] }
  }

  const overrides = await getUserPermissionOverrides(userId)
  const effective = resolveEffectivePermissions(profile.role, overrides)

  return {
    role: profile.role as Role,
    overrides,
    effective,
    roleBase: ROLE_PERMISSIONS[profile.role as Role],
  }
}

/**
 * Establece o actualiza un override de permiso.
 * Si el valor coincide exactamente con el del rol base, elimina el override.
 */
export async function setUserPermission(
  userId: string,
  permission: Permission,
  granted: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  await requirePermission('users:write')

  if (!PERMISSIONS.includes(permission)) {
    return { success: false, error: 'Permiso inválido' }
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile || !isValidRole(profile.role)) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  const roleHasIt = ROLE_PERMISSIONS[profile.role as Role].includes(permission)

  // Si el estado deseado es igual al del rol, borrar override
  if (granted === roleHasIt) {
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permission)

    revalidatePath('/admin/usuarios')
    revalidatePath('/admin/permisos')
    return { success: true }
  }

  const { error } = await supabase.from('user_permissions').upsert(
    {
      user_id: userId,
      permission,
      granted,
    },
    { onConflict: 'user_id,permission' }
  )

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/usuarios')
  revalidatePath('/admin/permisos')
  return { success: true }
}

/**
 * Elimina todos los overrides de un usuario (vuelve al rol puro).
 */
export async function resetUserPermissions(userId: string) {
  await requirePermission('users:write')
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
  revalidatePath('/admin/permisos')
}

/**
 * Matriz de permisos por rol (solo lectura, para documentación en UI).
 */
export async function getRolePermissionMatrix() {
  await requirePermission('users:read')
  return ROLE_PERMISSIONS
}