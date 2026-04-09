import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  try {
    const { userId, name, email, firm, phone } = await getInfo(request)
    return NextResponse.json({ userId, name, email, firm, phone })
  }
  catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
