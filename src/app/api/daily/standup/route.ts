import { NextResponse } from 'next/server';
import { dailyService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const standup = dailyService.generateStandup(DEFAULT_USER_ID, date);
  return NextResponse.json({ success: true, data: standup });
}
