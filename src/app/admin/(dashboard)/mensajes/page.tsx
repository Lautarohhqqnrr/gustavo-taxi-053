import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'

export default async function AdminMensajesPage() {
  await requirePermission('messages:read')
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Mensajes</h1>
        <p className="text-sm text-zinc-500">
          Consultas recibidas desde el formulario de contacto
        </p>
      </div>

      {!messages?.length ? (
        <p className="text-sm text-zinc-500">No hay mensajes todavía.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-4 ${
                m.is_read
                  ? 'border-white/5 bg-zinc-900/40'
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-zinc-100">{m.name}</p>
                <time className="text-xs text-zinc-500">
                  {new Date(m.created_at).toLocaleString('es-AR')}
                </time>
              </div>
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-500">Tel:</span> {m.phone}
              </p>
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-500">Ruta:</span> {m.origin} →{' '}
                {m.destination}
              </p>
              {(m.preferred_date || m.preferred_time) && (
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-500">Fecha/hora:</span>{' '}
                  {m.preferred_date || '—'} {m.preferred_time || ''}
                </p>
              )}
              {m.message && (
                <p className="mt-2 text-sm text-zinc-300">{m.message}</p>
              )}
              {!m.is_read && (
                <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  Nuevo
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}