import { NextResponse } from 'next/server';

export function middleware(req) {
  try {
    // Example: block a route
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow request to continue
    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
