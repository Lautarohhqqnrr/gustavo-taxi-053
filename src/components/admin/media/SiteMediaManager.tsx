'use client'

import { useCallback, useEffect, useState } from 'react'
import { setSiteMedia, getSiteMedia } from '@/actions/media'
import { ImageUploader, type UploadResult } from './ImageUploader'
import { SITE_MEDIA_SLOTS, STORAGE_BUCKETS, type SiteMediaSlot } from '@/lib/media/constants'
import { Check } from 'lucide-react'

type MediaRow = {
  slot: string
  url: string
  path: string
  alt: string
}

export function SiteMediaManager() {
  const [media, setMedia] = useState<Record<string, MediaRow>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSiteMedia()
      const map: Record<string, MediaRow> = {}
      if (Array.isArray(data)) {
        data.forEach((row: MediaRow) => {
          map[row.slot] = row
        })
      }
      setMedia(map)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (slot: SiteMediaSlot, result: UploadResult) => {
    setSaving(slot)
    setSaved(null)
    try {
      const config = SITE_MEDIA_SLOTS[slot]
      await setSiteMedia(slot, {
        url: result.url,
        path: result.path,
        alt: config.label,
        width: result.width,
        height: result.height,
        size: result.size,
      })
      setMedia((prev) => ({
        ...prev,
        [slot]: {
          slot,
          url: result.url,
          path: result.path,
          alt: config.label,
        },
      }))
      setSaved(slot)
      setTimeout(() => setSaved(null), 2500)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Cargando medios del sitio…</p>
  }

  const slots = Object.entries(SITE_MEDIA_SLOTS) as [SiteMediaSlot, (typeof SITE_MEDIA_SLOTS)[SiteMediaSlot]][]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Medios del sitio</h2>
        <p className="text-sm text-zinc-500">
          Hero, logo, favicon, foto de Gustavo y banners. Los cambios se reflejan automáticamente en la web.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {slots.map(([slot, config]) => (
          <div
            key={slot}
            className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">{config.label}</h3>
              {saved === slot && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Guardado
                </span>
              )}
              {saving === slot && (
                <span className="text-xs text-amber-400">Guardando…</span>
              )}
            </div>

            <ImageUploader
              bucket={STORAGE_BUCKETS.site}
              folder={config.folder}
              currentUrl={media[slot]?.url || null}
              onUploaded={(result) => handleUpload(slot, result)}
              aspectRatio={slot === 'logo' || slot === 'favicon' ? '1/1' : '16/9'}
              compact={slot === 'logo' || slot === 'favicon'}
              label={`Subir ${config.label.toLowerCase()}`}
            />

            {media[slot]?.url && (
              <p className="truncate text-[11px] text-zinc-600">{media[slot].url}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}