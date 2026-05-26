import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const product = db.getProductById(params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const listings = db.getListingsForProduct(params.id);
  return NextResponse.json({ ...product, listings });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const product = db.updateProduct(params.id, body);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const success = db.deleteProduct(params.id);
  if (!success) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
