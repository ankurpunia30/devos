import { NextResponse } from 'next/server';
import { integrationService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  try {
    const integrations = integrationService.getIntegrations(DEFAULT_USER_ID);
    return NextResponse.json({ success: true, data: integrations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.provider || !body.accountIdentifier) {
      return NextResponse.json(
        { success: false, error: 'provider and accountIdentifier are required' },
        { status: 400 }
      );
    }

    const saved = integrationService.saveIntegration({
      userId: DEFAULT_USER_ID,
      provider: body.provider,
      accountIdentifier: body.accountIdentifier,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      webhookSecret: body.webhookSecret,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
