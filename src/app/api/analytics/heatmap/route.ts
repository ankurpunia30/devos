import { NextResponse } from 'next/server';
import { heatmapService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '60', 10);
  const heatmap = heatmapService.getHeatmap(DEFAULT_USER_ID, days);
  return NextResponse.json({ success: true, data: heatmap });
}
