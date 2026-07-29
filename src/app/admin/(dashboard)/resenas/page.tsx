export const dynamic = "force-dynamic"
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'
import { Star } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function aprobarResena(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('reviews').update({ is_approved: true, is_hidden: false }).eq('id', id)
  revalidatePath('/admin/resenas')
}

async function rechazarResena(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('reviews').update({ is_approved: false, is_hidden: true }).eq('id', id)
  revalidatePath('/admin/resenas')
}

async function eliminarResena(id: string) {
  'use server'
  const supabase = await createClient()
  await supabase.from('reviews').delete().eq('id', id)
  revalidatePath('/admin/resenas')
}

export default async function AdminResenasPage() {
  await requirePermission('reviews:read')
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Reseñas</h1>
        <p className="text-sm text-zinc-500">Moderación de opiniones de clientes</p>
      </div>
      {!reviews?.length ? (
        <p className="text-sm text-zinc-500">No hay reseñas todavía.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-100">{r.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 text-[10px]">
                  {r.is_approved ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">Aprobada</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400">Pendiente</span>
                  )}
                  {r.is_hidden && (
                    <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-zinc-400">Oculta</span>
                  )}
                </div>
              </div>
              <p className="text-sm italic text-zinc-400">&ldquo;{r.comment}&rdquo;</p>
              <time className="mt-2 block text-[11px] text-zinc-600">{new Date(r.created_at).toLocaleString('es-AR')}</time>
              <div className="mt-3 flex gap-2">
                <form action={aprobarResena.bind(null, r.id)}>
                  <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500">
                    ✓ Aprobar
                  </button>
                </form>
                <form action={rechazarResena.bind(null, r.id)}>
                  <button type="submit" className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600">
                    Rechazar
                  </button>
                </form>
                <form action={eliminarResena.bind(null, r.id)}>
                  <button type="submit" className="rounded-lg bg-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900">
                    Eliminar
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
