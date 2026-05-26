import { v4 as uuid } from 'uuid';
import { Product, MarketplaceType, MarketplaceConfig, PipelineJob, PipelineResult } from '../types';
import { publishToEbay } from './ebay';
import { publishToAmazon } from './amazon';
import { publishToEtsy } from './etsy';
import { publishToShopify } from './shopify';
import * as db from '../db';

export const MARKETPLACE_CONFIGS: MarketplaceConfig[] = [
  {
    type: 'ebay',
    name: 'eBay',
    enabled: true,
    icon: '🏷️',
    color: '#E53238',
  },
  {
    type: 'amazon',
    name: 'Amazon',
    enabled: true,
    icon: '📦',
    color: '#FF9900',
  },
  {
    type: 'etsy',
    name: 'Etsy',
    enabled: true,
    icon: '🎨',
    color: '#F1641E',
  },
  {
    type: 'shopify',
    name: 'Shopify',
    enabled: true,
    icon: '🛍️',
    color: '#96BF48',
  },
];

const publishers: Record<MarketplaceType, (product: Product) => Promise<PipelineResult>> = {
  ebay: publishToEbay,
  amazon: publishToAmazon,
  etsy: publishToEtsy,
  shopify: publishToShopify,
};

export async function runPipeline(
  product: Product,
  marketplaces: MarketplaceType[]
): Promise<PipelineJob> {
  const jobId = uuid();
  const job = db.createPipelineJob({
    id: jobId,
    productId: product.id,
    marketplaces,
    status: 'processing',
    results: [],
  });

  const results: PipelineResult[] = [];

  for (const marketplace of marketplaces) {
    const publisher = publishers[marketplace];
    if (!publisher) {
      results.push({
        marketplace,
        status: 'failed',
        error: `No publisher found for ${marketplace}`,
      });
      continue;
    }

    try {
      const listingId = uuid();
      db.createListing({
        id: listingId,
        productId: product.id,
        marketplace,
        status: 'syncing',
      });

      const result = await publisher(product);
      results.push(result);

      db.updateListing(listingId, {
        status: result.status === 'success' ? 'active' : 'failed',
        externalId: result.externalId,
        url: result.url,
        error: result.error,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      results.push({
        marketplace,
        status: 'failed',
        error: err.message || 'Unknown error',
      });
    }
  }

  const allSuccess = results.every(r => r.status === 'success');
  const allFailed = results.every(r => r.status === 'failed');

  db.updatePipelineJob(jobId, {
    status: allFailed ? 'failed' : 'completed',
    results,
    completedAt: new Date().toISOString(),
  });

  return db.getPipelineJobById(jobId)!;
}

export function getMarketplaceConfig(type: MarketplaceType): MarketplaceConfig | undefined {
  return MARKETPLACE_CONFIGS.find(c => c.type === type);
}
