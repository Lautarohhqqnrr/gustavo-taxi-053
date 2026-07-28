'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin,
  Plane,
  Mountain,
  Route,
  Navigation,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const services = [
  {
    title: 'Traslados urbanos',
    description: 'Movilidad dentro de Esquel, Trevelin y alrededores.',
    icon: MapPin,
  },
  {
    title: 'Aeropuerto de Esquel',
    description: 'Ida y vuelta al aeropuerto. Te esperamos con el cartel.',
    icon: Plane,
  },
  {
    title: 'Turismo Lago Futalaufquen',
    description: 'Parque Nacional Los Alerces y Lago Futalaufquen.',
    icon: Mountain,
  },
  {
    title: 'Viajes provinciales',
    description: 'Toda la provincia del Chubut con seguridad.',
    icon: Route,
  },
  {
    title: 'Larga distancia',
    description: 'Bariloche, Trelew, El Bolsón y más.',
    icon: Navigation,
  },
  {
    title: 'Traslados especiales',
    description: 'Eventos, grupos y requerimientos especiales.',
    icon: Star,
  },
]

export function ServicesPreview() {
  return (
    <section className="section-padding bg-zinc-900/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Nuestros servicios
            </h2>
            <p className="max-w-xl text-zinc-400">
              Desde traslados urbanos hasta viajes de larga distancia por toda
              la Patagonia.
            </p>
          </div>
          <Button asChild variant="gold-outline">
            <Link href="/servicios">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 rounded-2xl border border-white/5 bg-zinc-950/50 p-5 transition-colors hover:border-gold-400/15"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
                <service.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-zinc-100">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-400">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}