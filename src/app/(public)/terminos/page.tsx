import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  alternates: { canonical: `${SITE.url}/terminos` },
}

export default function TerminosPage() {
  return (
    <div className="pt-20">
      <article className="section-padding container mx-auto max-w-3xl prose prose-invert prose-amber">
        <h1>Términos y Condiciones</h1>
        <p className="text-zinc-400">Última actualización: enero 2026.</p>
        <h2>Servicio</h2>
        <p>
          Gustavo Taxi 053 ofrece servicio de transporte de pasajeros en la provincia del
          Chubut, Argentina. Las reservas se confirman de forma directa con el conductor
          ({SITE.driver}) vía WhatsApp, teléfono o formulario web.
        </p>
        <h2>Reservas y cancelaciones</h2>
        <p>
          La disponibilidad está sujeta a confirmación. Ante cancelaciones, te pedimos
          avisar con la mayor anticipación posible. Para traslados al aeropuerto o viajes
          de larga distancia, se recomienda reservar con anticipación.
        </p>
        <h2>Tarifas y pagos</h2>
        <p>
          Las tarifas se acuerdan al momento de la reserva. Se aceptan Mercado Pago,
          débito, crédito, transferencia y efectivo.
        </p>
        <h2>Responsabilidad</h2>
        <p>
          El servicio se presta con vehículo en condiciones y conductor profesional. El
          pasajero es responsable de sus pertenencias. Ante cualquier incidente, contactá
          de inmediato al {SITE.phoneDisplay}.
        </p>
        <h2>Contacto</h2>
        <p>
          Consultas: {SITE.phoneDisplay} · {SITE.email}
        </p>
      </article>
    </div>
  )
}