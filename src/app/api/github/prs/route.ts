import { NextResponse } from 'next/server';
import { githubService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = (searchParams.get('state') as any) || undefined;
  const prs = githubService.getPullRequests(DEFAULT_USER_ID, state);
  return NextResponse.json({ success: true, data: prs });
}

export async function POST(request: Request) {
  const body = await request.json();
  const pr = githubService.createPullRequest({
    repositoryId: body.repositoryId,
    taskId: body.taskId,
    githubPrId: body.githubPrId || Math.floor(Math.random() * 9000000) + 1000000,
    number: body.number || 1,
    title: body.title,
    state: body.state || 'open',
    authorLogin: body.authorLogin || 'developer',
    htmlUrl: body.htmlUrl || 'https://github.com',
    reviewStatus: body.reviewStatus || 'pending',
  });

  return NextResponse.json({ success: true, data: pr }, { status: 201 });
}
