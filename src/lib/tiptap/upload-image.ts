'use server'

import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

/**
 * Server Action: sube una imagen al bucket `blog` de Supabase Storage
 * y devuelve la URL pública.
 *
 * Uso desde el cliente (pasado como prop a TiptapEditor):
 *   const result = await uploadBlogImage(file)
 */
export async function uploadBlogImage(formData: FormData) {
  const file = formData.get('file') as File | null

  if (!file) {
    throw new Error('No se recibió ningún archivo')
  }

  // Validaciones de seguridad
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo JPG, PNG, WebP o GIF.')
  }

  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (file.size > maxSize) {
    throw new Error('La imagen supera el límite de 5 MB')
  }

  const supabase = await createClient()

  // Verificar autenticación (solo admins)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${randomUUID()}.${ext}`
  const filePath = `posts/${fileName}`

  const { data, error } = await supabase.storage
    .from('blog')
    .upload(filePath, file, {
      cacheControl: '31536000', // 1 año
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    console.error('Error subiendo imagen a Supabase:', error)
    throw new Error('Error al subir la imagen. Intentá de nuevo.')
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('blog').getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Versión client-side helper que envuelve el FormData
 * para que sea más fácil de usar en el componente.
 */
export async function uploadImageFromClient(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadBlogImage(formData)
}