import type { NextRequest } from 'next/server'
import { ChatClient } from 'dify-client'
import { jwtVerify } from 'jose'
import { API_KEY, API_URL, APP_ID } from '@/config'
import { SESSION_COOKIE } from '@/middleware'

function getSessionSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET || 'CHANGE_ME_SESSION_SECRET')
}

export const getInfo = async (request: NextRequest) => {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) { throw new Error('Unauthorized') }

  const { payload } = await jwtVerify(sessionToken, getSessionSecret())
  const userId = payload.userId as string

  return {
    userId,
    user: `sh_${APP_ID}:${userId}`,
    name: (payload.name as string) || '',
    email: (payload.email as string) || '',
    firm: (payload.firm as string) || '',
    phone: (payload.phone as string) || '',
  }
}

export const client = new ChatClient(API_KEY, API_URL || undefined)
