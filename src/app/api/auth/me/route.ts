import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('devos_session')?.value;
  if (!token) {
    // In local development sandbox, fallback to default user if no session
    if (process.env.NODE_ENV !== 'production') {
      const defaultUser = authService.getUserById(DEFAULT_USER_ID);
      return NextResponse.json({ success: true, data: { user: defaultUser, isSandbox: true } });
    }
    return NextResponse.json({ success: true, data: { user: null } });
  }

  const user = authService.validateSession(token);
  return NextResponse.json({ success: true, data: { user } });
}
