'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const COOKIE_KEY = 'gt053_cookies_accepted'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY)
    if (!accepted) {
      const t = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, '1')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
            <p className="flex-1 text-sm leading-relaxed text-zinc-300">
              Usamos cookies propias y de terceros para mejorar tu experiencia y
              analizar el tráfico. Al continuar aceptás nuestra{' '}
              <Link
                href="/privacidad"
                className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
              >
                Política de Privacidad
              </Link>
              .
            </p>
            <Button variant="gold" size="sm" onClick={accept} className="shrink-0">
              Aceptar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}