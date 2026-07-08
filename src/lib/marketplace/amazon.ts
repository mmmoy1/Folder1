import { Product, PipelineResult } from '../types';
import { enrichDescriptionWithEscSpecs } from '../esc';

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
  const description = enrichDescriptionWithEscSpecs(product);
  return {
    itemType: 'STANDARD',
    title: product.name,
    bulletPoints: description.split(/[.\n]/).map(s => s.trim()).filter(Boolean).slice(0, 5),
    description,
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
    attributes: product.escSpecs
      ? {
          esc_channels: product.escSpecs.channels,
          esc_form_factor: product.escSpecs.formFactor,
          continuous_current_amps: product.escSpecs.continuousCurrentA,
          voltage_range: product.escSpecs.voltageRange,
          control_type: product.escSpecs.controlType,
        }
      : undefined,
  };
}
