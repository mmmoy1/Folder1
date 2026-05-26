export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: string;
  tags: string[];
  images: string[];
  inventory: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface MarketplaceListing {
  id: string;
  productId: string;
  marketplace: MarketplaceType;
  externalId?: string;
  status: 'pending' | 'syncing' | 'active' | 'failed' | 'removed';
  lastSyncedAt?: string;
  error?: string;
  url?: string;
  createdAt: string;
}

export type MarketplaceType = 'ebay' | 'amazon' | 'etsy' | 'shopify';

export interface MarketplaceConfig {
  type: MarketplaceType;
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
  icon: string;
  color: string;
}

export interface PipelineJob {
  id: string;
  productId: string;
  marketplaces: MarketplaceType[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  results: PipelineResult[];
  createdAt: string;
  completedAt?: string;
}

export interface PipelineResult {
  marketplace: MarketplaceType;
  status: 'success' | 'failed';
  externalId?: string;
  url?: string;
  error?: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeListings: number;
  totalMarketplaces: number;
  pendingJobs: number;
}
