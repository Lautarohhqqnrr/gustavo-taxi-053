'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGallery,
  getGalleryItems,
} from '@/actions/media'
import { ImageUploader, type UploadResult } from './ImageUploader'
import { GALLERY_CATEGORIES, STORAGE_BUCKETS, type GalleryCategory } from '@/lib/media/constants'
import { cn } from '@/lib/utils'

type GalleryItem = {
  id: string
  url: string
  path: string
  title: string
  description: string
  category: string
  alt: string
  order_index: number
  is_active: boolean
}

function SortableCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: GalleryItem
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
  onToggle: (id: string, active: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60',
        !item.is_active && 'opacity-50'
      )}
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt || item.title} className="h-full w-full object-cover" loading="lazy" />
        <button
          type="button"
          className="absolute left-2 top-2 cursor-grab rounded-md bg-black/50 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-amber-400 backdrop-blur-sm">
          {item.category}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-zinc-100">{item.title || 'Sin título'}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{item.description}</p>
        )}
        <div className="mt-2 flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggle(item.id, !item.is_active)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            title={item.is_active ? 'Ocultar' : 'Mostrar'}
          >
            {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GalleryCategory>('Vehículo')
  const [uploaded, setUploaded] = useState<UploadResult | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGalleryItems()
      setItems(data as GalleryItem[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('Vehículo')
    setUploaded(null)
    setEditing(null)
    setShowForm(false)
  }

  const openEdit = (item: GalleryItem) => {
    setEditing(item)
    setTitle(item.title)
    setDescription(item.description)
    setCategory(item.category as GalleryCategory)
    setUploaded({ url: item.url, path: item.path })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!uploaded) return
    setSaving(true)
    try {
      if (editing) {
        await updateGalleryItem(editing.id, {
          title,
          description,
          category,
          alt: title,
          url: uploaded.url,
          path: uploaded.path,
        })
      } else {
        await createGalleryItem({
          url: uploaded.url,
          path: uploaded.path,
          title,
          description,
          category,
          alt: title,
        })
      }
      resetForm()
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return
    await deleteGalleryItem(id)
    await load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    await updateGalleryItem(id, { is_active: active })
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: active } : i)))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    await reorderGallery(reordered.map((i) => i.id))
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Galería</h2>
          <p className="text-sm text-zinc-500">{items.length} imágenes</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" /> Nueva imagen
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            filter === 'all' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
          )}
        >
          Todas
        </button>
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filter === cat ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Formulario de alta/edición */}
      {showForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            {editing ? 'Editar imagen' : 'Subir nueva imagen'}
          </h3>

          <ImageUploader
            bucket={STORAGE_BUCKETS.gallery}
            folder="gallery"
            currentUrl={editing?.url}
            onUploaded={setUploaded}
            onRemove={() => setUploaded(null)}
            label="Arrastrá o seleccioná la imagen de la galería"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
                placeholder="Ej: Vehículo en ruta a Bariloche"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
              >
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none resize-none"
              placeholder="Descripción opcional…"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!uploaded || saving}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Guardar en galería'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid con drag & drop */}
      {loading ? (
        <p className="text-sm text-zinc-500">Cargando galería…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay imágenes{filter !== 'all' ? ` en «${filter}»` : ''}.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}