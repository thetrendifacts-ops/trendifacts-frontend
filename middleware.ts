import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Automatically allow localhost without password prompt
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isWriteApi =
    (pathname.startsWith('/api/posts') && req.method !== 'GET') ||
    pathname.startsWith('/api/upload');

  if (!isAdminPage && !isWriteApi) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get('authorization');
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminPass) {
    return new NextResponse('Admin credentials not configured in environment variables.', {
      status: 500,
    });
  }

  if (authHeader) {
    const authValue = authHeader.split(' ')[1] || '';
    const [user, pwd] = atob(authValue).split(':');

    if (user === adminUser && pwd === adminPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Trendifacts Admin Dashboard"',
    },
  });
}

export const proxy = middleware;
export default middleware;

export const config = {
  matcher: ['/admin/:path*', '/api/posts/:path*', '/api/upload/:path*'],
};