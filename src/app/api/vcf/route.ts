import { NextResponse } from 'next/server'
import { SITE } from '@/lib/constants'

export const dynamic = 'force-static'

export async function GET() {
  const vcf = `BEGIN:VCARD
VERSION:3.0
N:${SITE.driver};Gustavo;;;
FN:${SITE.name}
ORG:${SITE.name}
TITLE:Conductor profesional
TEL;TYPE=CELL,VOICE,WhatsApp:${SITE.phone}
TEL;TYPE=WhatsApp:${SITE.phone}
EMAIL;TYPE=INTERNET:${SITE.email}
URL:${SITE.url}
URL;TYPE=Instagram:https://instagram.com/${SITE.instagram}
URL;TYPE=Facebook:${SITE.facebookUrl}
ADR;TYPE=HOME:;;${SITE.location.city};${SITE.location.region};;Argentina
NOTE:Servicio de Taxi en toda la provincia de Chubut. Más de 10 años de experiencia. Traslados urbanos, aeropuerto, turismo y viajes de larga distancia.
CATEGORIES:Taxi,Transporte,Esquel
END:VCARD`

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${SITE.name.replace(/\s+/g, '_')}.vcf"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}