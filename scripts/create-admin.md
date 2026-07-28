# Crear usuario administrador

## Opción 1 — Desde Supabase Dashboard

1. Ir a **Authentication → Users → Add user**
2. Email: el del admin (ej. `admin@gustavotaxi.com`)
3. Password: una contraseña segura
4. Marcar **Auto Confirm User**
5. Ir a **Table Editor → profiles**
6. Buscar el usuario recién creado
7. Editar la fila y poner `role = admin`

## Opción 2 — SQL

```sql
-- Después de crear el usuario en Auth, actualizar el rol:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@gustavotaxi.com';
```

## Opción 3 — Al crear el usuario con metadata

Si creás el usuario por API/Dashboard con `raw_user_meta_data`:

```json
{ "role": "admin", "full_name": "Gustavo Admin" }
```

El trigger `handle_new_user` tomará el role del metadata.

## Login

Abrí `/admin/login` e ingresá con el email y contraseña.
