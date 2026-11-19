import { NextResponse } from 'next/server';
import { careerService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const questions = careerService.getQuestions(DEFAULT_USER_ID, category);
    return NextResponse.json({ success: true, data: questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.question) {
      return NextResponse.json({ success: false, error: 'question is required' }, { status: 400 });
    }

    const q = careerService.createQuestion({
      userId: DEFAULT_USER_ID,
      question: body.question,
      company: body.company,
      category: body.category,
      starSituation: body.starSituation,
      starTask: body.starTask,
      starAction: body.starAction,
      starResult: body.starResult,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: q }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
