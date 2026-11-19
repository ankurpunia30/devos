import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('devos_session')?.value;
  if (token) {
    authService.logout(token);
  }

  const res = NextResponse.json({ success: true, redirect: '/' });
  res.cookies.delete('devos_session');
  return res;
}
