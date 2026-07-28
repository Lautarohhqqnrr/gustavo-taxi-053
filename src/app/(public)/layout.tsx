import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingButtons } from '@/components/layout/FloatingButtons'
import { BackToTop } from '@/components/layout/BackToTop'
import { CookieBanner } from '@/components/layout/CookieBanner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <FloatingButtons />
      <BackToTop />
      <CookieBanner />
    </>
  )
}