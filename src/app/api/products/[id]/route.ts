import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { parseEscSpecs } from '@/lib/esc';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const product = await db.getProductById(params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const listings = await db.getListingsForProduct(params.id);
  return NextResponse.json({ ...product, listings });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updates = { ...body };
    if ('escSpecs' in body) {
      updates.escSpecs = body.escSpecs === null ? null : parseEscSpecs(body.escSpecs);
    }
    const product = await db.updateProduct(params.id, updates);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const success = await db.deleteProduct(params.id);
  if (!success) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
