import { Product, PipelineResult } from '../types';
import { enrichDescriptionWithEscSpecs } from '../esc';

export async function publishToEtsy(product: Product): Promise<PipelineResult> {
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 1000));

  const success = Math.random() > 0.08;
  const externalId = `${Math.floor(Math.random() * 9000000000) + 1000000000}`;

  if (success) {
    return {
      marketplace: 'etsy',
      status: 'success',
      externalId,
      url: `https://www.etsy.com/listing/${externalId}`,
    };
  }

  return {
    marketplace: 'etsy',
    status: 'failed',
    error: 'Etsy API: Listing creation failed. Shop may need verification.',
  };
}

export function formatForEtsy(product: Product) {
  const escTags = product.escSpecs
    ? [
        product.escSpecs.formFactor,
        `${product.escSpecs.channels}ch`,
        product.escSpecs.controlType,
        product.escSpecs.voltageRange,
        'esc',
        'uav',
      ]
    : [];
  return {
    title: product.name.slice(0, 140),
    description: enrichDescriptionWithEscSpecs(product),
    price: product.price,
    quantity: product.inventory,
    sku: [product.sku],
    tags: Array.from(new Set([...product.tags, ...escTags])).slice(0, 13),
    images: product.images,
    whoMadeIt: 'someone_else',
    whenMadeIt: 'made_to_order',
    taxonomyId: getEtsyTaxonomy(product.category),
    shippingProfileId: null,
    state: 'draft',
  };
}

function getEtsyTaxonomy(category: string): number {
  const map: Record<string, number> = {
    'electronics': 112,
    'clothing': 1,
    'home': 891,
    'sports': 1281,
    'toys': 1281,
    'books': 589,
    'jewelry': 68,
    'art': 1,
  };
  return map[category.toLowerCase()] || 1;
}
