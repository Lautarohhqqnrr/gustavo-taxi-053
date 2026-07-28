/**
 * Utilidades para el renderizado de Callouts en el lado del servidor / cliente.
 * El HTML ya viene con las clases y data-type desde Tiptap.
 * Este archivo documenta la estructura esperada y ofrece helpers opcionales.
 */

export type CalloutType = 'info' | 'tip' | 'warning' | 'success'

export const CALLOUT_CONFIG: Record<
  CalloutType,
  { label: string; icon: string; border: string; bg: string; text: string }
> = {
  info: {
    label: 'Información',
    icon: 'ℹ️',
    border: 'border-sky-500',
    bg: 'bg-sky-500/10',
    text: 'text-sky-100',
  },
  tip: {
    label: 'Consejo',
    icon: '💡',
    border: 'border-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-100',
  },
  warning: {
    label: 'Atención',
    icon: '⚠️',
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-100',
  },
  success: {
    label: 'Recomendado',
    icon: '✅',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-100',
  },
}

/**
 * Estructura HTML que genera el Node Callout de Tiptap:
 *
 * <div data-type="tip" class="callout my-6 rounded-xl border-l-4 p-4 border-amber-500/40 bg-amber-500/10 text-amber-100">
 *   <div class="flex items-start gap-3">
 *     <span class="text-lg leading-none mt-0.5 select-none">💡</span>
 *     <div class="flex-1 callout-content">
 *       <p>Contenido del consejo...</p>
 *     </div>
 *   </div>
 * </div>
 *
 * Los estilos visuales se aplican desde src/styles/callouts.css
 * usando el atributo [data-type].
 */

/**
 * Verifica si un string HTML contiene callouts.
 */
export function hasCallouts(html: string): boolean {
  return /data-type=["'](info|tip|warning|success)["']/.test(html)
}

/**
 * Extrae los tipos de callout presentes en un HTML (útil para analytics o preview).
 */
export function extractCalloutTypes(html: string): CalloutType[] {
  const matches = html.matchAll(/data-type=["'](info|tip|warning|success)["']/g)
  const types = new Set<CalloutType>()
  for (const match of matches) {
    types.add(match[1] as CalloutType)
  }
  return Array.from(types)
}