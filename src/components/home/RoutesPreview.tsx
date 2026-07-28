'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { FREQUENT_ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function RoutesPreview() {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Recorridos frecuentes
            </h2>
            <p className="max-w-xl text-zinc-400">
              Los destinos más solicitados desde Esquel y Trevelin.
            </p>
          </div>
          <Button asChild variant="gold-outline">
            <Link href="/recorridos">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FREQUENT_ROUTES.map((route, i) => (
            <motion.div
              key={route.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/recorridos#${route.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/40 px-5 py-4 transition-all hover:border-gold-400/25 hover:bg-zinc-900/70"
              >
                <div>
                  <span className="block text-sm font-medium text-zinc-100">
                    {route.from}
                  </span>
                  <span className="text-xs text-zinc-500">hacia</span>
                  <span className="block text-sm font-semibold text-gold-400">
                    {route.to}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-gold-400" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}