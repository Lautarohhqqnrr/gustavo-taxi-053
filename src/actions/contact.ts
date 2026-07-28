'use server'

import { createClient } from '@/lib/supabase/server'
import { contactSchema, type ContactFormData } from '@/lib/validations/contact'

export type ContactActionResult =
  | { success: true }
  | { success: false; error: string }

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || 'Datos inválidos' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('messages').insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      preferred_date: parsed.data.preferred_date || null,
      preferred_time: parsed.data.preferred_time || null,
      message: parsed.data.message || null,
      is_read: false,
    })

    if (error) {
      console.error('Contact form error:', error)
      return { success: false, error: 'No se pudo enviar. Intentá de nuevo o escribinos por WhatsApp.' }
    }

    // TODO: enviar email con Resend cuando esté configurado
    return { success: true }
  } catch {
    return { success: false, error: 'Error de conexión. Intentá más tarde.' }
  }
}