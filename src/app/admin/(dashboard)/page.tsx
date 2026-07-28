import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'

export default async function AdminDashboard() {
  const admin = await getSessionUser()
  const supabase = await createClient()

  const [messages, reviews, posts, gallery] = await Promise.all([
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const stats = [
    { label: 'Mensajes sin leer', value: messages.count ?? 0 },
    { label: 'Reseñas pendientes', value: reviews.count ?? 0 },
    { label: 'Posts publicados', value: posts.count ?? 0 },
    { label: 'Imágenes en galería', value: gallery.count ?? 0 },
  ]

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-50">Dashboard</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Hola{admin?.fullName ? `, ${admin.fullName}` : ''} — Gustavo Taxi 053
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/5 bg-zinc-900/50 p-5"
          >
            <p className="text-3xl font-bold text-amber-400">{s.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
