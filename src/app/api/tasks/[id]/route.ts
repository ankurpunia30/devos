import { NextResponse } from 'next/server';
import { taskService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = taskService.updateTask(id, DEFAULT_USER_ID, body);

  if (!updated) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = taskService.deleteTask(id, DEFAULT_USER_ID);

  return NextResponse.json({ success: deleted }, { status: deleted ? 200 : 404 });
}
