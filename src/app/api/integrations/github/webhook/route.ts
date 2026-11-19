import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/services';

export async function POST(req: Request) {
  try {
    const event = req.headers.get('x-github-event') || 'ping';
    const payload = await req.json();

    const result = integrationService.handleGitHubWebhook(event, payload);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
