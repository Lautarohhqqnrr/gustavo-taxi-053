'use client'

import { motion } from 'framer-motion'
import { Phone, MessageCircle, UserPlus } from 'lucide-react'
import { SITE, WHATSAPP_MESSAGE } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Counter } from './Counter'

export function Hero() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-400/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      <div className="container relative mx-auto px-4 py-20 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-4xl"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/5 px-4 py-1.5 text-xs font-medium text-gold-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-400" />
            Servicio premium en toda la provincia del Chubut
          </span>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Gustavo Taxi</span>
            <span className="text-gradient-gold">053</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            {SITE.tagline}
          </p>

          <div className="mb-14 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="gold"
              size="lg"
              className="min-w-[160px]"
              onClick={() => {
                trackEvent('whatsapp_click')
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>

            <Button
              variant="gold-outline"
              size="lg"
              className="min-w-[160px]"
              asChild
            >
              <a
                href={`tel:${SITE.phone}`}
                onClick={() => trackEvent('call_click')}
              >
                <Phone className="h-5 w-5" />
                Llamar
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[160px]"
              onClick={() => {
                trackEvent('contact_download')
                window.location.href = '/api/vcf'
              }}
            >
              <UserPlus className="h-5 w-5" />
              Agregar contacto
            </Button>
          </div>

          <Counter />
        </motion.div>
      </div>
    </section>
  )
}