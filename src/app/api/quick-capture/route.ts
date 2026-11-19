import { NextResponse } from 'next/server';
import { taskService, activityBus } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(request: Request) {
  const body = await request.json();
  const note = body.text || '';

  let createdTask = null;
  if (note.toLowerCase().startsWith('todo:') || note.toLowerCase().startsWith('fix') || note.toLowerCase().startsWith('implement')) {
    const cleanTitle = note.replace(/^todo:\s*/i, '').trim();
    createdTask = taskService.createTask({
      userId: DEFAULT_USER_ID,
      title: cleanTitle,
      priority: 'high',
      tags: ['quick-capture'],
    });
  }

  activityBus.emit({
    userId: DEFAULT_USER_ID,
    eventType: 'quick_capture.saved',
    sourceDomain: 'daily',
    title: `Captured: ${note.slice(0, 50)}...`,
    description: note,
    taskId: createdTask ? createdTask.id : null,
  });

  return NextResponse.json({ success: true, data: { captured: true, task: createdTask } }, { status: 201 });
}
