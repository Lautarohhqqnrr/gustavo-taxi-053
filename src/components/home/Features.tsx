'use client'

import { motion } from 'framer-motion'
import {
  Wifi,
  Award,
  Clock,
  Shield,
  Car,
  Heart,
} from 'lucide-react'
import { DIFFERENTIALS } from '@/lib/constants'

const iconMap = {
  Wifi,
  Award,
  Clock,
  Shield,
  Car,
  Heart,
} as const

export function Features() {
  return (
    <section className="section-padding relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            ¿Por qué elegirnos?
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Diferenciales que nos convierten en la opción de confianza para tus
            traslados en Chubut.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIALS.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || Car
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-white/5 bg-zinc-900/40 p-6 transition-all hover:border-gold-400/20 hover:bg-zinc-900/70"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400 transition-colors group-hover:bg-gold-400/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}