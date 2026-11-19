import { NextRequest, NextResponse } from 'next/server';
import { aiAssistantService } from '@/lib/services';
import { resolveUserId } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json({ success: false, error: 'query is required' }, { status: 400 });
    }

    const userId = await resolveUserId(req);
    const answer = aiAssistantService.answerGroundedQuery(userId, body.query);
    return NextResponse.json({ success: true, data: answer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
