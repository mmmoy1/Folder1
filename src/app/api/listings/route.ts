import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const listings = await db.getAllListings();
  return NextResponse.json(listings);
}
