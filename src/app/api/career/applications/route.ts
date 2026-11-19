import { NextResponse } from 'next/server';
import { careerService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET() {
  try {
    const apps = careerService.getApplications(DEFAULT_USER_ID);
    return NextResponse.json({ success: true, data: apps });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.company || !body.role) {
      return NextResponse.json(
        { success: false, error: 'company and role are required' },
        { status: 400 }
      );
    }

    const app = careerService.createApplication({
      userId: DEFAULT_USER_ID,
      company: body.company,
      role: body.role,
      stage: body.stage,
      salaryRange: body.salaryRange,
      location: body.location,
      appliedDate: body.appliedDate,
      nextInterviewDate: body.nextInterviewDate,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: app }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
