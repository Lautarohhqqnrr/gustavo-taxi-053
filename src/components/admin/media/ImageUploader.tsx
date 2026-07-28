'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Check, Loader2, ImageIcon, RefreshCw } from 'lucide-react'
import { compressImage, createPreviewUrl, validateImageFile } from '@/lib/media/compress'
import { uploadToStorage } from '@/actions/media'
import { cn } from '@/lib/utils'

export type UploadResult = {
  url: string
  path: string
  width?: number
  height?: number
  size?: number
}

interface ImageUploaderProps {
  /** Bucket de Supabase Storage */
  bucket: string
  /** Carpeta dentro del bucket */
  folder?: string
  /** URL actual (para modo reemplazo) */
  currentUrl?: string | null
  /** Callback al completar la subida */
  onUploaded: (result: UploadResult) => void
  /** Callback al eliminar */
  onRemove?: () => void
  /** Aspect ratio de la vista previa (ej: "16/9") */
  aspectRatio?: string
  /** Texto de ayuda */
  label?: string
  className?: string
  /** Tamaño máximo visual del dropzone */
  compact?: boolean
}

type Status = 'idle' | 'preview' | 'compressing' | 'uploading' | 'done' | 'error'

export function ImageUploader({
  bucket,
  folder = 'uploads',
  currentUrl,
  onUploaded,
  onRemove,
  aspectRatio = '16/9',
  label = 'Arrastrá una imagen o hacé clic para seleccionar',
  className,
  compact = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>(currentUrl ? 'done' : 'idle')
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const reset = useCallback(() => {
    setStatus(currentUrl ? 'done' : 'idle')
    setPreview(currentUrl || null)
    setProgress(0)
    setError(null)
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }, [currentUrl])

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      const validation = validateImageFile(file)
      if (!validation.ok) {
        setError(validation.error)
        setStatus('error')
        return
      }

      setFileName(file.name)
      const previewUrl = createPreviewUrl(file)
      setPreview(previewUrl)
      setStatus('preview')

      try {
        // Comprimir
        setStatus('compressing')
        setProgress(15)
        const compressed = await compressImage(file)
        setProgress(40)

        // Subir la versión large (buena calidad + tamaño razonable)
        setStatus('uploading')
        const formData = new FormData()
        const uploadBlob = compressed.large.blob
        const ext = uploadBlob.type.includes('webp') ? 'webp' : 'jpg'
        formData.append('file', uploadBlob, `${file.name.replace(/\.[^.]+$/, '')}.${ext}`)
        formData.append('bucket', bucket)
        formData.append('folder', folder)
        formData.append('width', String(compressed.large.width))
        formData.append('height', String(compressed.large.height))

        // Simular progreso mientras sube
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 8, 90))
        }, 200)

        const result = await uploadToStorage(formData)
        clearInterval(progressInterval)
        setProgress(100)
        setStatus('done')

        // Limpiar preview local y usar URL pública
        URL.revokeObjectURL(previewUrl)
        setPreview(result.url)

        onUploaded(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir la imagen')
        setStatus('error')
        setProgress(0)
      }
    },
    [bucket, folder, onUploaded]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const onSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    setStatus('idle')
    setProgress(0)
    setFileName('')
    onRemove?.()
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Dropzone / Preview */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => status !== 'uploading' && status !== 'compressing' && inputRef.current?.click()}
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all',
          dragOver
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-white/10 bg-zinc-950/40 hover:border-white/20',
          compact ? 'min-h-[120px]' : 'min-h-[180px]',
          (status === 'uploading' || status === 'compressing') && 'pointer-events-none'
        )}
        style={{ aspectRatio: preview ? undefined : aspectRatio }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onSelect}
        />

        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa"
              className="w-full object-cover"
              style={{ maxHeight: compact ? 160 : 280 }}
            />
            {/* Overlay de estado */}
            {(status === 'compressing' || status === 'uploading') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-amber-400" />
                <span className="text-sm text-zinc-200">
                  {status === 'compressing' ? 'Optimizando…' : 'Subiendo…'}
                </span>
                <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="mt-1 text-xs text-zinc-400">{progress}%</span>
              </div>
            )}
            {status === 'done' && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
                <Check className="h-3 w-3" /> Subida
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <ImageIcon className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="text-xs text-zinc-600">JPG, PNG, WebP o AVIF · máx. 5 MB</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      {(preview || status === 'error') && (
        <div className="flex flex-wrap items-center gap-2">
          {fileName && (
            <span className="truncate text-xs text-zinc-500 max-w-[180px]">{fileName}</span>
          )}
          <div className="ml-auto flex gap-2">
            {status === 'done' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
              >
                <RefreshCw className="h-3 w-3" /> Reemplazar
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3 w-3" /> Eliminar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}