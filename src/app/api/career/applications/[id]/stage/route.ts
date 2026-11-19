import { NextResponse } from 'next/server';
import { careerService } from '@/lib/services';
import type { CareerStage } from '@/types';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.stage) {
      return NextResponse.json({ success: false, error: 'stage is required' }, { status: 400 });
    }

    const updated = careerService.updateApplicationStage(id, body.stage as CareerStage);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Stage updated' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
