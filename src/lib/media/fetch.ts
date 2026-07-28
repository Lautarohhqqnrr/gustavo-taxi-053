import { createClient } from '@/lib/supabase/server'
import type { SiteMediaSlot } from './constants'

/**
 * Obtiene la URL pública de un slot de site_media.
 * Usar en Server Components.
 */
export async function getMediaUrl(slot: SiteMediaSlot): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_media')
    .select('url')
    .eq('slot', slot)
    .maybeSingle()
  return data?.url || null
}

/**
 * Obtiene todas las imágenes activas de la galería, ordenadas.
 */
export async function getPublicGallery(category?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('gallery')
    .select('id, url, title, description, category, alt')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data } = await query
  return data ?? []
}