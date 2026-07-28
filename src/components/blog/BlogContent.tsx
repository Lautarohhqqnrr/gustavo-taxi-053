import { sanitizeHtml } from '@/lib/tiptap/sanitize'
import { cn } from '@/lib/utils'
import '@/styles/callouts.css'

interface BlogContentProps {
  html: string
  className?: string
}

/**
 * Renderiza el HTML generado por Tiptap de forma segura.
 * Incluye estilos premium para Callouts, imágenes, blockquotes, etc.
 *
 * Uso:
 *   <BlogContent html={post.contentHtml} />
 */
export function BlogContent({ html, className }: BlogContentProps) {
  const safeHtml = sanitizeHtml(html)

  if (!safeHtml) {
    return (
      <p className="text-zinc-500 italic">Este artículo no tiene contenido.</p>
    )
  }

  return (
    <div
      className={cn(
        // Tipografía base
        'prose prose-invert prose-amber max-w-none',
        // Headings
        'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-50',
        'prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4',
        'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3',
        'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2',
        'prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2',
        // Párrafos y listas
        'prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:my-4',
        'prose-ul:my-4 prose-ol:my-4',
        'prose-li:text-zinc-300 prose-li:my-1',
        'prose-li:marker:text-amber-500/70',
        // Enlaces
        'prose-a:text-amber-500 prose-a:underline prose-a:underline-offset-2',
        'prose-a:decoration-amber-500/40 hover:prose-a:text-amber-400',
        'hover:prose-a:decoration-amber-400 transition-colors',
        // Imágenes
        'prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8',
        'prose-img:mx-auto',
        // Blockquote
        'prose-blockquote:border-l-4 prose-blockquote:border-amber-500/70',
        'prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-400',
        'prose-blockquote:my-6',
        // Código
        'prose-code:rounded prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5',
        'prose-code:text-amber-200 prose-code:text-sm prose-code:font-medium',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:rounded-xl prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-white/5',
        'prose-pre:p-4 prose-pre:overflow-x-auto',
        // HR
        'prose-hr:border-0 prose-hr:h-px',
        'prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-amber-500/40 prose-hr:to-transparent',
        'prose-hr:my-10',
        // Strong / em
        'prose-strong:text-zinc-100 prose-strong:font-semibold',
        'prose-em:text-zinc-300',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}