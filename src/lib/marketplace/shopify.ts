import { Product, PipelineResult } from '../types';
import { enrichDescriptionWithEscSpecs, formatEscChannels } from '../esc';

export async function publishToShopify(product: Product): Promise<PipelineResult> {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));

  const success = Math.random() > 0.05;
  const externalId = `gid://shopify/Product/${Math.floor(Math.random() * 90000000) + 10000000}`;

  if (success) {
    const handle = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      marketplace: 'shopify',
      status: 'success',
      externalId,
      url: `https://your-store.myshopify.com/products/${handle}`,
    };
  }

  return {
    marketplace: 'shopify',
    status: 'failed',
    error: 'Shopify API: Authentication token expired. Reconnect your store.',
  };
}

export function formatForShopify(product: Product) {
  const description = enrichDescriptionWithEscSpecs(product);
  const escTags = product.escSpecs
    ? [formatEscChannels(product.escSpecs), product.escSpecs.controlType, 'multi-esc', 'uav']
    : [];
  return {
    product: {
      title: product.name,
      body_html: `<p>${description.replace(/\n/g, '<br/>')}</p>`,
      vendor: 'My Store',
      product_type: product.category,
      tags: Array.from(new Set([...product.tags, ...escTags])).join(', '),
      status: 'active',
      variants: [{
        price: product.price.toFixed(2),
        compare_at_price: product.compareAtPrice?.toFixed(2) || null,
        sku: product.sku,
        inventory_quantity: product.inventory,
        inventory_management: 'shopify',
      }],
      images: product.images.map(src => ({ src })),
      metafields: product.escSpecs
        ? [
            { namespace: 'esc', key: 'channels', value: String(product.escSpecs.channels), type: 'number_integer' },
            { namespace: 'esc', key: 'form_factor', value: product.escSpecs.formFactor, type: 'single_line_text_field' },
            { namespace: 'esc', key: 'voltage_range', value: product.escSpecs.voltageRange, type: 'single_line_text_field' },
            { namespace: 'esc', key: 'control_type', value: product.escSpecs.controlType, type: 'single_line_text_field' },
          ]
        : [],
    },
  };
}
