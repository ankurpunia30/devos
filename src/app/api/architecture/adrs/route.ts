import { NextResponse } from 'next/server';
import { architectureService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const adrs = architectureService.getADRs(DEFAULT_USER_ID, projectId);
    return NextResponse.json({ success: true, data: adrs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.context || !body.decision || !body.consequences) {
      return NextResponse.json(
        { success: false, error: 'title, context, decision, and consequences are required' },
        { status: 400 }
      );
    }

    const adr = architectureService.createADR({
      userId: DEFAULT_USER_ID,
      projectId: body.projectId,
      title: body.title,
      status: body.status,
      context: body.context,
      decision: body.decision,
      consequences: body.consequences,
      mermaidDiagram: body.mermaidDiagram,
    });

    return NextResponse.json({ success: true, data: adr }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
