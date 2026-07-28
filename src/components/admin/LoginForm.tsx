'use client'

import { useActionState } from 'react'
import { adminLogin, type AuthResult } from '@/actions/auth'
import { Loader2, Lock, Mail } from 'lucide-react'

const initialState: AuthResult | null = null

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(adminLogin, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@gustavotaxi.com"
            className="w-full rounded-lg border border-white/10 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            minLength={6}
            className="w-full rounded-lg border border-white/10 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {state && !state.success && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ingresando…
          </>
        ) : (
          'Ingresar al panel'
        )}
      </button>
    </form>
  )
}