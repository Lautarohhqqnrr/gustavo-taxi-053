'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isValidRole, canAccessAdmin, type Role } from '@/lib/auth/roles'
import { requirePermission } from '@/lib/auth/session'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type AuthResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Login al panel. Solo roles con acceso admin (admin, editor, viewer).
 */
export async function adminLogin(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Datos inválidos' }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return {
      success: false,
      error:
        authError?.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : authError?.message || 'Error al iniciar sesión',
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

 if (!profile || !canAccessAdmin((profile as any).role)) {
    await supabase.auth.signOut()
    return {
      success: false,
      error: 'No tenés permisos para acceder al panel',
    }
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function adminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/admin/login')
}

/**
 * Lista usuarios del panel (solo admin).
 */
export async function listUsers() {
  await requirePermission('users:read')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Actualiza el rol de un usuario (solo admin).
 */
export async function updateUserRole(
  userId: string,
  role: Role
): Promise<AuthResult> {
  await requirePermission('users:write')

  if (!isValidRole(role)) {
    return { success: false, error: 'Rol inválido' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id === userId && role !== 'admin') {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      return {
        success: false,
        error: 'No podés quitar el único administrador del sistema',
      }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
