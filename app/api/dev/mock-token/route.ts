import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// This endpoint is ONLY available outside of production.
// Visit /api/dev/mock-token in your browser to simulate the full SSO flow.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production')
  { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'CHANGE_ME_JWT_SECRET')

  const token = await new SignJWT({
    sub: 'dev-user-001',
    name: 'Testovací Agent',
    email: 'test@sellinghub.cz',
    firm: 'RE/MAX Česko',
    phone: '+420 777 123 456',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  // Redirect to the app root with the token — middleware picks it up,
  // validates it, sets the session cookie, and redirects to the clean URL.
  const target = new URL('/', request.url)
  target.searchParams.set('token', token)
  return NextResponse.redirect(target)
}
