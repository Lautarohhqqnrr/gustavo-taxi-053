export const dynamic = "force-dynamic"
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/session'

export default async function AdminBlogPage() {
  await requirePermission('blog:read')
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, category, is_published, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Blog</h1>
          <p className="text-sm text-zinc-500">Publicaciones del sitio</p>
        </div>
      </div>

      {!posts?.length ? (
        <p className="text-sm text-zinc-500">
          No hay publicaciones. El editor Tiptap está disponible en el proyecto
          para crear posts cuando conectes el formulario de alta.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-zinc-200">{p.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.is_published ? (
                      <span className="text-emerald-400">Publicado</span>
                    ) : (
                      <span className="text-zinc-500">Borrador</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(p.published_at || p.created_at).toLocaleDateString(
                      'es-AR'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Vista pública:{' '}
        <Link href="/blog" className="text-amber-400 hover:underline">
          /blog
        </Link>
      </p>
    </div>
  )
}