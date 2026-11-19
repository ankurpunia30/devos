import { NextResponse } from 'next/server';
import { githubService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  const repos = githubService.getRepositories(DEFAULT_USER_ID);
  return NextResponse.json({ success: true, data: repos });
}

export async function POST(request: Request) {
  const body = await request.json();
  const repo = githubService.connectRepository({
    userId: DEFAULT_USER_ID,
    projectId: body.projectId,
    githubRepoId: body.githubRepoId || Math.floor(Math.random() * 90000000) + 10000000,
    name: body.name,
    fullName: body.fullName || `${body.name}/${body.name}`,
    htmlUrl: body.htmlUrl || `https://github.com/${body.name}`,
    description: body.description,
    isPrivate: body.isPrivate,
    defaultBranch: body.defaultBranch || 'main',
    openIssuesCount: body.openIssuesCount || 0,
    stargazersCount: body.stargazersCount || 0,
  });

  return NextResponse.json({ success: true, data: repo }, { status: 201 });
}
