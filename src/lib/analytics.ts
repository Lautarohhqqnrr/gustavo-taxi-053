'use client'

import { createClient } from '@/lib/supabase/client'

export type AnalyticsEventType =
  | 'page_view'
  | 'whatsapp_click'
  | 'call_click'
  | 'contact_download'
  | 'instagram_click'
  | 'facebook_click'
  | 'form_submit'
  | 'share_click'

export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createClient()
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      page: typeof window !== 'undefined' ? window.location.pathname : null,
      metadata: metadata ?? null,
    })
  } catch {
    // silent fail – analytics never blocks UX
  }
}