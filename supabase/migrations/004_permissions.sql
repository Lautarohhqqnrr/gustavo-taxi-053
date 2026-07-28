-- ============================================================
-- Permisos granulares + overrides por usuario
-- ============================================================

-- Overrides de permisos por usuario (suman o quitan sobre el rol base)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true, -- true = concede, false = deniega aunque el rol lo tenga
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage user_permissions"
  ON public.user_permissions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can read own permissions"
  ON public.user_permissions FOR SELECT
  USING (auth.uid() = user_id);

-- Ampliar is_admin para incluir verificación de permiso users:write vía rol
-- (la función existente sigue siendo válida para RLS)

COMMENT ON TABLE public.user_permissions IS
  'Overrides de permisos por usuario. granted=true agrega permiso; granted=false lo quita del rol base.';