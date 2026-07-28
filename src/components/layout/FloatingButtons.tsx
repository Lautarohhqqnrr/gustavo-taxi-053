'use client'

import { useState } from 'react'
import { Phone, MessageCircle, UserPlus, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE, WHATSAPP_MESSAGE } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function FloatingButtons() {
  const [shareOpen, setShareOpen] = useState(false)

  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  const handleWhatsApp = () => {
    trackEvent('whatsapp_click')
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCall = () => {
    trackEvent('call_click')
    window.location.href = `tel:${SITE.phone}`
  }

  const handleAddContact = async () => {
    trackEvent('contact_download')
    window.location.href = '/api/vcf'
  }

  const handleShare = async () => {
    trackEvent('share_click')
    if (navigator.share) {
      try {
        await navigator.share({
          title: SITE.name,
          text: SITE.tagline,
          url: SITE.url,
        })
      } catch {
        // user cancelled
      }
    } else {
      setShareOpen((v) => !v)
      await navigator.clipboard.writeText(SITE.url)
    }
  }

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 shadow-xl"
          >
            ¡Enlace copiado!
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingBtn
        onClick={handleShare}
        label="Compartir"
        className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
      >
        <Share2 className="h-5 w-5" />
      </FloatingBtn>

      <FloatingBtn
        onClick={handleAddContact}
        label="Agregar contacto"
        className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
      >
        <UserPlus className="h-5 w-5" />
      </FloatingBtn>

      <FloatingBtn
        onClick={handleCall}
        label="Llamar"
        className="bg-emerald-600 text-white hover:bg-emerald-500"
      >
        <Phone className="h-5 w-5" />
      </FloatingBtn>

      <FloatingBtn
        onClick={handleWhatsApp}
        label="WhatsApp"
        className="bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] animate-pulse-gold"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </FloatingBtn>
    </div>
  )
}

function FloatingBtn({
  children,
  onClick,
  label,
  className,
  size = 'md',
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold-400/60',
        size === 'lg' ? 'h-14 w-14' : 'h-12 w-12',
        className
      )}
    >
      {children}
    </button>
  )
}