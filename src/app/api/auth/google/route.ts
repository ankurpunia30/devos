import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/callback/google`;

  if (!clientId) {
    // If Google OAuth credentials are not yet configured in environment variables,
    // redirect to login page with notice and instant demo login capability
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('notice', 'google_config_required');
    return NextResponse.redirect(loginUrl);
  }

  const state = randomUUID();
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options);
  const targetUrl = `${rootUrl}?${qs.toString()}`;

  const res = NextResponse.redirect(targetUrl);
  res.cookies.set('devos_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
