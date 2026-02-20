import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/terroir', '/log', '/settings', '/history', '/report'];
const AUTH_PATHS = ['/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthPage) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/terroir/:path*', '/log/:path*', '/settings/:path*', '/history/:path*', '/report/:path*', '/auth/login'],
};
