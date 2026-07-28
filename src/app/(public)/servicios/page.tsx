import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Plane, Mountain, Route, Navigation, Star, MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Servicios de Taxi en Esquel y Chubut',
  description:
    'Traslados urbanos, aeropuerto de Esquel, turismo Lago Futalaufquen, viajes provinciales y de larga distancia. Gustavo Taxi 053.',
  alternates: { canonical: `${SITE.url}/servicios` },
}

const services = [
  {
    title: 'Traslados urbanos',
    description:
      'Movilidad dentro de Esquel, Trevelin y alrededores. Ideal para gestiones, citas médicas, traslados al trabajo o salidas. Puntualidad y confort garantizados.',
    icon: MapPin,
    features: ['Esquel y Trevelin', 'Horarios flexibles', 'Precio transparente'],
  },
  {
    title: 'Aeropuerto de Esquel',
    description:
      'Traslados ida y vuelta al Aeropuerto de Esquel (EQS). Te esperamos con cartel, controlamos demoras de vuelo y te llevamos directo a tu alojamiento.',
    icon: Plane,
    features: ['Seguimiento de vuelos', 'Cartel de bienvenida', 'Ida y vuelta'],
  },
  {
    title: 'Turismo Lago Futalaufquen',
    description:
      'Excursiones y traslados al Parque Nacional Los Alerces y Lago Futalaufquen. Conocemos cada acceso, mirador y sendero de la zona.',
    icon: Mountain,
    features: ['Parque Los Alerces', 'Medio día o día completo', 'Paradas fotográficas'],
  },
  {
    title: 'Viajes provinciales',
    description:
      'Conectamos toda la provincia del Chubut: costa, cordillera y estepa. Seguridad y experiencia en rutas nacionales y provinciales.',
    icon: Route,
    features: ['Toda la provincia', 'Rutas conocidas', 'Vehículo cómodo'],
  },
  {
    title: 'Viajes de larga distancia',
    description:
      'Esquel – Bariloche, Trelew, El Bolsón y más destinos de la Patagonia. Viajes planificados, con paradas y el confort que necesitás.',
    icon: Navigation,
    features: ['Bariloche', 'Trelew', 'El Bolsón'],
  },
  {
    title: 'Traslados especiales',
    description:
      'Eventos, traslados corporativos, grupos, casamientos y requerimientos especiales. Coordinamos cada detalle con anticipación.',
    icon: Star,
    features: ['Eventos', 'Empresas', 'Grupos'],
  },
]

export default function ServiciosPage() {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola Gustavo! Quiero consultar por un servicio.')}`

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Servicios
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Taxi premium en Esquel y Chubut
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Desde un traslado al aeropuerto hasta un viaje a Bariloche. Más de 10 años
            llevando personas con seguridad por toda la provincia.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.title}
              className="flex flex-col rounded-2xl border border-white/5 bg-zinc-900/40 p-6 transition-colors hover:border-gold-400/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                <s.icon className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-zinc-100">{s.title}</h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
                {s.description}
              </p>
              <ul className="mb-5 space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="h-1 w-1 rounded-full bg-gold-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400/10 px-4 py-2.5 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-400/20"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-zinc-900/30 py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-3 text-2xl font-bold text-zinc-50">
            ¿Necesitás un traslado a medida?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-zinc-400">
            Escribime y armamos el viaje según tu horario, destino y cantidad de pasajeros.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              WhatsApp
            </a>
            <Link href="/contacto" className="btn-outline-gold">
              Formulario de contacto
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}