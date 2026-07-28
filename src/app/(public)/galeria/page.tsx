import type { Metadata } from 'next'
import { SITE, GALLERY_CATEGORIES } from '@/lib/constants'
import { getPublicGallery } from '@/lib/media/fetch'

export const metadata: Metadata = {
  title: 'Galería',
  description:
    'Fotos del vehículo, paisajes de Chubut, viajes y turismo con Gustavo Taxi 053.',
  alternates: { canonical: `${SITE.url}/galeria` },
}

export const revalidate = 60

export default async function GaleriaPage() {
  let items: Awaited<ReturnType<typeof getPublicGallery>> = []
  try {
    items = await getPublicGallery()
  } catch {
    items = []
  }

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Galería
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Momentos del camino
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Vehículo, paisajes de la Patagonia y experiencias de viaje por Chubut.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto">
          {/* Filtros visuales (categorías) */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-medium text-gold-400">
              Todas
            </span>
            {GALLERY_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-400"
              >
                {cat}
              </span>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {/* Placeholders elegantes mientras no hay imágenes en Storage */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-xl border border-white/5 bg-zinc-900/60"
                >
                  <div className="flex h-full items-center justify-center text-zinc-700">
                    <span className="text-xs">Próximamente</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <figure
                  key={item.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || item.title || 'Galería Gustavo Taxi 053'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {(item.title || item.category) && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      {item.title && (
                        <p className="text-sm font-medium text-white">{item.title}</p>
                      )}
                      {item.category && (
                        <p className="text-xs text-gold-400">{item.category}</p>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}