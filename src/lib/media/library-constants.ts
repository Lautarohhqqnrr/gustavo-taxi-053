export const MEDIA_BUCKET = 'media'

export const MEDIA_CATEGORIES = [
  'Sin categoría',
  'Vehículo',
  'Hero',
  'Servicios',
  'Galería',
  'Recorridos',
  'Blog',
  'Promociones',
  'Logo',
  'Iconos',
  'Conductores',
  'Turismo',
  'Clientes',
  'Videos',
  'Documentos',
] as const

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number]

export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
] as const

export const ALLOWED_MEDIA_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'mp4', 'webm', 'pdf',
] as const

/** 20 MB para video/PDF, 5 MB para imágenes (validación adicional en action) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024
export const MAX_PDF_SIZE = 20 * 1024 * 1024

export type MediaKind = 'image' | 'video' | 'pdf' | 'other'

export function getMediaKind(mime: string): MediaKind {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'pdf'
  return 'other'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export type MediaAsset = {
  id: string
  name: string
  original_name: string
  path: string
  url: string
  bucket: string
  mime_type: string
  extension: string
  size_bytes: number
  width: number | null
  height: number | null
  duration_seconds: number | null
  title: string
  alt_text: string
  description: string
  category: string
  tags: string[]
  folder_id: string | null
  is_featured: boolean
  is_used: boolean
  usage_locations: string[]
  uploaded_by: string | null
  thumb_url: string | null
  created_at: string
  updated_at: string
}

export type MediaFilters = {
  search?: string
  kind?: MediaKind | 'all'
  category?: string
  tag?: string
  used?: 'all' | 'used' | 'unused'
  sort?: 'newest' | 'oldest' | 'name' | 'size_desc' | 'size_asc'
  folderId?: string | null
  page?: number
  pageSize?: number
}