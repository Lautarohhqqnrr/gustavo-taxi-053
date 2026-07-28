import type { MetadataRoute } from 'next'
import { SITE, NAV_LINKS } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url

  const staticPages = NAV_LINKS.map((link) => ({
    url: `${base}${link.href === '/' ? '' : link.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: link.href === '/' ? 1 : 0.8,
  }))

  return [
    ...staticPages,
    {
      url: `${base}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}