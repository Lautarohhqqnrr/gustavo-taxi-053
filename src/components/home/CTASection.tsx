'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Phone } from 'lucide-react'
import { SITE, WHATSAPP_MESSAGE } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'
import { Button } from '@/components/ui/button'

export function CTASection() {
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-16 text-center sm:px-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-400/10 via-transparent to-transparent" />

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              ¿Listo para viajar con tranquilidad?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-zinc-400">
              Escribime o llamame. Respuesta rápida, puntualidad garantizada y
              el mejor servicio de taxi de la zona.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  trackEvent('whatsapp_click')
                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </Button>
              <Button variant="gold-outline" size="lg" asChild>
                <a
                  href={`tel:${SITE.phone}`}
                  onClick={() => trackEvent('call_click')}
                >
                  <Phone className="h-5 w-5" />
                  {SITE.phoneDisplay}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}