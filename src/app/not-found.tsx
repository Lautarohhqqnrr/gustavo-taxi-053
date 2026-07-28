import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Phone } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-400/10 text-4xl font-bold text-gold-400">
        404
      </div>
      <h1 className="mb-3 text-3xl font-bold text-zinc-50">
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-md text-zinc-400">
        La página que buscás no existe o fue movida. Volvé al inicio o
        contactanos directamente.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="gold">
          <Link href="/">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
        <Button asChild variant="gold-outline">
          <a href={`tel:${SITE.phone}`}>
            <Phone className="h-4 w-4" />
            Llamar
          </a>
        </Button>
      </div>
    </div>
  )
}