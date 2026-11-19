import { NextResponse } from 'next/server';
import { projectService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  const projects = projectService.getProjects(DEFAULT_USER_ID);
  return NextResponse.json({ success: true, data: projects });
}

export async function POST(request: Request) {
  const body = await request.json();
  const project = projectService.createProject({
    userId: DEFAULT_USER_ID,
    name: body.name,
    description: body.description,
    category: body.category,
    techStack: body.techStack,
    architectureOverview: body.architectureOverview,
    targetCompletionDate: body.targetCompletionDate,
  });

  return NextResponse.json({ success: true, data: project }, { status: 201 });
}
