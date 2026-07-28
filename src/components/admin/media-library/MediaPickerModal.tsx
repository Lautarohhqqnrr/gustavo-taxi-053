'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { MediaLibrary } from './MediaLibrary'
import type { MediaAsset } from '@/lib/media/library-constants'

/**
 * Modal "Seleccionar desde Biblioteca" para usar en Hero, Blog, Galería, etc.
 */
export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  acceptKind = 'image',
}: {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  acceptKind?: 'image' | 'video' | 'pdf' | 'all'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <h3 className="text-sm font-semibold text-zinc-100">
            Seleccionar desde Biblioteca
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <MediaLibrary
            selectionMode
            acceptKind={acceptKind}
            onSelect={(asset) => {
              onSelect(asset)
              onClose()
            }}
          />
        </div>
      </div>
    </div>
  )
}