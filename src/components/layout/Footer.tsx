import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'
import { SITE, NAV_LINKS, FREQUENT_ROUTES } from '@/lib/constants'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-sm font-bold text-black">
                GT
              </div>
              <div>
                <span className="block font-semibold text-zinc-100">
                  {SITE.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {SITE.driver}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {SITE.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-gold-400/40 hover:text-gold-400"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-gold-400/40 hover:text-gold-400"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recorridos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Recorridos frecuentes
            </h3>
            <ul className="space-y-2.5">
              {FREQUENT_ROUTES.slice(0, 6).map((route) => (
                <li key={route.slug}>
                  <Link
                    href={`/recorridos#${route.slug}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-gold-400"
                  >
                    {route.from} → {route.to}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${SITE.phone}`}
                  className="flex items-center gap-2.5 text-sm text-zinc-400 transition-colors hover:text-gold-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold-400" />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2.5 text-sm text-zinc-400 transition-colors hover:text-gold-400"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" />
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>
                  {SITE.location.city}, {SITE.location.region}
                  <br />
                  {SITE.location.coverage}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {year} {SITE.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}