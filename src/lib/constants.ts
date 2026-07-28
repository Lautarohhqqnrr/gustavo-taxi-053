export const SITE = {
  name: 'Gustavo Taxi 053',
  shortName: 'Gustavo Taxi',
  description:
    'Servicio de taxi premium en Esquel, Trevelin y toda la provincia del Chubut. Más de 10 años de experiencia. Traslados urbanos, aeropuerto, turismo y viajes de larga distancia.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gustavotaxi.com',
  locale: 'es_AR',
  driver: 'Gustavo Huaiquiñir',
  phone: process.env.NEXT_PUBLIC_PHONE || '+5492945655502',
  phoneDisplay: '+54 9 2945 65-5502',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '5492945655502',
  email: process.env.NEXT_PUBLIC_EMAIL || 'contacto@gustavotaxi.com',
  instagram: 'gustavo_taxi053',
  instagramUrl: 'https://instagram.com/gustavo_taxi053',
  facebook: 'Taxi Gustavo Esquel',
  facebookUrl: 'https://facebook.com/TaxiGustavoEsquel',
  location: {
    city: 'Esquel',
    region: 'Chubut',
    country: 'Argentina',
    coverage: 'Toda la provincia del Chubut',
  },
  yearsExperience: 10,
  tagline: 'Más de 10 años llevando personas con seguridad por todo Chubut.',
} as const

export const PAYMENT_METHODS = [
  'Mercado Pago',
  'Débito',
  'Crédito',
  'Transferencia',
  'Efectivo',
] as const

export const DIFFERENTIALS = [
  {
    title: 'Internet satelital',
    description: 'Conectividad a bordo en todo el recorrido.',
    icon: 'Wifi',
  },
  {
    title: 'Más de 10 años',
    description: 'Experiencia comprobada en toda la provincia.',
    icon: 'Award',
  },
  {
    title: 'Puntualidad',
    description: 'Llegamos a tiempo, siempre.',
    icon: 'Clock',
  },
  {
    title: 'Seguridad',
    description: 'Vehículo en perfectas condiciones y conductor profesional.',
    icon: 'Shield',
  },
  {
    title: 'Vehículo cómodo',
    description: 'Espacio, clima y confort para tu viaje.',
    icon: 'Car',
  },
  {
    title: 'Atención personalizada',
    description: 'Trato directo y cercano, sin intermediarios.',
    icon: 'Heart',
  },
] as const

export const FREQUENT_ROUTES = [
  { from: 'Esquel', to: 'Trevelin', slug: 'esquel-trevelin' },
  { from: 'Esquel', to: 'Aeropuerto', slug: 'esquel-aeropuerto' },
  { from: 'Esquel', to: 'Trelew', slug: 'esquel-trelew' },
  { from: 'Esquel', to: 'Bariloche', slug: 'esquel-bariloche' },
  { from: 'Esquel', to: 'La Hoya', slug: 'esquel-la-hoya' },
  { from: 'Esquel', to: 'El Bolsón', slug: 'esquel-el-bolson' },
  { from: 'Esquel', to: 'Lago Futalaufquen', slug: 'esquel-lago-futalaufquen' },
] as const

export const MAP_MARKERS = [
  { name: 'Esquel', lat: -42.9097, lng: -71.3195 },
  { name: 'Trevelin', lat: -43.0856, lng: -71.4669 },
  { name: 'Aeropuerto de Esquel', lat: -42.9081, lng: -71.1367 },
  { name: 'Centro de Ski La Hoya', lat: -42.8333, lng: -71.15 },
  { name: 'Lago Futalaufquen', lat: -42.8333, lng: -71.6167 },
  { name: 'Trelew', lat: -43.2489, lng: -65.3051 },
  { name: 'Bariloche', lat: -41.1335, lng: -71.3103 },
  { name: 'El Bolsón', lat: -41.9667, lng: -71.5167 },
] as const

export const GALLERY_CATEGORIES = [
  'Vehículo',
  'Clientes',
  'Paisajes',
  'Viajes',
  'Turismo',
] as const

export const BLOG_CATEGORIES = [
  'Turismo',
  'Consejos de viaje',
  'Noticias',
  'Destinos',
  'Experiencias',
  'Seguridad',
] as const

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recorridos', label: 'Recorridos' },
  { href: '/galeria', label: 'Galería' },
  { href: '/sobre-gustavo', label: 'Sobre Gustavo' },
  { href: '/blog', label: 'Blog' },
  { href: '/resenas', label: 'Reseñas' },
  { href: '/contacto', label: 'Contacto' },
] as const

export const WHATSAPP_MESSAGE =
  'Hola Gustavo! Quiero consultar por un traslado con Gustavo Taxi 053.'