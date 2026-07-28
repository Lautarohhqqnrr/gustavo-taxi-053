import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessAdmin, canAccessRoute } from '@/lib/auth/roles'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Sin Supabase configurado: dejar pasar (dev) excepto bloquear admin mutaciones
    if (
      request.nextUrl.pathname.startsWith('/admin') &&
      request.nextUrl.pathname !== '/admin/login'
    ) {
      const login = request.nextUrl.clone()
      login.pathname = '/admin/login'
      return NextResponse.redirect(login)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile && canAccessAdmin(profile.role)) {
        const dest = request.nextUrl.clone()
        dest.pathname = '/admin'
        return NextResponse.redirect(dest)
      }
    }
    return supabaseResponse
  }

  if (isAdminRoute) {
    if (!user) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/admin/login'
      dest.searchParams.set('next', pathname)
      return NextResponse.redirect(dest)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !canAccessAdmin(profile.role)) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/'
      return NextResponse.redirect(dest)
    }

    if (!canAccessRoute(profile.role, pathname)) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/admin'
      return NextResponse.redirect(dest)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
