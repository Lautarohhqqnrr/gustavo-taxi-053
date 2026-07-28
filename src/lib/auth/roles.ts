/**
 * Sistema de roles — Gustavo Taxi 053
 *
 * admin  → acceso total (usuarios, config, todo el contenido)
 * editor → gestiona contenido (galería, blog, reseñas, mensajes, medios)
 * viewer → solo lectura del dashboard y listados
 */

export const ROLES = ['admin', 'editor', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Solo lectura',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Acceso total: usuarios, configuración y todo el contenido.',
  editor: 'Puede gestionar galería, blog, reseñas, mensajes y medios.',
  viewer: 'Solo puede ver el dashboard y listados, sin modificar.',
}

/** Permisos granulares del sistema */
export type Permission =
  | 'dashboard:view'
  | 'gallery:read'
  | 'gallery:write'
  | 'media:read'
  | 'media:write'
  | 'blog:read'
  | 'blog:write'
  | 'reviews:read'
  | 'reviews:write'
  | 'messages:read'
  | 'messages:write'
  | 'services:read'
  | 'services:write'
  | 'routes:read'
  | 'routes:write'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write'
  | 'analytics:read'

const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'gallery:read',
  'gallery:write',
  'media:read',
  'media:write',
  'blog:read',
  'blog:write',
  'reviews:read',
  'reviews:write',
  'messages:read',
  'messages:write',
  'services:read',
  'services:write',
  'routes:read',
  'routes:write',
  'settings:read',
  'settings:write',
  'users:read',
  'users:write',
  'analytics:read',
]

const EDITOR_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'gallery:read',
  'gallery:write',
  'media:read',
  'media:write',
  'blog:read',
  'blog:write',
  'reviews:read',
  'reviews:write',
  'messages:read',
  'messages:write',
  'services:read',
  'services:write',
  'routes:read',
  'routes:write',
  'analytics:read',
]

const VIEWER_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'gallery:read',
  'media:read',
  'blog:read',
  'reviews:read',
  'messages:read',
  'services:read',
  'routes:read',
  'analytics:read',
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  editor: EDITOR_PERMISSIONS,
  viewer: VIEWER_PERMISSIONS,
}

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES.includes(value as Role)
}

export function hasPermission(role: Role | string | null | undefined, permission: Permission): boolean {
  if (!role || !isValidRole(role)) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyPermission(
  role: Role | string | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function canAccessAdmin(role: Role | string | null | undefined): boolean {
  return isValidRole(role) && ROLE_PERMISSIONS[role].includes('dashboard:view')
}

/** Rutas del panel y el permiso mínimo requerido */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/admin': 'dashboard:view',
  '/admin/galeria': 'gallery:read',
  '/admin/medios': 'media:read',
  '/admin/biblioteca': 'media:read',
  '/admin/blog': 'blog:read',
  '/admin/resenas': 'reviews:read',
  '/admin/mensajes': 'messages:read',
  '/admin/servicios': 'services:read',
  '/admin/recorridos': 'routes:read',
  '/admin/configuracion': 'settings:read',
  '/admin/usuarios': 'users:read',
  '/admin/permisos': 'users:write',
  '/admin/estadisticas': 'analytics:read',
}

export function canAccessRoute(
  role: Role | string | null | undefined,
  pathname: string
): boolean {
  // Buscar la ruta más específica que coincida
  const match = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(route + '/'))

  if (!match) return canAccessAdmin(role)
  return hasPermission(role, ADMIN_ROUTE_PERMISSIONS[match])
}
/** Lista ordenada de todos los permisos */
export const PERMISSIONS: Permission[] = ALL_PERMISSIONS

/** Metadatos para la UI de gestión */
export const PERMISSION_META: Record<
  Permission,
  { label: string; group: string; description: string }
> = {
  'dashboard:view': {
    label: 'Ver dashboard',
    group: 'Panel',
    description: 'Acceso al panel de administración',
  },
  'gallery:read': {
    label: 'Ver galería',
    group: 'Galería',
    description: 'Listar imágenes de la galería',
  },
  'gallery:write': {
    label: 'Editar galería',
    group: 'Galería',
    description: 'Subir, ordenar, editar y eliminar imágenes',
  },
  'media:read': {
    label: 'Ver medios',
    group: 'Medios',
    description: 'Ver hero, logo, banners y foto',
  },
  'media:write': {
    label: 'Editar medios',
    group: 'Medios',
    description: 'Cambiar hero, logo, favicon y banners',
  },
  'blog:read': {
    label: 'Ver blog',
    group: 'Blog',
    description: 'Listar publicaciones',
  },
  'blog:write': {
    label: 'Editar blog',
    group: 'Blog',
    description: 'Crear, editar y publicar posts',
  },
  'reviews:read': {
    label: 'Ver reseñas',
    group: 'Reseñas',
    description: 'Listar reseñas de clientes',
  },
  'reviews:write': {
    label: 'Moderar reseñas',
    group: 'Reseñas',
    description: 'Aprobar, ocultar, responder y eliminar',
  },
  'messages:read': {
    label: 'Ver mensajes',
    group: 'Mensajes',
    description: 'Leer formularios de contacto',
  },
  'messages:write': {
    label: 'Gestionar mensajes',
    group: 'Mensajes',
    description: 'Marcar leídos y eliminar mensajes',
  },
  'services:read': {
    label: 'Ver servicios',
    group: 'Servicios',
    description: 'Listar servicios del sitio',
  },
  'services:write': {
    label: 'Editar servicios',
    group: 'Servicios',
    description: 'Crear y modificar servicios',
  },
  'routes:read': {
    label: 'Ver recorridos',
    group: 'Recorridos',
    description: 'Listar recorridos frecuentes',
  },
  'routes:write': {
    label: 'Editar recorridos',
    group: 'Recorridos',
    description: 'Crear y modificar recorridos',
  },
  'settings:read': {
    label: 'Ver configuración',
    group: 'Configuración',
    description: 'Ver ajustes del sitio',
  },
  'settings:write': {
    label: 'Editar configuración',
    group: 'Configuración',
    description: 'Modificar textos, SEO y redes',
  },
  'users:read': {
    label: 'Ver usuarios',
    group: 'Usuarios',
    description: 'Listar usuarios y roles',
  },
  'users:write': {
    label: 'Gestionar usuarios',
    group: 'Usuarios',
    description: 'Cambiar roles y permisos',
  },
  'analytics:read': {
    label: 'Ver estadísticas',
    group: 'Analytics',
    description: 'Dashboard de métricas y eventos',
  },
}

export function getPermissionsByGroup(): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const perm of PERMISSIONS) {
    const group = PERMISSION_META[perm].group
    if (!groups[group]) groups[group] = []
    groups[group].push(perm)
  }
  return groups
}

/**
 * Calcula permisos efectivos: rol base + overrides.
 * - granted=true  → agrega el permiso
 * - granted=false → quita el permiso del rol
 */
export function resolveEffectivePermissions(
  role: Role | string | null | undefined,
  overrides: { permission: string; granted: boolean }[] = []
): Permission[] {
  if (!role || !isValidRole(role)) return []

  const set = new Set<Permission>(ROLE_PERMISSIONS[role])

  for (const o of overrides) {
    if (!PERMISSIONS.includes(o.permission as Permission)) continue
    if (o.granted) {
      set.add(o.permission as Permission)
    } else {
      set.delete(o.permission as Permission)
    }
  }

  return PERMISSIONS.filter((p) => set.has(p))
}

export function effectiveHasPermission(
  effective: Permission[],
  permission: Permission
): boolean {
  return effective.includes(permission)
}
