'use client'

import { useEffect, useState, useTransition } from 'react'
import { listUsers, updateUserRole } from '@/actions/auth'
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'
import { Shield, Loader2 } from 'lucide-react'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string
}

export function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setUsers(data as UserRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRoleChange = (userId: string, role: Role) => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateUserRole(userId, role)
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u))
        )
        setMessage('Rol actualizado correctamente')
      } else {
        setError(result.error)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando usuarios…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Usuarios y roles</h2>
        <p className="text-sm text-zinc-500">
          Gestioná quién puede acceder al panel y con qué permisos.
        </p>
      </div>

      {/* Leyenda de roles */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div
            key={role}
            className="rounded-xl border border-white/5 bg-zinc-900/40 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-zinc-100">
                {ROLE_LABELS[role]}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Creado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-200">
                    {user.full_name || '—'}
                  </p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={pending}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as Role)
                    }
                    className={cn(
                      'rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100',
                      'focus:border-amber-500/50 focus:outline-none disabled:opacity-50'
                    )}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                    {/* Si tiene rol legacy 'user' */}
                    {user.role === 'user' && (
                      <option value="user">Sin acceso (user)</option>
                    )}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {new Date(user.created_at).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}