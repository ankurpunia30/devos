import { NextResponse } from 'next/server';
import { activityBus } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30', 10);
  const activities = activityBus.getRecentActivities(DEFAULT_USER_ID, limit);
  return NextResponse.json({ success: true, data: activities });
}
