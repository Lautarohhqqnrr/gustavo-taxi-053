'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
          className={cn(
            'fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full',
            'border border-white/10 bg-zinc-900/90 text-zinc-300 shadow-lg backdrop-blur-md',
            'transition-colors hover:border-gold-400/40 hover:text-gold-400 sm:left-6'
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}