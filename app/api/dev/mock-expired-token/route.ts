import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// Generates a JWT that expired 1 hour ago to verify middleware rejects it.
// Visit /api/dev/mock-expired-token in your browser — you should land on /not-a-member.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production')
  { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'CHANGE_ME_JWT_SECRET')
  const nowSeconds = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    sub: 'dev-user-001',
    name: 'Testovací Agent',
    email: 'test@sellinghub.cz',
    firm: 'RE/MAX Česko',
    phone: '+420 777 123 456',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(nowSeconds - 7200) // issued 2 hours ago
    .setExpirationTime(nowSeconds - 3600) // expired 1 hour ago
    .sign(secret)

  const target = new URL('/', request.url)
  target.searchParams.set('token', token)
  return NextResponse.redirect(target)
}
