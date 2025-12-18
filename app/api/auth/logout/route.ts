import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    await logout()
    console.log(req);
    console.log('logging out api');

    return NextResponse.json({ success: true })
}
