'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { listUsers } from '@/actions/auth'
import {
  getEffectivePermissionsForUser,
  setUserPermission,
  resetUserPermissions,
} from '@/actions/permissions'
import {
  PERMISSIONS,
  PERMISSION_META,
  ROLE_LABELS,
  getPermissionsByGroup,
  type Permission,
  type Role,
} from '@/lib/auth/roles'
import { cn } from '@/lib/utils'
import { Loader2, RotateCcw, Check, Minus, Plus } from 'lucide-react'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
}

type PermState = {
  role: Role | null
  roleBase: Permission[]
  overrides: { permission: string; granted: boolean }[]
  effective: Permission[]
}

export function PermissionsManager() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [permState, setPermState] = useState<PermState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const groups = getPermissionsByGroup()

  useEffect(() => {
    listUsers()
      .then((data) => {
        setUsers(data as UserRow[])
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  const loadPerms = useCallback(async (userId: string) => {
    setLoadingPerms(true)
    setErr(null)
    try {
      const data = await getEffectivePermissionsForUser(userId)
      setPermState({
        role: data.role,
        roleBase: data.roleBase ?? [],
        overrides: data.overrides,
        effective: data.effective,
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al cargar permisos')
    } finally {
      setLoadingPerms(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) loadPerms(selectedId)
  }, [selectedId, loadPerms])

  const isEffective = (p: Permission) => permState?.effective.includes(p) ?? false
  const isFromRole = (p: Permission) => permState?.roleBase.includes(p) ?? false
  const override = (p: Permission) =>
    permState?.overrides.find((o) => o.permission === p)

  const toggle = (permission: Permission) => {
    if (!selectedId || !permState) return
    const currentlyOn = isEffective(permission)
    const nextGranted = !currentlyOn

    setMsg(null)
    startTransition(async () => {
      const result = await setUserPermission(selectedId, permission, nextGranted)
      if (result.success) {
        await loadPerms(selectedId)
        setMsg('Permiso actualizado')
      } else {
        setErr(result.error)
      }
    })
  }

  const handleReset = () => {
    if (!selectedId) return
    if (!confirm('¿Restablecer permisos al rol base? Se eliminarán todos los overrides.')) return
    startTransition(async () => {
      await resetUserPermissions(selectedId)
      await loadPerms(selectedId)
      setMsg('Permisos restablecidos al rol')
    })
  }

  const selectedUser = users.find((u) => u.id === selectedId)

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Permisos granulares</h2>
          <p className="text-sm text-zinc-500">
            Ajustá permisos individuales por encima o por debajo del rol base.
          </p>
        </div>
        {selectedId && (
          <button
            type="button"
            onClick={handleReset}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer al rol
          </button>
        )}
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {err}
        </div>
      )}
      {msg && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {msg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Lista de usuarios */}
        <div className="space-y-1 rounded-xl border border-white/5 bg-zinc-900/40 p-2">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Usuarios
          </p>
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedId(u.id)}
              className={cn(
                'flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors',
                selectedId === u.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              <span className="truncate font-medium">
                {u.full_name || u.email}
              </span>
              <span className="truncate text-[11px] opacity-70">
                {ROLE_LABELS[u.role as Role] || u.role}
              </span>
            </button>
          ))}
        </div>

        {/* Matriz de permisos */}
        <div className="space-y-5">
          {selectedUser && permState && (
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 px-4 py-3 text-sm">
              <span className="text-zinc-300">
                {selectedUser.full_name || selectedUser.email}
              </span>
              <span className="mx-2 text-zinc-600">·</span>
              <span className="text-amber-400">
                Rol: {permState.role ? ROLE_LABELS[permState.role] : '—'}
              </span>
              <span className="mx-2 text-zinc-600">·</span>
              <span className="text-zinc-500">
                {permState.effective.length} permisos activos
              </span>
            </div>
          )}

          {loadingPerms || !permState ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando permisos…
            </div>
          ) : (
            Object.entries(groups).map(([group, perms]) => (
              <div key={group} className="rounded-xl border border-white/5 overflow-hidden">
                <div className="border-b border-white/5 bg-zinc-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {group}
                </div>
                <div className="divide-y divide-white/5">
                  {perms.map((p) => {
                    const on = isEffective(p)
                    const fromRole = isFromRole(p)
                    const ov = override(p)
                    const meta = PERMISSION_META[p]

                    return (
                      <div
                        key={p}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200">{meta.label}</p>
                          <p className="text-xs text-zinc-500">{meta.description}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{p}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Origen */}
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium',
                              ov
                                ? ov.granted
                                  ? 'bg-sky-500/15 text-sky-400'
                                  : 'bg-orange-500/15 text-orange-400'
                                : fromRole
                                  ? 'bg-zinc-500/15 text-zinc-400'
                                  : 'bg-zinc-800 text-zinc-600'
                            )}
                          >
                            {ov
                              ? ov.granted
                                ? 'Override +'
                                : 'Override −'
                              : fromRole
                                ? 'Rol'
                                : '—'}
                          </span>

                          {/* Toggle */}
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => toggle(p)}
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50',
                              on
                                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                : 'border-white/10 bg-zinc-950 text-zinc-500 hover:border-white/20'
                            )}
                            title={on ? 'Desactivar' : 'Activar'}
                          >
                            {on ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-zinc-500/15 px-1.5 py-0.5 text-zinc-400">Rol</span>
              Viene del rol base
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-400">Override +</span>
              Agregado manualmente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-orange-400">Override −</span>
              Quitado del rol
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}