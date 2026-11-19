import { NextResponse } from 'next/server';
import { dailyService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = dailyService.togglePriorityCompleted(id, DEFAULT_USER_ID);
  return NextResponse.json({ success: true, data: { isCompleted: state } });
}
