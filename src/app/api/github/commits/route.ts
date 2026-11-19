import { NextResponse } from 'next/server';
import { githubService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const commits = githubService.getRecentCommits(DEFAULT_USER_ID, limit);
  return NextResponse.json({ success: true, data: commits });
}

export async function POST(request: Request) {
  const body = await request.json();
  const commit = githubService.recordCommit({
    repositoryId: body.repositoryId,
    sha: body.sha || Math.random().toString(36).substring(2, 9),
    message: body.message,
    authorName: body.authorName || 'Lead Engineer',
    authorEmail: body.authorEmail || 'developer@devos.local',
    htmlUrl: body.htmlUrl || 'https://github.com',
    committedAt: body.committedAt,
  });

  return NextResponse.json({ success: true, data: commit }, { status: 201 });
}
