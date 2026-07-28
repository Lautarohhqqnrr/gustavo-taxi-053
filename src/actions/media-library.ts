'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/session'
import {
  MEDIA_BUCKET,
  ALLOWED_MEDIA_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_PDF_SIZE,
  getMediaKind,
  type MediaAsset,
  type MediaFilters,
} from '@/lib/media/library-constants'

function revalidateMedia() {
  revalidatePath('/admin/biblioteca')
  revalidatePath('/admin/medios')
  revalidatePath('/admin/galeria')
}

async function logActivity(
  assetId: string | null,
  userId: string,
  action: string,
  detail?: string
) {
  const supabase = await createClient()
  await supabase.from('media_activity_log').insert({
    asset_id: assetId,
    user_id: userId,
    action,
    detail: detail ?? null,
  })
}

function buildStoragePath(folder: string, filename: string) {
  const d = new Date()
  return `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${filename}`
}

/* ───────────────────────────── LIST / SEARCH ───────────────────────────── */

export async function listMediaAssets(filters: MediaFilters = {}) {
  await requirePermission('media:read')
  const supabase = await createClient()

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('media_assets').select('*', { count: 'exact' })

  if (filters.search) {
    const s = filters.search.trim()
    query = query.or(
      `name.ilike.%${s}%,title.ilike.%${s}%,alt_text.ilike.%${s}%,description.ilike.%${s}%`
    )
  }

  if (filters.kind && filters.kind !== 'all') {
    if (filters.kind === 'image') query = query.like('mime_type', 'image/%')
    else if (filters.kind === 'video') query = query.like('mime_type', 'video/%')
    else if (filters.kind === 'pdf') query = query.eq('mime_type', 'application/pdf')
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.tag) {
    query = query.contains('tags', [filters.tag])
  }

  if (filters.used === 'used') query = query.eq('is_used', true)
  if (filters.used === 'unused') query = query.eq('is_used', false)

  if (filters.folderId) {
    query = query.eq('folder_id', filters.folderId)
  }

  switch (filters.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'size_desc':
      query = query.order('size_bytes', { ascending: false })
      break
    case 'size_asc':
      query = query.order('size_bytes', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw new Error(error.message)

  return {
    items: (data ?? []) as MediaAsset[],
    total: count ?? 0,
    page,
    pageSize,
    hasMore: (count ?? 0) > to + 1,
  }
}

export async function getMediaAsset(id: string) {
  await requirePermission('media:read')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as MediaAsset
}

export async function getMediaStats() {
  await requirePermission('media:read')
  const supabase = await createClient()

  const { data: all } = await supabase
    .from('media_assets')
    .select('mime_type, size_bytes, is_used, created_at')

  const rows = all ?? []
  const total = rows.length
  const images = rows.filter((r) => r.mime_type?.startsWith('image/')).length
  const videos = rows.filter((r) => r.mime_type?.startsWith('video/')).length
  const pdfs = rows.filter((r) => r.mime_type === 'application/pdf').length
  const unused = rows.filter((r) => !r.is_used).length
  const usedBytes = rows.reduce((acc, r) => acc + (r.size_bytes || 0), 0)

  return {
    total,
    images,
    videos,
    pdfs,
    unused,
    usedBytes,
    recent: rows.slice(0, 5),
  }
}

/* ───────────────────────────── UPLOAD ───────────────────────────── */

export async function uploadMediaAsset(formData: FormData) {
  const session = await requirePermission('media:write')
  const admin = createAdminClient()

  const file = formData.get('file') as File | null
  if (!file) throw new Error('No se recibió archivo')

  if (!ALLOWED_MEDIA_TYPES.includes(file.type as (typeof ALLOWED_MEDIA_TYPES)[number])) {
    throw new Error('Tipo de archivo no permitido')
  }

  const kind = getMediaKind(file.type)
  const max =
    kind === 'video' ? MAX_VIDEO_SIZE : kind === 'pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE
  if (file.size > max) {
    throw new Error(`Archivo demasiado grande (máx. ${Math.round(max / 1024 / 1024)} MB)`)
  }

  // Extensión segura
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'application/pdf': 'pdf',
  }
  const ext = extMap[file.type] || 'bin'
  const safeBase = (formData.get('name') as string)?.replace(/[^a-zA-Z0-9-_]/g, '_') || randomUUID()
  const filename = `${safeBase}-${randomUUID().slice(0, 8)}.${ext}`
  const folder = (formData.get('folder') as string) || kind
  const path = buildStoragePath(folder, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await admin.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (upErr) {
    console.error(upErr)
    throw new Error('Error al subir a Storage')
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path)

  const width = formData.get('width') ? Number(formData.get('width')) : null
  const height = formData.get('height') ? Number(formData.get('height')) : null
  const title = (formData.get('title') as string) || file.name.replace(/\.[^.]+$/, '')
  const category = (formData.get('category') as string) || 'Sin categoría'
  const alt = (formData.get('alt') as string) || title

  const supabase = await createClient()
  const { data: asset, error } = await supabase
    .from('media_assets')
    .insert({
      name: filename,
      original_name: file.name,
      path,
      url: publicUrl,
      bucket: MEDIA_BUCKET,
      mime_type: file.type,
      extension: ext,
      size_bytes: file.size,
      width,
      height,
      title,
      alt_text: alt,
      category,
      thumb_url: kind === 'image' ? publicUrl : null,
      uploaded_by: session.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logActivity(asset.id, session.id, 'upload', file.name)
  revalidateMedia()
  return asset as MediaAsset
}

/* ───────────────────────────── UPDATE META ───────────────────────────── */

export async function updateMediaAsset(
  id: string,
  data: Partial<{
    name: string
    title: string
    alt_text: string
    description: string
    category: string
    tags: string[]
    folder_id: string | null
    is_featured: boolean
    is_used: boolean
    usage_locations: string[]
  }>
) {
  const session = await requirePermission('media:write')
  const supabase = await createClient()

  const { error } = await supabase.from('media_assets').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  await logActivity(id, session.id, 'update_meta', JSON.stringify(Object.keys(data)))
  revalidateMedia()
}

/* ───────────────────────────── REPLACE (misma URL / path) ───────────────────────────── */

/**
 * Reemplaza el binario manteniendo path y URL pública.
 * Todas las referencias existentes siguen funcionando.
 */
export async function replaceMediaAsset(id: string, formData: FormData) {
  const session = await requirePermission('media:write')
  const admin = createAdminClient()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single()

  if (!existing) throw new Error('Archivo no encontrado')

  const file = formData.get('file') as File | null
  if (!file) throw new Error('No se recibió archivo')

  if (!ALLOWED_MEDIA_TYPES.includes(file.type as (typeof ALLOWED_MEDIA_TYPES)[number])) {
    throw new Error('Tipo no permitido')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Sobrescribir en el mismo path → misma URL pública
  const { error: upErr } = await admin.storage
    .from(existing.bucket || MEDIA_BUCKET)
    .upload(existing.path, buffer, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: true,
    })

  if (upErr) throw new Error('Error al reemplazar archivo')

  const width = formData.get('width') ? Number(formData.get('width')) : existing.width
  const height = formData.get('height') ? Number(formData.get('height')) : existing.height

  // Cache-bust en thumb si es imagen (query param en clientes; url base se mantiene)
  await supabase
    .from('media_assets')
    .update({
      mime_type: file.type,
      size_bytes: file.size,
      width,
      height,
      original_name: file.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  await logActivity(id, session.id, 'replace', file.name)
  revalidateMedia()
  revalidatePath('/')
  revalidatePath('/galeria')
  revalidatePath('/blog')
  return { url: existing.url, path: existing.path }
}

/* ───────────────────────────── DELETE ───────────────────────────── */

export async function deleteMediaAsset(id: string) {
  const session = await requirePermission('media:write')
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: asset } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single()

  if (!asset) throw new Error('No encontrado')

  if (asset.is_used && asset.usage_locations?.length > 0) {
    // Se permite eliminar pero el caller debe haber confirmado
  }

  try {
    await admin.storage.from(asset.bucket || MEDIA_BUCKET).remove([asset.path])
  } catch {
    // continuar
  }

  const { error } = await supabase.from('media_assets').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logActivity(null, session.id, 'delete', asset.name)
  revalidateMedia()
}

/* ───────────────────────────── FOLDERS ───────────────────────────── */

export async function listMediaFolders() {
  await requirePermission('media:read')
  const supabase = await createClient()
  const { data } = await supabase.from('media_folders').select('*').order('name')
  return data ?? []
}

export async function createMediaFolder(name: string, parentId?: string) {
  await requirePermission('media:write')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_folders')
    .insert({ name, parent_id: parentId || null })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidateMedia()
  return data
}

/* ───────────────────────────── USAGE ───────────────────────────── */

export async function markMediaUsage(
  assetId: string,
  location: string,
  used = true
) {
  await requirePermission('media:write')
  const supabase = await createClient()
  const { data: asset } = await supabase
    .from('media_assets')
    .select('usage_locations, is_used')
    .eq('id', assetId)
    .single()

  if (!asset) return

  let locations: string[] = asset.usage_locations || []
  if (used && !locations.includes(location)) {
    locations = [...locations, location]
  }
  if (!used) {
    locations = locations.filter((l) => l !== location)
  }

  await supabase
    .from('media_assets')
    .update({
      usage_locations: locations,
      is_used: locations.length > 0,
    })
    .eq('id', assetId)

  revalidateMedia()
}