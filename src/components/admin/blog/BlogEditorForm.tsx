'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TiptapEditor } from '@/components/editor'
import { BlogContent } from '@/components/blog/BlogContent'
import { uploadImageFromClient } from '@/lib/tiptap/upload-image'
import type { EditorContent } from '@/types/editor'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const blogSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(120),
  slug: z
    .string()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo minúsculas, números y guiones)'),
  excerpt: z.string().min(20, 'La descripción corta debe tener al menos 20 caracteres').max(300),
  category: z.string().min(1, 'Seleccioná una categoría'),
  coverImage: z.string().url().optional().or(z.literal('')),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  published: z.boolean().default(false),
})

type BlogFormValues = z.infer<typeof blogSchema>

interface BlogEditorFormProps {
  initialData?: Partial<BlogFormValues> & { contentHtml?: string }
  onSubmit: (data: BlogFormValues & { contentHtml: string; contentJson: Record<string, unknown> | null }) => Promise<void>
  isEditing?: boolean
}

const CATEGORIES = [
  'Turismo',
  'Consejos de viaje',
  'Noticias',
  'Destinos',
  'Experiencias',
  'Seguridad',
]

export function BlogEditorForm({ initialData, onSubmit, isEditing = false }: BlogEditorFormProps) {
  const [content, setContent] = useState<EditorContent>({
    html: initialData?.contentHtml || '',
    json: null,
    text: '',
    isEmpty: !initialData?.contentHtml,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      category: initialData?.category || '',
      coverImage: initialData?.coverImage || '',
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      published: initialData?.published ?? false,
    },
  })

  const titleValue = watch('title')

  // Auto-generar slug desde el título
  const handleTitleBlur = useCallback(() => {
    const currentSlug = watch('slug')
    if (!currentSlug && titleValue) {
      const generated = titleValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setValue('slug', generated, { shouldValidate: true })
    }
  }, [titleValue, setValue, watch])

  const handleImageUpload = useCallback(async (file: File) => {
    return uploadImageFromClient(file)
  }, [])

  const onFormSubmit = async (data: BlogFormValues) => {
    if (content.isEmpty) {
      alert('El contenido del artículo no puede estar vacío')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        contentHtml: content.html,
        contentJson: content.json,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Header de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {isEditing ? 'Editar publicación' : 'Nueva publicación'}
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Editar' : 'Vista previa'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black',
              'hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
              'disabled:opacity-60 disabled:pointer-events-none transition-colors'
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? 'Guardando…' : isEditing ? 'Actualizar' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Título
            </label>
            <input
              id="title"
              {...register('title')}
              onBlur={handleTitleBlur}
              placeholder="Ej: Cómo llegar al Lago Futalaufquen desde Esquel"
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-3 text-lg text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Editor / Preview */}
          {previewMode ? (
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-6">
              <BlogContent html={content.html} />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Contenido
              </label>
              <TiptapEditor
                content={content.html}
                onChange={setContent}
                onImageUpload={handleImageUpload}
                placeholder="Escribí el contenido del artículo. Podés usar títulos, listas, imágenes, enlaces…"
                minHeight="360px"
                maxHeight="700px"
              />
              {content.isEmpty && (
                <p className="mt-1 text-sm text-amber-500/80">
                  El contenido es obligatorio
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publicación */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Publicación
            </h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('published')}
                className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-amber-500 focus:ring-amber-500/40"
              />
              <span className="text-sm text-zinc-200">Publicar inmediatamente</span>
            </label>
          </div>

          {/* Categoría y Slug */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Organización
            </h3>

            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm text-zinc-300">
                Categoría
              </label>
              <select
                id="category"
                {...register('category')}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
              >
                <option value="">Seleccionar…</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="mb-1.5 block text-sm text-zinc-300">
                Slug (URL)
              </label>
              <input
                id="slug"
                {...register('slug')}
                placeholder="como-llegar-al-lago-futalaufquen"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Descripción corta
            </label>
            <textarea
              id="excerpt"
              {...register('excerpt')}
              rows={3}
              placeholder="Resumen que aparece en las tarjetas del blog y en SEO…"
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-400">{errors.excerpt.message}</p>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              SEO
            </h3>

            <div>
              <label htmlFor="seoTitle" className="mb-1.5 block text-sm text-zinc-300">
                Título SEO (opcional)
              </label>
              <input
                id="seoTitle"
                {...register('seoTitle')}
                placeholder="Máx. 70 caracteres"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="seoDescription" className="mb-1.5 block text-sm text-zinc-300">
                Meta descripción (opcional)
              </label>
              <textarea
                id="seoDescription"
                {...register('seoDescription')}
                rows={2}
                placeholder="Máx. 160 caracteres"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}