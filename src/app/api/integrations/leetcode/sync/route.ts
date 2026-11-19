import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = body.username || undefined;

    const result = await integrationService.syncLeetCode(DEFAULT_USER_ID, username);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
