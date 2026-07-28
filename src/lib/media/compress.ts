/**
 * Compresión y generación de variantes de imagen en el cliente
 * (Canvas API). Produce WebP cuando el navegador lo soporta.
 */

import { WEBP_QUALITY, IMAGE_SIZES, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from './constants'

export type CompressedVariant = {
  blob: Blob
  width: number
  height: number
  size: number
  mimeType: string
}

export type CompressionResult = {
  original: CompressedVariant
  large: CompressedVariant
  medium: CompressedVariant
  small: CompressedVariant
  thumb: CompressedVariant
}

function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

function resizeToBlob(
  img: HTMLImageElement,
  maxWidth: number,
  quality: number,
  mimeType: string
): Promise<CompressedVariant> {
  return new Promise((resolve, reject) => {
    const ratio = Math.min(1, maxWidth / img.naturalWidth)
    const width = Math.round(img.naturalWidth * ratio)
    const height = Math.round(img.naturalHeight * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas no disponible'))
      return
    }

    ctx.drawImage(img, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Error al comprimir la imagen'))
          return
        }
        resolve({
          blob,
          width,
          height,
          size: blob.size,
          mimeType: blob.type || mimeType,
        })
      },
      mimeType,
      quality
    )
  })
}

/**
 * Valida el archivo antes de procesarlo.
 */
export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      ok: false,
      error: 'Formato no permitido. Solo JPG, PNG, WebP o AVIF.',
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: `La imagen supera el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
    }
  }
  // Nombre sospechoso
  if (/\.(php|exe|js|html|svg|shtml)$/i.test(file.name)) {
    return { ok: false, error: 'Nombre de archivo no permitido.' }
  }
  return { ok: true }
}

/**
 * Comprime la imagen y genera 5 variantes (original limitado, large, medium, small, thumb).
 * Prefiere WebP si el navegador lo soporta.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const validation = validateImageFile(file)
  if (!validation.ok) {
    throw new Error(validation.error)
  }

  const img = await loadImage(file)
  const useWebP = supportsWebP()
  const mimeType = useWebP ? 'image/webp' : 'image/jpeg'
  const quality = useWebP ? WEBP_QUALITY : 0.88

  const [original, large, medium, small, thumb] = await Promise.all([
    resizeToBlob(img, IMAGE_SIZES.original, quality, mimeType),
    resizeToBlob(img, IMAGE_SIZES.large, quality, mimeType),
    resizeToBlob(img, IMAGE_SIZES.medium, quality, mimeType),
    resizeToBlob(img, IMAGE_SIZES.small, quality, mimeType),
    resizeToBlob(img, IMAGE_SIZES.thumb, quality, mimeType),
  ])

  return { original, large, medium, small, thumb }
}

/**
 * Genera una URL de vista previa local (object URL).
 * Recordá llamar URL.revokeObjectURL cuando ya no se necesite.
 */
export function createPreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file)
}