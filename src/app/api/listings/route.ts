import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  const listings = db.getAllListings();
  return NextResponse.json(listings);
}
