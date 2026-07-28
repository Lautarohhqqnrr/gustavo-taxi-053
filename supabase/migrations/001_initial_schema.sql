-- ============================================================
-- Gustavo Taxi 053 – Schema inicial completo
-- Ejecutar en Supabase SQL Editor o vía CLI
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ────────────────────────────────────────────────────────────
-- PROFILES (extiende auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Trigger: crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- SERVICES
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Car',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_active_order ON public.services(is_active, order_index);

-- ────────────────────────────────────────────────────────────
-- ROUTES (recorridos)
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  distance_km NUMERIC(8,1),
  duration_min INT,
  base_price NUMERIC(10,2),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routes_active_order ON public.routes(is_active, order_index);
CREATE INDEX idx_routes_slug ON public.routes(slug);

-- ────────────────────────────────────────────────────────────
-- GALLERY
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('Vehículo', 'Clientes', 'Paisajes', 'Viajes', 'Turismo')),
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_category_active ON public.gallery(category, is_active, order_index);

-- ────────────────────────────────────────────────────────────
-- REVIEWS
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_approved ON public.reviews(is_approved, is_hidden, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- POSTS (blog)
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_json JSONB,
  cover_image TEXT,
  category TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_published ON public.posts(is_published, published_at DESC);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_category ON public.posts(category);

-- ────────────────────────────────────────────────────────────
-- MESSAGES (formulario de contacto / reserva)
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_unread ON public.messages(is_read, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- SITE SETTINGS (key-value)
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ANALYTICS EVENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  page TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_type_date ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- UPDATED_AT trigger genérico
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_routes_updated BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_posts_updated BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper: es admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL USING (public.is_admin());

-- Services
CREATE POLICY "Active services are public"
  ON public.services FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage services"
  ON public.services FOR ALL USING (public.is_admin());

-- Routes
CREATE POLICY "Active routes are public"
  ON public.routes FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage routes"
  ON public.routes FOR ALL USING (public.is_admin());

-- Gallery
CREATE POLICY "Active gallery is public"
  ON public.gallery FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage gallery"
  ON public.gallery FOR ALL USING (public.is_admin());

-- Reviews
CREATE POLICY "Approved reviews are public"
  ON public.reviews FOR SELECT
  USING ((is_approved = true AND is_hidden = false) OR public.is_admin());
CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL USING (public.is_admin());

-- Posts
CREATE POLICY "Published posts are public"
  ON public.posts FOR SELECT
  USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins manage posts"
  ON public.posts FOR ALL USING (public.is_admin());

-- Messages
CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage messages"
  ON public.messages FOR ALL USING (public.is_admin());

-- Settings
CREATE POLICY "Settings are public readable"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings"
  ON public.site_settings FOR ALL USING (public.is_admin());

-- Analytics
CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read analytics"
  ON public.analytics_events FOR SELECT USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (ejecutar también en Storage o vía API)
-- ────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);

-- Storage policies (ejemplo)
-- CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
-- CREATE POLICY "Admin upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
-- CREATE POLICY "Admin delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND public.is_admin());
-- (mismo patrón para bucket 'blog')

-- ────────────────────────────────────────────────────────────
-- SEED DATA inicial
-- ────────────────────────────────────────────────────────────
INSERT INTO public.services (title, slug, description, icon, order_index) VALUES
  ('Traslados urbanos', 'traslados-urbanos', 'Movilidad dentro de Esquel, Trevelin y alrededores con puntualidad y confort.', 'MapPin', 1),
  ('Aeropuerto de Esquel', 'aeropuerto-esquel', 'Traslados ida y vuelta al Aeropuerto de Esquel. Te esperamos con el cartel.', 'Plane', 2),
  ('Turismo Lago Futalaufquen', 'turismo-lago-futalaufquen', 'Excursiones y traslados al Parque Nacional Los Alerces y Lago Futalaufquen.', 'Mountain', 3),
  ('Viajes provinciales', 'viajes-provinciales', 'Conectamos toda la provincia del Chubut con seguridad y experiencia.', 'Route', 4),
  ('Viajes de larga distancia', 'viajes-larga-distancia', 'Esquel – Bariloche, Trelew, El Bolsón y más destinos de la Patagonia.', 'Navigation', 5),
  ('Traslados especiales', 'traslados-especiales', 'Eventos, traslados corporativos, grupos y requerimientos especiales.', 'Star', 6);

INSERT INTO public.routes (origin, destination, slug, description, distance_km, duration_min, order_index) VALUES
  ('Esquel', 'Trevelin', 'esquel-trevelin', 'Conexión frecuente entre Esquel y la hermosa Trevelin.', 25, 25, 1),
  ('Esquel', 'Aeropuerto', 'esquel-aeropuerto', 'Traslados puntuales al Aeropuerto de Esquel (EQS).', 20, 20, 2),
  ('Esquel', 'Trelew', 'esquel-trelew', 'Viaje cómodo hacia Trelew y la zona atlántica.', 400, 300, 3),
  ('Esquel', 'Bariloche', 'esquel-bariloche', 'Uno de los recorridos más solicitados de la Patagonia.', 300, 240, 4),
  ('Esquel', 'La Hoya', 'esquel-la-hoya', 'Centro de ski La Hoya – temporada de nieve y verano.', 15, 20, 5),
  ('Esquel', 'El Bolsón', 'esquel-el-bolson', 'Destino ideal para turismo y ferias artesanales.', 180, 150, 6),
  ('Esquel', 'Lago Futalaufquen', 'esquel-lago-futalaufquen', 'Portal al Parque Nacional Los Alerces.', 50, 50, 7);

INSERT INTO public.site_settings (key, value) VALUES
  ('banner', '{"text": "Más de 10 años llevando personas con seguridad por todo Chubut.", "cta": "Reservar ahora"}'),
  ('social', '{"instagram": "gustavo_taxi053", "facebook": "Taxi Gustavo Esquel"}'),
  ('contact', '{"phone": "+5492945655502", "whatsapp": "5492945655502", "email": "contacto@gustavotaxi.com"}'),
  ('seo_global', '{"title": "Gustavo Taxi 053 | Taxi Esquel, Trevelin y Chubut", "description": "Servicio de taxi premium en Esquel y toda la provincia del Chubut. Aeropuerto, turismo, viajes de larga distancia."}');