import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { runPipeline } from '@/lib/marketplace';
import { MarketplaceType } from '@/lib/types';

export async function GET() {
  const jobs = await db.getAllPipelineJobs();
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, marketplaces } = body as {
      productId: string;
      marketplaces: MarketplaceType[];
    };

    if (!productId || !marketplaces?.length) {
      return NextResponse.json(
        { error: 'productId and marketplaces are required' },
        { status: 400 }
      );
    }

    const product = await db.getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'active') {
      await db.updateProduct(productId, { status: 'active' });
    }

    const job = await runPipeline(product, marketplaces);
    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
