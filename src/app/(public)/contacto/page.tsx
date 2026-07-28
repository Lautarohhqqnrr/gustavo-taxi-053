import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'
import { ContactForm } from '@/components/forms/ContactForm'
import { Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto | Reservá tu traslado',
  description:
    'Contactá a Gustavo Taxi 053. WhatsApp, teléfono y formulario de reserva para traslados en Esquel, Trevelin y Chubut.',
  alternates: { canonical: `${SITE.url}/contacto` },
}

export default function ContactoPage() {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hola Gustavo! Quiero consultar por un traslado.')}`

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Contacto
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Reservá tu traslado
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Completá el formulario o escribinos directo. Respuesta rápida garantizada.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-zinc-100">Datos de contacto</h2>

            <a
              href={`tel:${SITE.phone}`}
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-4 transition-colors hover:border-gold-400/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Teléfono / WhatsApp</p>
                <p className="text-sm text-zinc-400">{SITE.phoneDisplay}</p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Ubicación</p>
                <p className="text-sm text-zinc-400">
                  Esquel y Trevelin, Chubut
                  <br />
                  Cobertura: toda la provincia
                </p>
              </div>
            </div>

            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-4 transition-colors hover:border-gold-400/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Instagram</p>
                <p className="text-sm text-zinc-400">@{SITE.instagram}</p>
              </div>
            </a>

            <a
              href={SITE.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-zinc-900/40 p-4 transition-colors hover:border-gold-400/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                <Facebook className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Facebook</p>
                <p className="text-sm text-zinc-400">{SITE.facebook}</p>
              </div>
            </a>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={`tel:${SITE.phone}`} className="btn-outline-gold inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Llamar
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}