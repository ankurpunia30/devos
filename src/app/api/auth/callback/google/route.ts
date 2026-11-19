import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('devos_oauth_state')?.value;

  if (!code) {
    const error = searchParams.get('error') || 'missing_authorization_code';
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('error', error);
    return NextResponse.redirect(loginUrl);
  }

  // Validate state if stored
  if (storedState && state && storedState !== state) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('error', 'invalid_oauth_state');
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('notice', 'google_config_required');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(loginUrl);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated Google profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('error', 'failed_fetching_google_profile');
      return NextResponse.redirect(loginUrl);
    }

    const profile = await userRes.json();

    // 3. Create or login user strictly via Google OAuth
    const { sessionToken } = authService.createGoogleUserOrLogin({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || profile.given_name || 'Developer',
      avatarUrl: profile.picture,
    });

    // 4. Set session cookie and redirect to dashboard
    const res = NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    res.cookies.set('devos_session', sessionToken, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookies.delete('devos_oauth_state');

    return res;
  } catch (err) {
    console.error('OAuth callback execution error:', err);
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('error', 'oauth_server_error');
    return NextResponse.redirect(loginUrl);
  }
}
