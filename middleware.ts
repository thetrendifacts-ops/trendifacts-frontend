import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
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

  // Fail closed if ADMIN_PASSWORD hasn't been configured yet
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

export const config = {
  matcher: ['/admin/:path*', '/api/posts/:path*', '/api/upload/:path*'],
};