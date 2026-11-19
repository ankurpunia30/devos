import { NextResponse } from 'next/server';
import { authService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const result = authService.signUpWithPassword({
      email,
      password,
      name,
    });

    const response = NextResponse.json({
      success: true,
      data: { user: result.user },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'devos_session',
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Signup failed' },
      { status: 400 }
    );
  }
}
