import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/LoginForm'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-lg font-bold text-black shadow-lg shadow-amber-500/20">
            GT
          </div>
          <h1 className="text-xl font-bold text-zinc-50">Panel de Administración</h1>
          <p className="mt-1 text-sm text-zinc-500">{SITE.name}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Acceso restringido a administradores autorizados
        </p>
      </div>
    </div>
  )
}