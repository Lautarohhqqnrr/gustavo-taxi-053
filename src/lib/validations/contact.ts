import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre').max(80),
  phone: z.string().min(8, 'Ingresá un teléfono válido').max(20),
  origin: z.string().min(2, 'Ingresá el origen').max(120),
  destination: z.string().min(2, 'Ingresá el destino').max(120),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  message: z.string().max(1000).optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>