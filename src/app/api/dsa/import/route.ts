import { NextResponse } from 'next/server';
import { dsaService, integrationService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // 1. Authenticated LeetCode Session Sync
    if (body.sessionToken) {
      const result = await integrationService.syncLeetCode(
        DEFAULT_USER_ID,
        body.username,
        body.sessionToken
      );
      return NextResponse.json({
        success: true,
        message: `Dynamic session sync completed: ${result.totalSolved} solved problems synchronized!`,
        data: result,
      });
    }

    // 2. Bulk JSON Array Import (e.g. from LeetHub repo or LeetCode export)
    if (Array.isArray(body.problems) && body.problems.length > 0) {
      const imported = dsaService.bulkImportProblems(DEFAULT_USER_ID, body.problems);
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${imported} problems into your DevOS workspace!`,
        count: imported,
      });
    }

    // 3. Raw Text / Pasted LeetCode URLs or titles
    if (typeof body.rawText === 'string' && body.rawText.trim().length > 0) {
      const lines = body.rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const problemsToImport: any[] = [];

      for (const line of lines) {
        let slug = '';
        let title = '';
        let difficulty = 'medium';

        const urlMatch = line.match(/problems\/([^\/\s]+)/);
        if (urlMatch) {
          slug = urlMatch[1];
          title = slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        } else {
          title = line.replace(/^\d+[\.\s]*/, ''); // strip leading "1. "
          slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        if (line.toLowerCase().includes('easy')) difficulty = 'easy';
        if (line.toLowerCase().includes('hard')) difficulty = 'hard';

        if (slug) {
          problemsToImport.push({
            title,
            slug,
            difficulty,
            status: 'solved',
            leetcodeUrl: `https://leetcode.com/problems/${slug}/`,
            neetcodeRoadmapFlag: false,
          });
        }
      }

      const imported = dsaService.bulkImportProblems(DEFAULT_USER_ID, problemsToImport);
      return NextResponse.json({
        success: true,
        message: `Successfully parsed and imported ${imported} problems dynamically!`,
        count: imported,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide sessionToken, problems array, or rawText' },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
