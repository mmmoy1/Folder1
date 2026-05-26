import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import * as db from '@/lib/db';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || undefined;
  const products = db.getAllProducts(status);
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = db.createProduct({
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
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
