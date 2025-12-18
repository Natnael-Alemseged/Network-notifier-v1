import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function proxy(request: NextRequest) {
  // Exclude auth routes and public assets
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  ) {
    return NextResponse.next()
  }

  // Check for token in cookies or Authorization header
  let token = request.cookies.get('token')?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    // If accessing API, return 401
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Otherwise redirect to login (or home if that's where login is)
    // Assuming home page is public or handles auth check client side, 
    // but if we want to protect dashboard:
    // return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  // Verify token
  const payload = await verifyToken(token)
  if (!payload) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
}
