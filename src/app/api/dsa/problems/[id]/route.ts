import { NextResponse } from 'next/server';
import { dsaService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = dsaService.updateProblem(id, DEFAULT_USER_ID, body);

  if (!updated) {
    return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}
