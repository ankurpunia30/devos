import { NextResponse } from 'next/server';
import { aiAssistantService, taskService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ success: false, error: 'text is required' }, { status: 400 });
    }

    const parsed = aiAssistantService.parseNaturalLanguageTask(body.text);

    // If autoCreate is true, persist it directly to tasks
    let createdTask = null;
    if (body.autoCreate) {
      createdTask = taskService.createTask({
        userId: DEFAULT_USER_ID,
        title: parsed.title,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
        estimatedMinutes: parsed.estimatedMinutes,
        status: 'todo',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        parsed,
        createdTask,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
