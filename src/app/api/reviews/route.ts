import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const comment = formData.get('comment') as string
    const rating = parseInt(formData.get('rating') as string)

    if (!name || !comment || !rating) {
      return NextResponse.redirect(new URL('/resenas?error=1', request.url))
    }

    const supabase = await createClient()
    await supabase.from('reviews').insert({
      name,
      comment,
      rating,
      is_approved: false,
      is_hidden: false,
    })

    return NextResponse.redirect(new URL('/resenas?ok=1', request.url))
  } catch {
    return NextResponse.redirect(new URL('/resenas?error=1', request.url))
  }
}
