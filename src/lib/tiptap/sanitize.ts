import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'span',
  'div',
  'hr',
  'mark',
  'sub',
  'sup',
]

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'class',
  'style',
  'width',
  'height',
  'data-align',
  'data-type', // Callouts
  'role',
  'aria-label',
  'aria-hidden',
]

/**
 * Sanitiza el HTML generado por Tiptap para prevenir XSS
 * antes de guardarlo en la base de datos o renderizarlo.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false, // solo permitimos data-type y data-align explícitamente
    ADD_ATTR: ['target', 'data-type', 'data-align', 'role', 'aria-label', 'aria-hidden'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  })
}

/**
 * Verifica si el contenido del editor está realmente vacío
 * (ignora tags vacíos y espacios).
 */
export function isEditorEmpty(html: string): boolean {
  if (!html) return true
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  return text.length === 0
}