import type { Metadata } from 'next'
import Link from 'next/link'
import { FREQUENT_ROUTES, SITE } from '@/lib/constants'
import { ArrowRight, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recorridos frecuentes | Taxi Esquel',
  description:
    'Esquel–Trevelin, Aeropuerto, Bariloche, Trelew, La Hoya, El Bolsón y Lago Futalaufquen. Traslados con Gustavo Taxi 053.',
  alternates: { canonical: `${SITE.url}/recorridos` },
}

const routeDetails: Record<
  string,
  { description: string; approx: string }
> = {
  'esquel-trevelin': {
    description: 'Conexión frecuente entre Esquel y la hermosa Trevelin. Ideal para visitas, gestiones o turismo local.',
    approx: '~25 min · 25 km',
  },
  'esquel-aeropuerto': {
    description: 'Traslados puntuales al Aeropuerto de Esquel (EQS). Seguimiento de vuelos y espera con cartel.',
    approx: '~20 min · 20 km',
  },
  'esquel-trelew': {
    description: 'Viaje cómodo hacia Trelew y la zona atlántica de Chubut. Ruta conocida y planificada.',
    approx: '~5 h · 400 km',
  },
  'esquel-bariloche': {
    description: 'Uno de los recorridos más solicitados de la Patagonia. Paisajes de cordillera y comodidad a bordo.',
    approx: '~4 h · 300 km',
  },
  'esquel-la-hoya': {
    description: 'Centro de ski La Hoya. Temporada de nieve y también en verano para miradores y trekking.',
    approx: '~20 min · 15 km',
  },
  'esquel-el-bolson': {
    description: 'Destino ideal para turismo, ferias artesanales y naturaleza. Viaje panorámico por la comarca.',
    approx: '~2,5 h · 180 km',
  },
  'esquel-lago-futalaufquen': {
    description: 'Portal al Parque Nacional Los Alerces. Traslados para excursionistas y familias.',
    approx: '~50 min · 50 km',
  },
}

export default function RecorridosPage() {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola Gustavo! Quiero consultar por un recorrido.')}`

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Recorridos
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Destinos más solicitados
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Desde Esquel y Trevelin hacia los principales puntos de Chubut y la región.
            Consultá disponibilidad y tarifa por WhatsApp.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FREQUENT_ROUTES.map((route) => {
            const detail = routeDetails[route.slug]
            return (
              <article
                key={route.slug}
                id={route.slug}
                className="flex flex-col rounded-2xl border border-white/5 bg-zinc-900/40 p-6 scroll-mt-24"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="block text-xs text-zinc-500">{route.from}</span>
                    <span className="text-lg font-semibold text-gold-400">
                      → {route.to}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-600" />
                </div>
                {detail && (
                  <>
                    <p className="mb-3 flex-1 text-sm leading-relaxed text-zinc-400">
                      {detail.description}
                    </p>
                    <p className="mb-4 text-xs font-medium text-zinc-500">{detail.approx}</p>
                  </>
                )}
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400/10 px-4 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-400/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultar este recorrido
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-t border-white/5 py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-3 text-2xl font-bold text-zinc-50">
            ¿Tu destino no está en la lista?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-zinc-400">
            Cubro toda la provincia del Chubut y destinos de la región. Consultame sin compromiso.
          </p>
          <Link href="/contacto" className="btn-gold">
            Solicitar traslado
          </Link>
        </div>
      </section>
    </div>
  )
}