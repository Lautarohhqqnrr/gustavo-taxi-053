-- ============================================================
-- Roles de usuario: admin | editor | viewer
-- ============================================================

-- Actualizar constraint de profiles.role
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'editor', 'viewer', 'user'));

-- Migrar 'user' genérico a 'viewer' (opcional, no rompe datos existentes)
-- UPDATE public.profiles SET role = 'viewer' WHERE role = 'user';

-- Índice ya existe: idx_profiles_role

COMMENT ON COLUMN public.profiles.role IS
  'admin = acceso total; editor = gestiona contenido; viewer = solo lectura; user = sin acceso al panel';