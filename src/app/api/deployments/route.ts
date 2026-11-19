import { NextResponse } from 'next/server';
import { deploymentService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const deployments = deploymentService.getDeployments(DEFAULT_USER_ID, projectId);
    return NextResponse.json({ success: true, data: deployments });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.environment || !body.versionTag) {
      return NextResponse.json(
        { success: false, error: 'environment and versionTag are required' },
        { status: 400 }
      );
    }

    const dep = deploymentService.recordDeployment({
      userId: DEFAULT_USER_ID,
      projectId: body.projectId,
      environment: body.environment,
      versionTag: body.versionTag,
      commitSha: body.commitSha,
      status: body.status,
      rollbackPlan: body.rollbackPlan,
    });

    return NextResponse.json({ success: true, data: dep }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
