import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

/**
 * Wrapper de next/image con defaults premium:
 * - Lazy loading (salvo priority)
 * - formats AVIF/WebP gestionados por Next.js
 * - placeholder blur opcional vía CSS
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
}: OptimizedImageProps) {
  if (!src) {
    return (
      <div
        className={cn('flex items-center justify-center bg-zinc-900 text-zinc-600', className)}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-xs">Sin imagen</span>
      </div>
    )
  }

  // next/image requiere width/height o fill
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        priority={priority}
        sizes={sizes}
        quality={quality}
        loading={priority ? undefined : 'lazy'}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      loading={priority ? undefined : 'lazy'}
    />
  )
}