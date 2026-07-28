export const dynamic = "force-dynamic"
import { SITE, PAYMENT_METHODS } from '@/lib/constants'
import { requirePermission } from '@/lib/auth/session'

export default async function AdminConfigPage() {
  await requirePermission('settings:read')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Configuración</h1>
        <p className="text-sm text-zinc-500">
          Datos del negocio (fuente: variables de entorno y constants)
        </p>
      </div>

      <section className="rounded-xl border border-white/5 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-200">Negocio</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Nombre</dt>
            <dd className="text-zinc-200">{SITE.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Conductor</dt>
            <dd className="text-zinc-200">{SITE.driver}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Teléfono</dt>
            <dd className="text-zinc-200">{SITE.phoneDisplay}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">WhatsApp</dt>
            <dd className="text-zinc-200">{SITE.whatsapp}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Email</dt>
            <dd className="text-zinc-200">{SITE.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Ubicación</dt>
            <dd className="text-zinc-200">
              {SITE.location.city}, {SITE.location.region}, {SITE.location.country}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Instagram</dt>
            <dd className="text-zinc-200">@{SITE.instagram}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Facebook</dt>
            <dd className="text-zinc-200">{SITE.facebook}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">URL del sitio</dt>
            <dd className="text-zinc-200">{SITE.url}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Medios de pago</dt>
            <dd className="text-zinc-200">{PAYMENT_METHODS.join(', ')}</dd>
          </div>
        </dl>
      </section>

      <p className="text-xs text-zinc-600">
        Para cambiar estos valores en producción, actualizá las variables de
        entorno en Vercel o el archivo <code className="text-zinc-400">src/lib/constants.ts</code>.
        Logo, hero y banners se gestionan en{' '}
        <a href="/admin/medios" className="text-amber-400 hover:underline">
          Medios del sitio
        </a>
        .
      </p>
    </div>
  )
}