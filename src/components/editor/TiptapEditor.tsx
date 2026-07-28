'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { useCallback, useEffect, useRef } from 'react'
import { getEditorExtensions } from '@/lib/tiptap/extensions'
import { sanitizeHtml, isEditorEmpty } from '@/lib/tiptap/sanitize'
import { Toolbar } from './Toolbar'
import { cn } from '@/lib/utils'
import type { TiptapEditorProps, EditorContent as EditorContentType } from '@/types/editor'
import '@/styles/callouts.css'

export function TiptapEditor({
  content = '',
  onChange,
  placeholder = 'Escribí el contenido del artículo…',
  editable = true,
  className,
  minHeight = '280px',
  maxHeight = '600px',
  onImageUpload,
  characterLimit = 15000,
}: TiptapEditorProps) {
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: getEditorExtensions({
      placeholder,
      characterLimit,
      enableCallout: true,
      enableCharacterCount: true,
    }),
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert prose-amber max-w-none focus:outline-none',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:leading-relaxed prose-a:text-amber-500',
          'prose-img:rounded-lg prose-img:shadow-md',
          'px-4 py-3'
        ),
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!onChange) return

      isInternalUpdate.current = true

      const html = sanitizeHtml(editor.getHTML())
      const json = editor.getJSON()
      const text = editor.getText()

      onChange({
        html,
        json: json as Record<string, unknown>,
        text,
        isEmpty: isEditorEmpty(html),
      })

      // Reset flag after microtask
      queueMicrotask(() => {
        isInternalUpdate.current = false
      })
    },
  })

  // Sync external content changes (ej: al cargar un post existente)
  useEffect(() => {
    if (!editor || isInternalUpdate.current) return

    const currentHtml = editor.getHTML()
    if (content !== currentHtml) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!onImageUpload) {
        throw new Error('No se configuró el upload de imágenes')
      }
      return onImageUpload(file)
    },
    [onImageUpload]
  )

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60 shadow-xl',
        'focus-within:border-amber-500/40 focus-within:ring-1 focus-within:ring-amber-500/20',
        'transition-all duration-200',
        className
      )}
    >
      {editable && (
        <Toolbar
          editor={editor}
          onImageUpload={onImageUpload ? handleImageUpload : undefined}
          disabled={!editable}
        />
      )}

      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Contador de caracteres */}
      {editable && editor && characterLimit && (
        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-4 py-2 text-xs text-zinc-500">
          <span>
            {editor.storage.characterCount?.characters?.() ?? 0}
            {characterLimit ? ` / ${characterLimit}` : ''} caracteres
          </span>
          <span className="text-zinc-600">·</span>
          <span>
            {editor.storage.characterCount?.words?.() ?? 0} palabras
          </span>
        </div>
      )}

      {/* Estilos del placeholder + callouts */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #71717a;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror {
          min-height: ${minHeight};
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #d4af37;
          outline-offset: 2px;
        }

        /* Callout styles */
        .ProseMirror .callout {
          margin: 1.25rem 0;
        }
        .ProseMirror .callout p {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  )
}