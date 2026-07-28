export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const

/** Tamaño máximo por archivo: 5 MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/** Calidad de compresión WebP (0–1) */
export const WEBP_QUALITY = 0.82

/** Anchos de las versiones generadas */
export const IMAGE_SIZES = {
  thumb: 200,
  small: 400,
  medium: 800,
  large: 1600,
  original: 2400,
} as const

export const GALLERY_CATEGORIES = [
  'Vehículo',
  'Turismo',
  'Viajes',
  'Clientes',
  'Paisajes',
  'Promociones',
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

/** Slots de medios del sitio (1 imagen por slot) */
export const SITE_MEDIA_SLOTS = {
  hero: { label: 'Imagen Hero (inicio)', bucket: 'site', folder: 'hero' },
  logo: { label: 'Logo', bucket: 'site', folder: 'brand' },
  favicon: { label: 'Favicon', bucket: 'site', folder: 'brand' },
  about_photo: { label: 'Foto de Gustavo', bucket: 'site', folder: 'about' },
  banner_home: { label: 'Banner Home', bucket: 'site', folder: 'banners' },
  banner_services: { label: 'Banner Servicios', bucket: 'site', folder: 'banners' },
  banner_routes: { label: 'Banner Recorridos', bucket: 'site', folder: 'banners' },
} as const

export type SiteMediaSlot = keyof typeof SITE_MEDIA_SLOTS

export const STORAGE_BUCKETS = {
  site: 'site',
  gallery: 'gallery',
  blog: 'blog',
} as const