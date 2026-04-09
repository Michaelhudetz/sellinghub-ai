import type { NextRequest } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    inputs,
    query,
    files,
    conversation_id: conversationId,
    response_mode: responseMode,
  } = body
  const { user, name, email, firm, phone } = await getInfo(request)
  const mergedInputs = {
    ...inputs,
    user_name: name,
    user_email: email,
    user_firm: firm,
    user_phone: phone,
  }
  const res = await client.createChatMessage(mergedInputs, query, user, responseMode, conversationId, files)
  return new Response(res.data as any)
}
