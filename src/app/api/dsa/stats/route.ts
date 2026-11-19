import { NextResponse } from 'next/server';
import { dsaService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  const stats = dsaService.getStats(DEFAULT_USER_ID);
  return NextResponse.json({ success: true, data: stats });
}
