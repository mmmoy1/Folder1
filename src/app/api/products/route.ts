import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import * as db from '@/lib/db';
import { parseEscSpecs } from '@/lib/esc';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || undefined;
  const multiEsc = request.nextUrl.searchParams.get('multiEsc');
  let products = await db.getAllProducts(status);
  if (multiEsc === '1' || multiEsc === 'true') {
    products = products.filter(p => p.escSpecs && p.escSpecs.channels > 1);
  }
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await db.createProduct({
      id: uuid(),
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
      sku: body.sku || `SKU-${Date.now()}`,
      category: body.category || '',
      tags: body.tags || [],
      images: body.images || [],
      inventory: parseInt(body.inventory) || 0,
      status: body.status || 'draft',
      escSpecs: parseEscSpecs(body.escSpecs),
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
