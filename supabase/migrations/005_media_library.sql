-- ============================================================
-- Biblioteca Multimedia (tipo WordPress Media Library)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Archivo
  name TEXT NOT NULL,
  original_name TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'media',
  mime_type TEXT NOT NULL,
  extension TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  width INT,
  height INT,
  duration_seconds NUMERIC,
  -- Metadatos editoriales
  title TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Sin categoría',
  tags TEXT[] NOT NULL DEFAULT '{}',
  folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
  -- Estado
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_used BOOLEAN NOT NULL DEFAULT false,
  usage_locations TEXT[] NOT NULL DEFAULT '{}',
  -- Autoría
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Miniatura
  thumb_url TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime ON public.media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON public.media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON public.media_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON public.media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_name ON public.media_assets(name);

CREATE TRIGGER tr_media_assets_updated
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Log de acciones
CREATE TABLE IF NOT EXISTS public.media_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- upload | rename | replace | delete | update_meta
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_activity_asset ON public.media_activity_log(asset_id);

ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage media_folders"
  ON public.media_folders FOR ALL USING (public.is_admin());

CREATE POLICY "Admins manage media_assets"
  ON public.media_assets FOR ALL USING (public.is_admin());

CREATE POLICY "Public can read media_assets"
  ON public.media_assets FOR SELECT USING (true);

CREATE POLICY "Admins manage media_activity_log"
  ON public.media_activity_log FOR ALL USING (public.is_admin());

-- Carpetas iniciales
INSERT INTO public.media_folders (name) VALUES
  ('Hero'),
  ('Galería'),
  ('Servicios'),
  ('Recorridos'),
  ('Blog'),
  ('Logo'),
  ('Vehículo'),
  ('Turismo'),
  ('Promociones'),
  ('Videos'),
  ('Documentos')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.media_assets IS 'Biblioteca multimedia central — todas las imágenes, videos y PDFs del sitio';