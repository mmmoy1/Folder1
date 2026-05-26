import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const job = await db.getPipelineJobById(params.id);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json(job);
}
