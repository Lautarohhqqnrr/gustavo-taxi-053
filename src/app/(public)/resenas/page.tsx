import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reseñas de clientes',
  description:
    'Opiniones de pasajeros de Gustavo Taxi 053 en Esquel, Trevelin y Chubut.',
  alternates: { canonical: `${SITE.url}/resenas` },
}

export const revalidate = 60

const fallbackReviews = [
  {
    id: '1',
    name: 'María G.',
    comment:
      'Gustavo nos llevó al aeropuerto con tiempo de sobra. Puntual, amable y el auto impecable. Lo recomiendo 100%.',
    rating: 5,
    admin_reply: null,
  },
  {
    id: '2',
    name: 'Carlos R.',
    comment:
      'Viajamos a Bariloche en familia. El trayecto fue cómodo, con internet y paradas cuando lo necesitamos. Excelente servicio.',
    rating: 5,
    admin_reply: null,
  },
  {
    id: '3',
    name: 'Ana & Pedro',
    comment:
      'Contratamos el traslado a Lago Futalaufquen. Gustavo conoce cada curva. Se nota la experiencia. Volveremos a llamarlo.',
    rating: 5,
    admin_reply: null,
  },
]

export default async function ResenasPage() {
  let reviews = fallbackReviews
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('reviews')
      .select('id, name, comment, rating, admin_reply')
      .eq('is_approved', true)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data && data.length > 0) reviews = data
  } catch {
    // usar fallback
  }

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Reseñas
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Lo que dicen los pasajeros
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            La confianza se construye viaje a viaje.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating
                        ? 'fill-gold-400 text-gold-400'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <p className="mb-4 text-sm italic leading-relaxed text-zinc-400">
                &ldquo;{r.comment}&rdquo;
              </p>
              <p className="text-sm font-semibold text-zinc-200">{r.name}</p>
              {r.admin_reply && (
                <div className="mt-4 rounded-lg border border-gold-400/15 bg-gold-400/5 p-3">
                  <p className="mb-1 text-xs font-medium text-gold-400">
                    Respuesta de Gustavo
                  </p>
                  <p className="text-xs text-zinc-400">{r.admin_reply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}