'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@/lib/validations/contact'
import { submitContactForm } from '@/actions/contact'
import { trackEvent } from '@/lib/analytics'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ContactForm() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null)
    const result = await submitContactForm(data)
    if (result.success) {
      trackEvent('form_submit')
      setDone(true)
    } else {
      setServerError(result.error)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-400" />
        <h3 className="mb-2 text-xl font-semibold text-zinc-100">¡Consulta enviada!</h3>
        <p className="max-w-sm text-sm text-zinc-400">
          Te responderemos a la brevedad por WhatsApp o teléfono.
        </p>
      </div>
    )
  }

  const field =
    'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Nombre</label>
          <input {...register('name')} className={field} placeholder="Tu nombre" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Teléfono</label>
          <input {...register('phone')} className={field} placeholder="+54 9 …" />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Origen</label>
          <input {...register('origin')} className={field} placeholder="Ej: Esquel centro" />
          {errors.origin && <p className="mt-1 text-xs text-red-400">{errors.origin.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Destino</label>
          <input {...register('destination')} className={field} placeholder="Ej: Aeropuerto" />
          {errors.destination && (
            <p className="mt-1 text-xs text-red-400">{errors.destination.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Fecha (opcional)</label>
          <input type="date" {...register('preferred_date')} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Hora (opcional)</label>
          <input type="time" {...register('preferred_time')} className={field} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">
          Mensaje (opcional)
        </label>
        <textarea
          {...register('message')}
          rows={3}
          className={cn(field, 'resize-none')}
          placeholder="Cantidad de pasajeros, equipaje, indicaciones…"
        />
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
          </>
        ) : (
          'Enviar consulta'
        )}
      </button>
    </form>
  )
}