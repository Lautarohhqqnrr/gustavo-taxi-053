import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { RoutesPreview } from '@/components/home/RoutesPreview'
import { CTASection } from '@/components/home/CTASection'
import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE.name} | Taxi Esquel, Trevelin y toda la provincia del Chubut`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ServicesPreview />
      <RoutesPreview />
      <CTASection />
    </>
  )
}