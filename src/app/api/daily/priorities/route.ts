import { NextResponse } from 'next/server';
import { dailyService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const priorities = dailyService.getDailyPriorities(DEFAULT_USER_ID, date);
  return NextResponse.json({ success: true, data: priorities });
}

export async function POST(request: Request) {
  const body = await request.json();
  const priority = dailyService.setDailyPriority({
    userId: DEFAULT_USER_ID,
    date: body.date || new Date().toISOString().slice(0, 10),
    rank: body.rank,
    taskId: body.taskId,
    customTitle: body.customTitle,
  });

  return NextResponse.json({ success: true, data: priority }, { status: 201 });
}
