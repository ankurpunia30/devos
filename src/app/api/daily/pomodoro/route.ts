import { NextResponse } from 'next/server';
import { dailyService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(request: Request) {
  const body = await request.json();
  const pomo = dailyService.recordPomodoro(DEFAULT_USER_ID, body.durationMinutes || 25, body.taskId);
  return NextResponse.json({ success: true, data: pomo }, { status: 201 });
}
