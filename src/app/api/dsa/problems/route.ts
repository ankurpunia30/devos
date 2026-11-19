import { NextResponse } from 'next/server';
import { dsaService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topicId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const difficulty = (searchParams.get('difficulty') as any) || undefined;

  const problems = dsaService.getProblems(DEFAULT_USER_ID, { topicId, status, difficulty });
  return NextResponse.json({ success: true, data: problems });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.title && !body.url && !body.leetcodeUrl) {
      return NextResponse.json(
        { success: false, error: 'Problem title or LeetCode URL is required' },
        { status: 400 }
      );
    }

    let title = body.title;
    let slug = body.slug;
    let url = body.url || body.leetcodeUrl;

    if (url && !slug) {
      const match = url.match(/problems\/([^\/\s]+)/);
      if (match) slug = match[1];
    }
    if (slug && !title) {
      title = slug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    if (!url && slug) {
      url = `https://leetcode.com/problems/${slug}/`;
    }

    const created = dsaService.createProblem(DEFAULT_USER_ID, {
      title: title || 'Custom Problem',
      slug: slug || 'custom-problem',
      difficulty: body.difficulty || 'medium',
      topicId: body.topicId || undefined,
      leetcodeUrl: url || '',
      status: body.status || 'solved',
      notes: body.notes,
      approachSummary: body.approachSummary,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
