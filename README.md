# Gustavo Taxi 053

Sitio web premium y panel de administración para **Gustavo Taxi 053**  
Esquel · Trevelin · Provincia del Chubut · Argentina

**Conductor:** Gustavo Huaiquiñir  
**WhatsApp:** +54 9 2945 65-5502  
**Instagram:** [@gustavo_taxi053](https://instagram.com/gustavo_taxi053)

---

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS** · **Framer Motion**
- **Supabase** (Auth, PostgreSQL, Storage, RLS)
- **React Hook Form** · **Zod** · **Lucide React**
- **Tiptap** (editor de blog)
- **Vercel** Analytics + Speed Insights
- **ESLint** · **Prettier**

---

## Instalación local

```bash
git clone <URL_DEL_REPO>
cd gustavo-taxi-053
npm install
cp .example .local
```

Editá `.local` con tus claves (ver abajo).

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)  
Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

```bash
npm run build   # verificar producción
npm run start   # servir build local
```

---

## Variables de entorno

Copiá `.example` → `.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | URL pública (ej. `https://gustavotaxi.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (solo servidor, nunca al cliente) |
| `NEXT_PUBLIC_PHONE` | Teléfono E.164 (`+5492945655502`) |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp sin + (`5492945655502`) |
| `NEXT_PUBLIC_EMAIL` | Email de contacto |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Opcional – Maps JavaScript API |
| `RESEND_API_KEY` | Opcional – emails transaccionales |

---

## Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → ejecutá en orden los archivos de `supabase/migrations/`:
   - `001_initial_schema.sql`
   - `002_media_system.sql`
   - `003_roles.sql`
   - `004_permissions.sql`
   - `005_media_library.sql`
3. **Storage** → creá buckets **públicos**:
   - `site` · `gallery` · `blog` · `media`
4. **Authentication → Users → Add user** (Auto Confirm User).
5. **Table Editor → `profiles`** → asigná `role = admin` a ese usuario.

Detalle: `scripts/create-admin.md`

---

## Google Maps (opcional)

1. Google Cloud Console → habilitar **Maps JavaScript API**.
2. Crear API key restringida por dominio.
3. Pegar en `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

Sin key, el sitio funciona; el mapa puede mostrar fallback.

---

## Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit: Gustavo Taxi 053"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/gustavo-taxi-053.git
git push -u origin main
```

**No subas** `.local` (está en `.gitignore`).

---

## Deploy en Vercel (CI/CD)

1. [vercel.com](https://vercel.com) → **Add New Project** → importá el repo de GitHub.
2. Framework: **Next.js** (autodetectado).
3. **Environment Variables** → las mismas que `.local` (Production + Preview).
4. Deploy.

Cada `git push` a `main` genera un despliegue automático.

Dominio: Project → Settings → Domains.

---

## Panel de administración

| Ruta | Función |
|------|---------|
| `/admin/login` | Acceso |
| `/admin` | Dashboard / métricas |
| `/admin/biblioteca` | Biblioteca multimedia (tipo WordPress) |
| `/admin/medios` | Hero, logo, favicon, banners, foto |
| `/admin/galeria` | Galería pública (orden drag & drop) |
| `/admin/blog` | Publicaciones |
| `/admin/resenas` | Moderación de reseñas |
| `/admin/mensajes` | Formulario de contacto |
| `/admin/usuarios` | Roles (admin / editor / viewer) |
| `/admin/permisos` | Permisos granulares |
| `/admin/configuracion` | Datos del negocio |

Desde el panel podés gestionar imágenes, contenido y usuarios **sin volver a tocar el código**.

---

## Estructura

```
gustavo-taxi-053/
├── public/                 # PWA, manifest, icons
├── supabase/migrations/    # SQL producción
├── scripts/                # docs de setup admin
├── src/
│   ├── app/(public)/       # sitio web
│   ├── app/admin/          # dashboard
│   ├── actions/            # Server Actions
│   ├── components/         # UI
│   ├── lib/auth/           # RBAC
│   ├── lib/media/          # medios + biblioteca
│   └── middleware.ts
├── vercel.json
├── package.json
└── README.md
```

---

## Seguridad

- RLS en PostgreSQL · roles y permisos en panel
- Variables sensibles solo en servidor (`SERVICE_ROLE`)
- Headers de seguridad en `vercel.json`
- Validación Zod en formularios
- Sanitización HTML (blog / Tiptap)
- Rutas `/admin/*` protegidas por middleware

---

## Licencia

MIT — ver [LICENSE](./LICENSE).
