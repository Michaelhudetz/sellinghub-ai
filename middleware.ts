import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

export const SESSION_COOKIE = 'sh_session'
const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

function getJwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'CHANGE_ME_JWT_SECRET')
}
function getSessionSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET || 'CHANGE_ME_SESSION_SECRET')
}

const SKIP_PATHS = ['/not-a-member', '/api/auth', '/api/dev', '/_next', '/favicon.ico']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (SKIP_PATHS.some(p => pathname.startsWith(p))) { return NextResponse.next() }

  // Fresh JWT from platform arrives in ?token= — validate and exchange for session cookie
  const token = request.nextUrl.searchParams.get('token')
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())

      const sessionToken = await new SignJWT({
        userId: payload.sub,
        name: payload.name ?? '',
        email: payload.email ?? '',
        firm: (payload as any).firm ?? '',
        phone: (payload as any).phone ?? '',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getSessionSecret())

      // Strip ?token from URL so it does not appear in browser history
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('token')

      const response = NextResponse.redirect(cleanUrl)
      response.cookies.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })
      return response
    }
    catch {
      // Invalid token — fall through to session check
    }
  }

  // Check existing session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, getSessionSecret())
      return NextResponse.next()
    }
    catch {
      // Session expired
      const url = request.nextUrl.clone()
      url.pathname = '/not-a-member'
      url.search = '?expired=1'
      const response = NextResponse.redirect(url)
      response.cookies.delete(SESSION_COOKIE)
      return response
    }
  }

  // No auth — redirect to members-only gate
  const url = request.nextUrl.clone()
  url.pathname = '/not-a-member'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
