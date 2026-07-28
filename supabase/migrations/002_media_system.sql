-- ============================================================
-- Gustavo Taxi 053 – Sistema de medios / imágenes
-- ============================================================

-- Extender categorías de galería
ALTER TABLE public.gallery
  DROP CONSTRAINT IF EXISTS gallery_category_check;

ALTER TABLE public.gallery
  ADD CONSTRAINT gallery_category_check
  CHECK (category IN ('Vehículo', 'Turismo', 'Viajes', 'Clientes', 'Paisajes', 'Promociones'));

-- Añadir título y descripción a gallery
ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

-- Tabla unificada de medios del sitio (hero, logo, favicon, banners, about, etc.)
CREATE TABLE IF NOT EXISTS public.site_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot TEXT NOT NULL UNIQUE, -- 'hero' | 'logo' | 'favicon' | 'about_photo' | 'banner_home' | 'banner_services' | ...
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  width INT,
  height INT,
  size_bytes INT,
  mime_type TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_media_slot ON public.site_media(slot);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site media is public readable"
  ON public.site_media FOR SELECT USING (true);

CREATE POLICY "Admins manage site media"
  ON public.site_media FOR ALL USING (public.is_admin());

CREATE TRIGGER tr_site_media_updated
  BEFORE UPDATE ON public.site_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed slots vacíos (se completan desde el panel)
INSERT INTO public.site_media (slot, url, path, alt) VALUES
  ('hero', '', '', 'Imagen principal del inicio'),
  ('logo', '', '', 'Logo Gustavo Taxi 053'),
  ('favicon', '', '', 'Favicon'),
  ('about_photo', '', '', 'Fotografía de Gustavo Huaiquiñir'),
  ('banner_home', '', '', 'Banner sección home'),
  ('banner_services', '', '', 'Banner sección servicios'),
  ('banner_routes', '', '', 'Banner sección recorridos')
ON CONFLICT (slot) DO NOTHING;

-- Asegurar que services y routes tienen image_url (ya existen en schema inicial)
-- posts.cover_image ya existe

-- Comentario Storage:
-- Crear buckets en Supabase Dashboard (o vía API):
--   site     (público)  → logo, favicon, hero, banners, about
--   gallery  (público)  → galería
--   blog     (público)  → covers e imágenes de posts
--
-- Policies de ejemplo (Storage):
-- SELECT público en los 3 buckets
-- INSERT/UPDATE/DELETE solo si is_admin()