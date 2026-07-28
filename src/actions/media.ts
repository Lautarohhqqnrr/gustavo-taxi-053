'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'
import {
  STORAGE_BUCKETS,
  SITE_MEDIA_SLOTS,
  type SiteMediaSlot,
  type GalleryCategory,
} from '@/lib/media/constants'
import { revalidatePath } from 'next/cache'

async function requireMediaWrite() {
  const { requirePermission } = await import('@/lib/auth/session')
  const session = await requirePermission('media:write')
  const supabase = await createClient()
  return { supabase, user: { id: session.id } }
}

async function requireGalleryWrite() {
  const { requirePermission } = await import('@/lib/auth/session')
  const session = await requirePermission('gallery:write')
  const supabase = await createClient()
  return { supabase, user: { id: session.id } }
}

function buildPath(folder: string, filename: string) {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${folder}/${y}/${m}/${filename}`
}

/**
 * Sube un archivo a un bucket de Supabase Storage.
 * Se espera que el cliente ya haya comprimido la imagen.
 */
export async function uploadToStorage(
  formData: FormData
): Promise<{ url: string; path: string; width?: number; height?: number; size?: number }> {
  await requireMediaWrite()
  const admin = createAdminClient()

  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string) || STORAGE_BUCKETS.gallery
  const folder = (formData.get('folder') as string) || 'uploads'
  const width = formData.get('width') ? Number(formData.get('width')) : undefined
  const height = formData.get('height') ? Number(formData.get('height')) : undefined

  if (!file) throw new Error('No se recibió archivo')

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowed.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Archivo demasiado grande (máx. 5 MB)')
  }

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : file.type === 'image/avif' ? 'avif' : 'jpg'
  const filename = `${randomUUID()}.${ext}`
  const path = buildPath(folder, filename)

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error('Error al subir la imagen')
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(path)

  return { url: publicUrl, path, width, height, size: file.size }
}

/**
 * Elimina un archivo de Storage.
 */
export async function deleteFromStorage(bucket: string, path: string) {
  await requireMediaWrite()
  const admin = createAdminClient()
  const { error } = await admin.storage.from(bucket).remove([path])
  if (error) {
    console.error('Storage delete error:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

/* ───────────────────────────── GALLERY ───────────────────────────── */

export async function createGalleryItem(data: {
  url: string
  path: string
  title: string
  description: string
  category: GalleryCategory
  alt?: string
}) {
  const { supabase } = await requireGalleryWrite()

  // Obtener el máximo order_index
  const { data: maxRow } = await supabase
    .from('gallery')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const order_index = (maxRow?.order_index ?? 0) + 1

  const { data: item, error } = await supabase
    .from('gallery')
    .insert({
      url: data.url,
      path: data.path,
      title: data.title,
      description: data.description,
      category: data.category,
      alt: data.alt || data.title,
      order_index,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
  return item
}

export async function updateGalleryItem(
  id: string,
  data: Partial<{
    title: string
    description: string
    category: GalleryCategory
    alt: string
    is_active: boolean
    order_index: number
    url: string
    path: string
  }>
) {
  const { supabase } = await requireGalleryWrite()
  const { error } = await supabase.from('gallery').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
}

export async function deleteGalleryItem(id: string) {
  const { supabase } = await requireGalleryWrite()
  const { data: item } = await supabase.from('gallery').select('path').eq('id', id).single()
  if (item?.path) {
    try {
      await deleteFromStorage(STORAGE_BUCKETS.gallery, item.path)
    } catch {
      // continuar aunque falle el storage
    }
  }
  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
}

export async function reorderGallery(orderedIds: string[]) {
  const { supabase } = await requireGalleryWrite()
  const updates = orderedIds.map((id, index) =>
    supabase.from('gallery').update({ order_index: index + 1 }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
}

export async function getGalleryItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('order_index', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

/* ───────────────────────────── SITE MEDIA ───────────────────────────── */

export async function setSiteMedia(
  slot: SiteMediaSlot,
  data: { url: string; path: string; alt?: string; width?: number; height?: number; size?: number; mime_type?: string }
) {
  const { supabase } = await requireMediaWrite()
  const slotConfig = SITE_MEDIA_SLOTS[slot]
  if (!slotConfig) throw new Error('Slot inválido')

  // Si ya existía, borrar el archivo anterior
  const { data: existing } = await supabase
    .from('site_media')
    .select('path')
    .eq('slot', slot)
    .maybeSingle()

  if (existing?.path && existing.path !== data.path) {
    try {
      await deleteFromStorage(STORAGE_BUCKETS.site, existing.path)
    } catch {
      // ignore
    }
  }

  const { error } = await supabase.from('site_media').upsert(
    {
      slot,
      url: data.url,
      path: data.path,
      alt: data.alt || slotConfig.label,
      width: data.width ?? null,
      height: data.height ?? null,
      size_bytes: data.size ?? null,
      mime_type: data.mime_type ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slot' }
  )

  if (error) throw new Error(error.message)

  // Revalidar páginas que usan estos slots
  revalidatePath('/')
  revalidatePath('/sobre-gustavo')
  revalidatePath('/servicios')
  revalidatePath('/recorridos')
  revalidatePath('/admin/medios')
}

export async function getSiteMedia(slot?: SiteMediaSlot) {
  const supabase = await createClient()
  if (slot) {
    const { data } = await supabase.from('site_media').select('*').eq('slot', slot).maybeSingle()
    return data
  }
  const { data } = await supabase.from('site_media').select('*')
  return data ?? []
}

/* ───────────────────────────── ENTITY IMAGES ───────────────────────────── */

export async function updateServiceImage(serviceId: string, url: string) {
  const { supabase } = await requireMediaWrite()
  const { error } = await supabase.from('services').update({ /* image field if exists */ }).eq('id', serviceId)
  // Nota: si services no tiene columna image_url en el schema original, agregar:
  // ALTER TABLE services ADD COLUMN image_url TEXT;
  if (error) {
    // Intentar con un campo genérico o ignorar
    console.warn(error.message)
  }
  revalidatePath('/servicios')
  revalidatePath('/admin/servicios')
}

export async function updateRouteImage(routeId: string, url: string) {
  const { supabase } = await requireMediaWrite()
  const { error } = await supabase.from('routes').update({ image_url: url }).eq('id', routeId)
  if (error) throw new Error(error.message)
  revalidatePath('/recorridos')
  revalidatePath('/admin/recorridos')
}

export async function updatePostCover(postId: string, url: string) {
  const { supabase } = await requireMediaWrite()
  const { error } = await supabase.from('posts').update({ cover_image: url }).eq('id', postId)
  if (error) throw new Error(error.message)
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}