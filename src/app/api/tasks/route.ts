import { NextResponse } from 'next/server';
import { taskService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const priority = (searchParams.get('priority') as any) || undefined;

  const tasks = taskService.getTasks(DEFAULT_USER_ID, { projectId, status, priority });
  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = taskService.createTask({
    userId: DEFAULT_USER_ID,
    title: body.title,
    description: body.description,
    projectId: body.projectId,
    priority: body.priority,
    status: body.status,
    dueDate: body.dueDate,
    estimatedMinutes: body.estimatedMinutes,
    tags: body.tags,
  });

  return NextResponse.json({ success: true, data: task }, { status: 201 });
}
