import { NextResponse } from 'next/server';
import { dsaService } from '@/lib/services';

export async function GET() {
  const topics = dsaService.getTopics();
  return NextResponse.json({ success: true, data: topics });
}
