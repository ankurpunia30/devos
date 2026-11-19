import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || 'developer@devos.local';
    const name = body.name || 'Lead Engineer';

    const { user, sessionToken } = authService.createGoogleUserOrLogin({
      googleId: 'demo_google_sandbox',
      email,
      name,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    });

    const res = NextResponse.json({
      success: true,
      data: { user, redirect: '/dashboard' },
    });

    res.cookies.set('devos_session', sessionToken, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
