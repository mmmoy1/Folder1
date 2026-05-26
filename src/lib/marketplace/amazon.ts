import { Product, PipelineResult } from '../types';

export async function publishToAmazon(product: Product): Promise<PipelineResult> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

  const success = Math.random() > 0.12;
  const externalId = `ASIN-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

  if (success) {
    return {
      marketplace: 'amazon',
      status: 'success',
      externalId,
      url: `https://www.amazon.com/dp/${externalId}`,
    };
  }

  return {
    marketplace: 'amazon',
    status: 'failed',
    error: 'Amazon SP-API: Product data validation failed. Check required attributes.',
  };
}

export function formatForAmazon(product: Product) {
  return {
    itemType: 'STANDARD',
    title: product.name,
    bulletPoints: product.description.split('. ').slice(0, 5),
    description: product.description,
    price: { amount: product.price, currencyCode: 'USD' },
    quantity: product.inventory,
    sku: product.sku,
    images: product.images.map((url, i) => ({
      url,
      type: i === 0 ? 'MAIN' : 'PT' + i,
    })),
    productCategory: product.category,
    condition: { value: 'New' },
    fulfillmentChannel: 'MFN',
  };
}
