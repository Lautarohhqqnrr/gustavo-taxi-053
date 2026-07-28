'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SITE, NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-18 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 text-sm font-bold text-black shadow-gold-sm transition-transform group-hover:scale-105">
            GT
          </div>
          <div className="hidden sm:block">
            <span className="block text-sm font-semibold tracking-tight text-zinc-100">
              {SITE.name}
            </span>
            <span className="block text-[11px] text-zinc-500">
              Esquel · Chubut
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-gold-400'
                  : 'text-zinc-400 hover:text-zinc-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
            <a href={`tel:${SITE.phone}`}>
              <Phone className="h-3.5 w-3.5" />
              Llamar
            </a>
          </Button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-4 py-3 text-base font-medium',
                    pathname === link.href
                      ? 'bg-gold-400/10 text-gold-400'
                      : 'text-zinc-300 hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={`tel:${SITE.phone}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-3 text-sm font-semibold text-black"
              >
                <Phone className="h-4 w-4" />
                Llamar ahora
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}