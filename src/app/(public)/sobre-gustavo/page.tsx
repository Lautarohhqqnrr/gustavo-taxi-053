import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/constants'
import { getMediaUrl } from '@/lib/media/fetch'
import { Check, MessageCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Gustavo Huaiquiñir',
  description:
    'Conocé a Gustavo Huaiquiñir, conductor de Gustavo Taxi 053. Más de 10 años de experiencia en Esquel, Trevelin y toda la provincia del Chubut.',
  alternates: { canonical: `${SITE.url}/sobre-gustavo` },
}

export const revalidate = 60

const highlights = [
  'Conductor profesional con más de 10 años de experiencia',
  'Basado en Esquel y Trevelin',
  'Cobertura en toda la provincia del Chubut',
  'Internet satelital a bordo',
  'Vehículo cómodo y en excelentes condiciones',
  'Atención personalizada, sin intermediarios',
  'Puntualidad y seguridad en cada viaje',
  'Traslados urbanos, aeropuerto, turismo y larga distancia',
]

export default async function SobreGustavoPage() {
  let photoUrl: string | null = null
  try {
    photoUrl = await getMediaUrl('about_photo')
  } catch {
    photoUrl = null
  }

  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola Gustavo!')}`

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto grid items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 aspect-[4/3]">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="Gustavo Huaiquiñir — Gustavo Taxi 053"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-400/10 text-3xl font-bold text-gold-400">
                  GH
                </div>
                <span className="text-sm">Gustavo Huaiquiñir</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
              <p className="text-2xl font-bold text-gold-400">+10</p>
              <p className="text-xs text-zinc-400">años de experiencia</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
              El conductor
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50">
              {SITE.driver}
            </h1>
            <p className="mb-4 text-lg leading-relaxed text-zinc-400">
              Más de una década al volante recorriendo cada rincón de la provincia del
              Chubut. Conozco las rutas, el clima y lo que necesita cada pasajero.
            </p>
            <p className="mb-8 text-zinc-400 leading-relaxed">
              Mi objetivo es simple: que llegues a destino seguro, cómodo y a tiempo.
              Sin vueltas, con trato cercano y profesionalismo. Cuando reservás con
              Gustavo Taxi 053, hablás directamente conmigo.
            </p>

            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${SITE.phone}`}
                className="btn-outline-gold inline-flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {SITE.phoneDisplay}
              </a>
              <Link href="/contacto" className="btn-outline-gold">
                Formulario
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}