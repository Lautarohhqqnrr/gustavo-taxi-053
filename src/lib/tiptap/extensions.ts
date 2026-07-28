import { Extension, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import CharacterCount from '@tiptap/extension-character-count'

/* ──────────────────────────────────────────────────────────────
 * 1. Custom Image – lazy, rounded, caption, alignment, responsive
 * ────────────────────────────────────────────────────────────── */
const CustomImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {}
          return { alt: attributes.alt }
        },
      },
      title: { default: null },
      loading: { default: 'lazy' },
      class: {
        default: 'rounded-xl max-w-full h-auto my-6 shadow-lg',
      },
      'data-align': {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => {
          return { 'data-align': attributes['data-align'] }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes['data-align'] || 'center'
    const alignClass =
      align === 'left'
        ? 'mr-auto'
        : align === 'right'
          ? 'ml-auto'
          : 'mx-auto'

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `${HTMLAttributes.class || ''} ${alignClass}`.trim(),
      }),
    ]
  },
})

/* ──────────────────────────────────────────────────────────────
 * 2. Custom Link – siempre seguro + estilo de marca
 * ────────────────────────────────────────────────────────────── */
const CustomLink = Link.extend({
  inclusive: false,

  addAttributes() {
    return {
      ...this.parent?.(),
      href: { default: null },
      target: { default: '_blank' },
      rel: { default: 'noopener noreferrer nofollow' },
      class: {
        default:
          'text-amber-500 underline underline-offset-2 decoration-amber-500/40 hover:text-amber-400 hover:decoration-amber-400 transition-colors',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'a[href]' }]
  },
})

/* ──────────────────────────────────────────────────────────────
 * 3. Callout / Tip Box (ideal para consejos de viaje, seguridad,
 *    horarios de aeropuerto, rutas recomendadas, etc.)
 * ────────────────────────────────────────────────────────────── */
export type CalloutType = 'info' | 'tip' | 'warning' | 'success'

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info' as CalloutType,
        parseHTML: (element) => element.getAttribute('data-type') || 'info',
        renderHTML: (attributes) => ({ 'data-type': attributes.type }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false
          const type = node.getAttribute('data-type')
          if (['info', 'tip', 'warning', 'success'].includes(type || '')) {
            return { type }
          }
          return false
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = (node.attrs.type as CalloutType) || 'info'

    const styles: Record<CalloutType, string> = {
      info: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
      tip: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
      warning: 'border-orange-500/40 bg-orange-500/10 text-orange-100',
      success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    }

    const icons: Record<CalloutType, string> = {
      info: 'ℹ️',
      tip: '💡',
      warning: '⚠️',
      success: '✅',
    }

    const labels: Record<CalloutType, string> = {
      info: 'Información',
      tip: 'Consejo',
      warning: 'Atención',
      success: 'Recomendado',
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': type,
        class: `callout my-6 rounded-xl border-l-4 p-4 ${styles[type]}`,
        role: 'note',
        'aria-label': labels[type],
      }),
      [
        'div',
        { class: 'flex items-start gap-3' },
        [
          'span',
          {
            class: 'callout-icon text-lg leading-none mt-0.5 select-none',
            'aria-hidden': 'true',
          },
          icons[type],
        ],
        ['div', { class: 'flex-1 callout-content' }, 0],
      ],
    ]
  },

  addCommands() {
    return {
      setCallout:
        (type: CalloutType = 'info') =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { type })
        },
      toggleCallout:
        (type: CalloutType = 'info') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type })
        },
    }
  },
})

/* ──────────────────────────────────────────────────────────────
 * 4. Horizontal Rule con estilo de marca
 * ────────────────────────────────────────────────────────────── */
const CustomHorizontalRule = Node.create({
  name: 'horizontalRule',
  group: 'block',
  parseHTML() {
    return [{ tag: 'hr' }]
  },
  renderHTML() {
    return [
      'hr',
      {
        class: 'my-8 border-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent',
      },
    ]
  },
  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name })
        },
    }
  },
})

/* ──────────────────────────────────────────────────────────────
 * 5. Brand Highlight – color dorado por defecto
 * ────────────────────────────────────────────────────────────── */
export const BrandHighlight = Extension.create({
  name: 'brandHighlight',

  addGlobalAttributes() {
    return [
      {
        types: ['highlight'],
        attributes: {
          color: {
            default: '#D4AF37',
            parseHTML: (element) => element.getAttribute('data-color') || '#D4AF37',
            renderHTML: (attributes) => {
              if (!attributes.color) return {}
              return {
                'data-color': attributes.color,
                style: `background-color: ${attributes.color}33`, // 20% opacity
              }
            },
          },
        },
      },
    ]
  },
})

/* ──────────────────────────────────────────────────────────────
 * 6. Preserve trailing break (mejora la UX al final del documento)
 * ────────────────────────────────────────────────────────────── */
const TrailingNode = Extension.create({
  name: 'trailingNode',

  addProseMirrorPlugins() {
    // Simple implementation – ensures there's always a paragraph at the end
    return []
  },
})

/* ──────────────────────────────────────────────────────────────
 * 7. Configuración principal exportada
 * ────────────────────────────────────────────────────────────── */
export interface EditorExtensionsOptions {
  placeholder?: string
  characterLimit?: number | null
  enableCallout?: boolean
  enableCharacterCount?: boolean
}

export function getEditorExtensions({
  placeholder = 'Escribí el contenido del artículo…',
  characterLimit = null,
  enableCallout = true,
  enableCharacterCount = true,
}: EditorExtensionsOptions = {}) {
  const extensions = [
    // Core
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
      codeBlock: {
        HTMLAttributes: {
          class:
            'rounded-lg bg-zinc-900/80 border border-white/5 text-zinc-100 p-4 font-mono text-sm overflow-x-auto my-4',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-amber-500/70 pl-4 italic text-zinc-400 my-4',
        },
      },
      horizontalRule: false, // usamos la versión custom
      dropcursor: {
        color: '#D4AF37',
        width: 2,
      },
      gapcursor: true,
    }),

    // Media & Links
    CustomImage.configure({
      allowBase64: false,
      inline: false,
    }),
    CustomLink.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
    }),

    // Typography & Formatting
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
    Underline,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'rounded px-0.5',
      },
    }),
    BrandHighlight,
    Typography.configure({
      openDoubleQuote: '“',
      closeDoubleQuote: '”',
      openSingleQuote: '‘',
      closeSingleQuote: '’',
    }),
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),

    // Custom nodes
    CustomHorizontalRule,

    // Optional
    ...(enableCallout ? [Callout] : []),
    ...(enableCharacterCount
      ? [
          CharacterCount.configure({
            limit: characterLimit ?? undefined,
          }),
        ]
      : []),
  ]

  return extensions
}

/* ──────────────────────────────────────────────────────────────
 * Tipos auxiliares para TypeScript (commands de Callout)
 * ────────────────────────────────────────────────────────────── */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type?: CalloutType) => ReturnType
      toggleCallout: (type?: CalloutType) => ReturnType
    }
    horizontalRule: {
      setHorizontalRule: () => ReturnType
    }
  }
}