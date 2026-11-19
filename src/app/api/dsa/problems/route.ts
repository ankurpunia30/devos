import { NextResponse } from 'next/server';
import { dsaService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topicId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const difficulty = (searchParams.get('difficulty') as any) || undefined;

  const problems = dsaService.getProblems(DEFAULT_USER_ID, { topicId, status, difficulty });
  return NextResponse.json({ success: true, data: problems });
}
