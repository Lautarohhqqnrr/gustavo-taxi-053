'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  listMediaAssets,
  getMediaStats,
  uploadMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  replaceMediaAsset,
} from '@/actions/media-library'
import {
  MEDIA_CATEGORIES,
  formatBytes,
  getMediaKind,
  type MediaAsset,
  type MediaFilters,
} from '@/lib/media/library-constants'
import { compressImage, validateImageFile } from '@/lib/media/compress'
import { cn } from '@/lib/utils'
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  Copy,
  Download,
  Pencil,
  Star,
  RefreshCw,
  X,
  FileText,
  Film,
  ImageIcon,
  Check,
  Loader2,
  Filter,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'
type Stats = Awaited<ReturnType<typeof getMediaStats>>

export function MediaLibrary({
  selectionMode = false,
  onSelect,
  acceptKind,
}: {
  selectionMode?: boolean
  onSelect?: (asset: MediaAsset) => void
  acceptKind?: 'image' | 'video' | 'pdf' | 'all'
}) {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<MediaFilters['kind']>(acceptKind === 'all' || !acceptKind ? 'all' : acceptKind)
  const [category, setCategory] = useState('all')
  const [used, setUsed] = useState<MediaFilters['used']>('all')
  const [sort, setSort] = useState<MediaFilters['sort']>('newest')
  const [selected, setSelected] = useState<MediaAsset | null>(null)
  const [uploading, setUploading] = useState<
    { id: string; name: string; progress: number; status: 'uploading' | 'done' | 'error'; error?: string }[]
  >([])
  const [dragOver, setDragOver] = useState(false)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(
    async (pageNum = 1, append = false) => {
      setLoading(true)
      try {
        const res = await listMediaAssets({
          search: search || undefined,
          kind,
          category: category === 'all' ? undefined : category,
          used,
          sort,
          page: pageNum,
          pageSize: 24,
        })
        setItems((prev) => (append ? [...prev, ...res.items] : res.items))
        setTotal(res.total)
        setHasMore(res.hasMore)
        setPage(pageNum)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [search, kind, category, used, sort]
  )

  useEffect(() => {
    load(1, false)
    getMediaStats().then(setStats).catch(() => {})
  }, [load])

  const onSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      /* load se dispara por dependencia de search en el próximo efecto
         forzamos actualizando search state ya hecho */
    }, 300)
  }

  // Debounced reload on search
  useEffect(() => {
    const t = setTimeout(() => load(1, false), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const processFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    for (const file of list) {
      const localId = crypto.randomUUID()
      setUploading((u) => [
        ...u,
        { id: localId, name: file.name, progress: 5, status: 'uploading' },
      ])

      try {
        const formData = new FormData()
        let uploadFile: Blob | File = file
        let width: number | undefined
        let height: number | undefined

        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
          const validation = validateImageFile(file)
          if (!validation.ok) throw new Error(validation.error)
          setUploading((u) =>
            u.map((x) => (x.id === localId ? { ...x, progress: 25 } : x))
          )
          const compressed = await compressImage(file)
          uploadFile = compressed.large.blob
          width = compressed.large.width
          height = compressed.large.height
          formData.append(
            'file',
            uploadFile,
            file.name.replace(/\.[^.]+$/, '') + (uploadFile.type.includes('webp') ? '.webp' : '.jpg')
          )
        } else {
          formData.append('file', file)
        }

        if (width) formData.append('width', String(width))
        if (height) formData.append('height', String(height))
        formData.append('title', file.name.replace(/\.[^.]+$/, ''))
        if (category !== 'all') formData.append('category', category)

        setUploading((u) =>
          u.map((x) => (x.id === localId ? { ...x, progress: 60 } : x))
        )

        await uploadMediaAsset(formData)

        setUploading((u) =>
          u.map((x) =>
            x.id === localId ? { ...x, progress: 100, status: 'done' } : x
          )
        )
      } catch (e) {
        setUploading((u) =>
          u.map((x) =>
            x.id === localId
              ? {
                  ...x,
                  status: 'error',
                  error: e instanceof Error ? e.message : 'Error',
                }
              : x
          )
        )
      }
    }
    await load(1, false)
    getMediaStats().then(setStats).catch(() => {})
    setTimeout(() => {
      setUploading((u) => u.filter((x) => x.status === 'uploading'))
    }, 2500)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files)
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const handleDelete = (asset: MediaAsset) => {
    const usage =
      asset.usage_locations?.length > 0
        ? `\n\nEn uso en:\n- ${asset.usage_locations.join('\n- ')}`
        : '\n\nNo se detectó uso registrado en el sitio.'
    if (!confirm(`¿Eliminar «${asset.title || asset.name}»?${usage}`)) return
    startTransition(async () => {
      await deleteMediaAsset(asset.id)
      setSelected(null)
      await load(page, false)
      getMediaStats().then(setStats).catch(() => {})
    })
  }

  const handleReplace = async (asset: MediaAsset, file: File) => {
    const formData = new FormData()
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      const compressed = await compressImage(file)
      formData.append(
        'file',
        compressed.large.blob,
        file.name.replace(/\.[^.]+$/, '.webp')
      )
      formData.append('width', String(compressed.large.width))
      formData.append('height', String(compressed.large.height))
    } else {
      formData.append('file', file)
    }
    startTransition(async () => {
      await replaceMediaAsset(asset.id, formData)
      const updated = await listMediaAssets({ page: 1, pageSize: 1, search: asset.name })
      await load(page, false)
    })
  }

  const saveMeta = (asset: MediaAsset, patch: Parameters<typeof updateMediaAsset>[1]) => {
    startTransition(async () => {
      await updateMediaAsset(asset.id, patch)
      setItems((prev) =>
        prev.map((i) => (i.id === asset.id ? { ...i, ...patch } : i))
      )
      if (selected?.id === asset.id) {
        setSelected({ ...asset, ...patch } as MediaAsset)
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      {!selectionMode && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">📁 Biblioteca Multimedia</h2>
            <p className="text-sm text-zinc-500">
              Administrá todas las imágenes, videos y documentos del sitio
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
          >
            <Upload className="h-4 w-4" />
            Subir archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/webm,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
        </div>
      )}

      {/* Stats */}
      {stats && !selectionMode && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Archivos', value: stats.total },
            { label: 'Imágenes', value: stats.images },
            { label: 'Videos', value: stats.videos },
            { label: 'Sin usar', value: stats.unused },
            { label: 'Espacio', value: formatBytes(stats.usedBytes) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3"
            >
              <p className="text-lg font-bold text-amber-400">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, título, alt…"
            className="w-full rounded-lg border border-white/10 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as MediaFilters['kind'])}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          <option value="all">Todos</option>
          <option value="image">Imágenes</option>
          <option value="video">Videos</option>
          <option value="pdf">PDF</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          <option value="all">Categorías</option>
          {MEDIA_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={used}
          onChange={(e) => setUsed(e.target.value as MediaFilters['used'])}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          <option value="all">Uso</option>
          <option value="used">En uso</option>
          <option value="unused">Sin usar</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as MediaFilters['sort'])}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="name">Nombre</option>
          <option value="size_desc">Mayor tamaño</option>
          <option value="size_asc">Menor tamaño</option>
        </select>

        <div className="flex rounded-lg border border-white/10 p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={cn(
              'rounded-md p-1.5',
              view === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn(
              'rounded-md p-1.5',
              view === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragOver
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-white/10 bg-zinc-900/30'
        )}
      >
        <p className="text-sm text-zinc-500">
          Arrastrá archivos aquí o{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-amber-400 hover:underline"
          >
            seleccioná desde tu equipo
          </button>
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          JPG, PNG, WebP, AVIF, SVG, MP4, WEBM, PDF
        </p>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{u.name}</span>
              {u.status === 'uploading' && (
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              {u.status === 'done' && <Check className="h-4 w-4 text-emerald-400" />}
              {u.status === 'error' && (
                <span className="text-xs text-red-400">{u.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex gap-5">
        <div className="min-w-0 flex-1">
          {loading && items.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              No hay archivos. Subí el primero.
            </p>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    if (selectionMode && onSelect) onSelect(asset)
                    else setSelected(asset)
                  }}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border bg-zinc-900/50 text-left transition-all',
                    selected?.id === asset.id
                      ? 'border-amber-400 ring-1 ring-amber-400/30'
                      : 'border-white/5 hover:border-white/15'
                  )}
                >
                  <div className="relative aspect-square bg-zinc-950">
                    {getMediaKind(asset.mime_type) === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.thumb_url || asset.url}
                        alt={asset.alt_text || asset.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : getMediaKind(asset.mime_type) === 'video' ? (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        <Film className="h-10 w-10" />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">
                        <FileText className="h-10 w-10" />
                      </div>
                    )}
                    {asset.is_featured && (
                      <Star className="absolute right-2 top-2 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                    {!asset.is_used && (
                      <span className="absolute left-2 top-2 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[9px] text-zinc-400">
                        Sin uso
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {asset.title || asset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {formatBytes(asset.size_bytes)}
                      {asset.width && asset.height
                        ? ` · ${asset.width}×${asset.height}`
                        : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                    <th className="px-3 py-2">Archivo</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Tamaño</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => {
                        if (selectionMode && onSelect) onSelect(asset)
                        else setSelected(asset)
                      }}
                      className={cn(
                        'cursor-pointer border-b border-white/5 hover:bg-white/[0.02]',
                        selected?.id === asset.id && 'bg-amber-500/5'
                      )}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 overflow-hidden rounded-md bg-zinc-900">
                            {getMediaKind(asset.mime_type) === 'image' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={asset.thumb_url || asset.url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <span className="truncate text-zinc-200">
                            {asset.title || asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-500">
                        {asset.extension.toUpperCase()}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-500">
                        {formatBytes(asset.size_bytes)}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-500">{asset.category}</td>
                      <td className="px-3 py-2 text-xs text-zinc-500">
                        {new Date(asset.created_at).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => load(page + 1, true)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                {loading ? 'Cargando…' : 'Cargar más'}
              </button>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-zinc-600">
            {total} archivo{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Detail panel */}
        {selected && !selectionMode && (
          <aside className="hidden w-80 shrink-0 space-y-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 lg:block">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Detalles</h3>
              <button type="button" onClick={() => setSelected(null)}>
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg bg-zinc-950">
              {getMediaKind(selected.mime_type) === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.url}
                  alt={selected.alt_text}
                  className="h-full w-full object-contain"
                />
              ) : getMediaKind(selected.mime_type) === 'video' ? (
                <video src={selected.url} controls className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">
                  <FileText className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <Field
                label="Título"
                value={selected.title}
                onSave={(v) => saveMeta(selected, { title: v })}
              />
              <Field
                label="ALT"
                value={selected.alt_text}
                onSave={(v) => saveMeta(selected, { alt_text: v })}
              />
              <Field
                label="Descripción"
                value={selected.description}
                onSave={(v) => saveMeta(selected, { description: v })}
                multiline
              />
              <div>
                <label className="mb-1 block text-zinc-500">Categoría</label>
                <select
                  value={selected.category}
                  onChange={(e) =>
                    saveMeta(selected, { category: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-zinc-200"
                >
                  {MEDIA_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Etiquetas (coma)"
                value={(selected.tags || []).join(', ')}
                onSave={(v) =>
                  saveMeta(selected, {
                    tags: v
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <div className="space-y-1 border-t border-white/5 pt-3 text-[11px] text-zinc-500">
              <p>
                <span className="text-zinc-400">Archivo:</span> {selected.name}
              </p>
              <p>
                <span className="text-zinc-400">Tipo:</span> {selected.mime_type}
              </p>
              <p>
                <span className="text-zinc-400">Tamaño:</span>{' '}
                {formatBytes(selected.size_bytes)}
              </p>
              {selected.width && selected.height && (
                <p>
                  <span className="text-zinc-400">Resolución:</span>{' '}
                  {selected.width}×{selected.height}
                </p>
              )}
              <p>
                <span className="text-zinc-400">Subido:</span>{' '}
                {new Date(selected.created_at).toLocaleString('es-AR')}
              </p>
              <p>
                <span className="text-zinc-400">Estado:</span>{' '}
                {selected.is_used ? 'En uso' : 'Sin usar'}
              </p>
              {selected.usage_locations?.length > 0 && (
                <p>
                  <span className="text-zinc-400">Usado en:</span>{' '}
                  {selected.usage_locations.join(', ')}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
              <ActionBtn
                icon={Copy}
                label="Copiar URL"
                onClick={() => copyUrl(selected.url)}
              />
              <ActionBtn
                icon={Download}
                label="Descargar"
                onClick={() => window.open(selected.url, '_blank')}
              />
              <ActionBtn
                icon={Star}
                label={selected.is_featured ? 'Quitar destacado' : 'Destacar'}
                onClick={() =>
                  saveMeta(selected, { is_featured: !selected.is_featured })
                }
              />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5">
                <RefreshCw className="h-3 w-3" />
                Reemplazar
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/webm,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleReplace(selected, f)
                  }}
                />
              </label>
              <ActionBtn
                icon={Trash2}
                label="Eliminar"
                danger
                onClick={() => handleDelete(selected)}
              />
            </div>

            {pending && (
              <p className="text-center text-xs text-amber-400">Guardando…</p>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string
  value: string
  onSave: (v: string) => void
  multiline?: boolean
}) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])

  return (
    <div>
      <label className="mb-1 block text-zinc-500">{label}</label>
      {multiline ? (
        <textarea
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => v !== value && onSave(v)}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-zinc-200"
        />
      ) : (
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => v !== value && onSave(v)}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-2 py-1.5 text-zinc-200"
        />
      )}
    </div>
  )
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px]',
        danger
          ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
          : 'border-white/10 text-zinc-300 hover:bg-white/5'
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  )
}