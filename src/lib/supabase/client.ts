import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Evita crash en build/preview sin env; las queries fallarán con control
    return createBrowserClient<Database>(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key'
    )
  }

  return createBrowserClient<Database>(url, key)
}
