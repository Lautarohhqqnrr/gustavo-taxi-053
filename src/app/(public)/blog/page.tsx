import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Blog y consejos de viaje',
  description:
    'Tips, destinos y novedades para recorrer Chubut con Gustavo Taxi 053.',
  alternates: { canonical: `${SITE.url}/blog` },
}

export const revalidate = 60

export default async function BlogPage() {
  let posts: {
    id: string
    title: string
    slug: string
    excerpt: string
    cover_image: string | null
    category: string
    published_at: string | null
  }[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(12)
    if (data) posts = data
  } catch {
    // vacío
  }

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Blog
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            Novedades y consejos de viaje
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Tips, destinos y novedades para recorrer Chubut con inteligencia.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 py-20 text-center">
              <p className="text-zinc-500">Próximamente nuevas publicaciones.</p>
              <Link href="/contacto" className="btn-outline-gold mt-6 inline-flex">
                Contactar
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 transition-colors hover:border-gold-400/20"
                >
                  <div className="aspect-[16/10] bg-zinc-900">
                    {post.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
                      {post.category}
                    </p>
                    <h2 className="mb-2 text-base font-semibold text-zinc-100 group-hover:text-gold-400">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-zinc-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}