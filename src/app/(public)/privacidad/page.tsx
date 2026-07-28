import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  alternates: { canonical: `${SITE.url}/privacidad` },
}

export default function PrivacidadPage() {
  return (
    <div className="pt-20">
      <article className="section-padding container mx-auto max-w-3xl prose prose-invert prose-amber">
        <h1>Política de Privacidad</h1>
        <p className="lead text-zinc-400">
          Última actualización: enero 2026. Gustavo Taxi 053 ({SITE.driver}) respeta tu
          privacidad.
        </p>
        <h2>Datos que recopilamos</h2>
        <p>
          Cuando completás el formulario de contacto o reserva, recopilamos nombre,
          teléfono, origen, destino, fecha/hora preferida y mensaje. También registramos
          eventos de uso anónimos (clics en WhatsApp, llamadas, páginas visitadas) para
          mejorar el servicio.
        </p>
        <h2>Uso de los datos</h2>
        <p>
          Los datos de contacto se usan exclusivamente para responder tu consulta y
          coordinar el traslado. No vendemos ni cedemos tu información a terceros con
          fines comerciales.
        </p>
        <h2>Cookies</h2>
        <p>
          Utilizamos cookies técnicas y de analítica (propias y de terceros como Vercel)
          para el funcionamiento del sitio y medición de tráfico. Podés configurar tu
          navegador para rechazarlas.
        </p>
        <h2>Contacto</h2>
        <p>
          Para ejercer derechos de acceso, rectificación o eliminación de datos,
          escribinos a {SITE.email} o por WhatsApp al {SITE.phoneDisplay}.
        </p>
      </article>
    </div>
  )
}