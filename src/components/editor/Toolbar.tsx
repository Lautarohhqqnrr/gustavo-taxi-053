'use client'

import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  RemoveFormatting,
  Pilcrow,
  Minus,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { CalloutType } from '@/lib/tiptap/extensions'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  editor: Editor | null
  onImageUpload?: (file: File) => Promise<{ url: string }>
  disabled?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150',
        'hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
        'disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'bg-amber-500/20 text-amber-400 shadow-sm'
          : 'text-zinc-400 hover:text-zinc-100'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
}

export function Toolbar({ editor, onImageUpload, disabled = false }: ToolbarProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsLinkModalOpen(false)
      return
    }

    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setIsLinkModalOpen(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const handleImageClick = useCallback(() => {
    if (!onImageUpload || !editor) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      try {
        const { url } = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        console.error('Error subiendo imagen:', error)
      }
    }
    input.click()
  }, [editor, onImageUpload])

  if (!editor) return null

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-white/10 bg-zinc-950/80 px-2 py-1.5 backdrop-blur-md">
      {/* Historial */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        title="Deshacer (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        title="Rehacer (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Formato de texto */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled}
        title="Negrita (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled}
        title="Cursiva (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={disabled}
        title="Subrayado (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={disabled}
        title="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        disabled={disabled}
        title="Resaltar"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        disabled={disabled}
        title="Código inline"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Encabezados */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        disabled={disabled}
        title="Título 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        title="Título 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        title="Título 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive('paragraph')}
        disabled={disabled}
        title="Párrafo"
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Listas y citas */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
        title="Lista con viñetas"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        disabled={disabled}
        title="Cita"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Alineación */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        disabled={disabled}
        title="Alinear izquierda"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        disabled={disabled}
        title="Centrar"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        disabled={disabled}
        title="Alinear derecha"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        disabled={disabled}
        title="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Link e Imagen */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            setLinkUrl(previousUrl || '')
            setIsLinkModalOpen((v) => !v)
          }}
          isActive={editor.isActive('link')}
          disabled={disabled}
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {isLinkModalOpen && (
          <div className="absolute left-0 top-10 z-50 flex w-72 items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 p-2 shadow-xl">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setLink()
                }
                if (e.key === 'Escape') {
                  setIsLinkModalOpen(false)
                }
              }}
              placeholder="https://ejemplo.com"
              className="flex-1 rounded-md border border-white/10 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={setLink}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400"
            >
              OK
            </button>
          </div>
        )}
      </div>

      <ToolbarButton
        onClick={handleImageClick}
        disabled={disabled || !onImageUpload}
        title="Insertar imagen"
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
        title="Línea horizontal"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Callouts – ideales para consejos de viaje */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCallout('info').run()}
        isActive={editor.isActive('callout', { type: 'info' })}
        disabled={disabled}
        title="Callout Información"
      >
        <Info className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCallout('tip').run()}
        isActive={editor.isActive('callout', { type: 'tip' })}
        disabled={disabled}
        title="Callout Consejo / Tip"
      >
        <Lightbulb className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCallout('warning').run()}
        isActive={editor.isActive('callout', { type: 'warning' })}
        disabled={disabled}
        title="Callout Advertencia"
      >
        <AlertTriangle className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCallout('success').run()}
        isActive={editor.isActive('callout', { type: 'success' })}
        disabled={disabled}
        title="Callout Éxito / Recomendado"
      >
        <CheckCircle2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Limpiar formato */}
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        disabled={disabled}
        title="Limpiar formato"
      >
        <RemoveFormatting className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}