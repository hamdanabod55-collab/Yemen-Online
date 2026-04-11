import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. If not logged in and accessing protected routes
  if (!user) {
    if (pathname.startsWith('/admin')) {
      url.pathname = '/login'; // Or specific admin portal
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/merchant') && pathname !== '/merchant/login') {
      url.pathname = '/merchant/login';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/account')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. Role Separation Logic (Blocking unauthorized access)
  if (user) {
    const role = user.user_metadata?.role || 'customer';

    // Protect Admin Routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Protect Merchant Routes
    if (pathname.startsWith('/merchant') && pathname !== '/merchant/login') {
      if (role !== 'merchant' && role !== 'admin') {
        url.pathname = '/'; // Customers trying to hit dashboard get bounced
        return NextResponse.redirect(url);
      }
    }

    // If logged in merchant tries to hit merchant login, bounce them to their dashboard
    if (pathname === '/merchant/login' && (role === 'merchant' || role === 'admin')) {
      url.pathname = '/merchant';
      return NextResponse.redirect(url);
    }

    // If logged in customer tries to hit main /login page, bounce to accounts
    if (pathname === '/login' && role === 'customer') {
      url.pathname = '/account';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
