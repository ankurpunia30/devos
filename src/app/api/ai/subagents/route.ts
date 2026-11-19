import { NextRequest, NextResponse } from 'next/server';
import { aiAssistantService, authService } from '@/lib/services';
import { DEVOS_SUBAGENTS } from '@/domain/subagents-catalog';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEVOS_SUBAGENTS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const agentId = body.agentId || 'dashboard_agent';
    const query = body.query || 'Summary of current domain status';

    // Resolve authenticated user from session cookie
    const token = req.cookies.get('devos_session')?.value;
    const user = token ? authService.validateSession(token) : null;
    const userId = user?.id || DEFAULT_USER_ID;

    const result = aiAssistantService.invokeSubagent(agentId, query, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Subagent execution error' },
      { status: 500 }
    );
  }
}
