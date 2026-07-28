import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE } from '@/lib/constants'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} | Taxi Esquel, Trevelin y Chubut`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'glass-dark border-white/10',
              }}
              richColors
              closeButton
            />
            <Analytics />
            <SpeedInsights />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
