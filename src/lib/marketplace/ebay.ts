import { Product, PipelineResult } from '../types';

export async function publishToEbay(product: Product): Promise<PipelineResult> {
  // Simulate eBay API call with realistic delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  const success = Math.random() > 0.1; // 90% success rate simulation
  const externalId = `EBAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (success) {
    return {
      marketplace: 'ebay',
      status: 'success',
      externalId,
      url: `https://www.ebay.com/itm/${externalId}`,
    };
  }

  return {
    marketplace: 'ebay',
    status: 'failed',
    error: 'eBay API: Rate limit exceeded. Please retry in 60 seconds.',
  };
}

export function formatForEbay(product: Product) {
  return {
    title: product.name.slice(0, 80),
    description: product.description,
    price: { value: product.price.toFixed(2), currency: 'USD' },
    categoryId: getCategoryMapping(product.category),
    condition: 'NEW',
    quantity: product.inventory,
    images: product.images,
    sku: product.sku,
    listingType: 'FixedPrice',
    shippingOptions: [{ type: 'FLAT_RATE', cost: '0.00', additionalCost: '0.00' }],
  };
}

function getCategoryMapping(category: string): string {
  const map: Record<string, string> = {
    'electronics': '293',
    'clothing': '11450',
    'home': '11700',
    'sports': '888',
    'toys': '220',
    'books': '267',
    'jewelry': '281',
    'automotive': '6000',
  };
  return map[category.toLowerCase()] || '99';
}
