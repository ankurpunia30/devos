import { NextResponse } from 'next/server';
import { projectService, taskService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workspace = projectService.getProjectWorkspace(id, DEFAULT_USER_ID);

  if (!workspace) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: workspace });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.status) {
    const updated = projectService.updateProjectStatus(id, DEFAULT_USER_ID, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  }

  if (body.linkRepoFullName) {
    const repoId = projectService.linkRepository(id, body.linkRepoFullName, DEFAULT_USER_ID);
    const workspace = projectService.getProjectWorkspace(id, DEFAULT_USER_ID);
    return NextResponse.json({ success: true, data: workspace });
  }

  if (body.toggleMilestoneId !== undefined) {
    projectService.toggleMilestone(body.toggleMilestoneId, body.isCompleted);
    const workspace = projectService.getProjectWorkspace(id, DEFAULT_USER_ID);
    return NextResponse.json({ success: true, data: workspace });
  }

  return NextResponse.json({ success: false, error: 'Invalid update payload' }, { status: 400 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.type === 'milestone') {
    const milestone = projectService.addMilestone({
      projectId: id,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
    });
    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
  }

  if (body.type === 'task') {
    const task = taskService.createTask({
      userId: DEFAULT_USER_ID,
      projectId: id,
      title: body.title,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'todo',
      tags: body.tags || [],
      estimatedMinutes: body.estimatedMinutes || 30,
    });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  }

  return NextResponse.json({ success: false, error: 'Invalid payload type' }, { status: 400 });
}
