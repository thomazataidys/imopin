import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicRoutes = [
  '/',
  '/buscar',
  '/imoveis',
  '/auth/login',
  '/auth/cadastro',
  '/auth/confirmar-email',
  '/auth/email-confirmado',
  '/auth/recuperar-senha',
  '/auth/nova-senha',
  '/api/auth',
  '/api/imoveis',
  '/api/faculdades',
  '/api/estatisticas',
]

const privateRoutes = [
  '/favoritos',
  '/meus-anuncios',
  '/meus-dados',
  '/anunciar',
]

const adminRoutes = [
  '/admin',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublic) return NextResponse.next()

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isPrivate = privateRoutes.some((route) => pathname.startsWith(route))
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route))

  if (isAdmin) {
    if (!token) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (isPrivate) {
    if (!token) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/anunciar') && !token.emailVerified) {
      return NextResponse.redirect(new URL('/auth/confirmar-email', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
  ],
}
