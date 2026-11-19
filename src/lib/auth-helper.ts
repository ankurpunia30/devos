import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from './services.ts';
import { DEFAULT_USER_ID } from '../db/client.ts';

export async function resolveUserId(req?: Request | NextRequest): Promise<string> {
  let token: string | undefined;

  // 1. Check req if it's NextRequest with cookies
  if (req && 'cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    token = (req as NextRequest).cookies.get('devos_session')?.value;
  }

  // 2. Check header Cookie
  if (!token && req && typeof req.headers?.get === 'function') {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/devos_session=([^;]+)/);
      if (match) token = match[1];
    }
  }

  // 3. Check next/headers cookies()
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('devos_session')?.value;
    } catch {}
  }

  if (token) {
    const user = authService.validateSession(token);
    if (user) return user.id;
  }

  return DEFAULT_USER_ID;
}
