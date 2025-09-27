import { createAuthMiddleware } from 'cosmic-authentication';

export const middleware = createAuthMiddleware({
  protectedRoutes: [
    '/dashboard',
    '/settings',
    '/profile',
  ]
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico).*)',
  ]
};