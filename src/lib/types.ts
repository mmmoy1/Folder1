export type EscFormFactor = 'single' | '2-in-1' | '4-in-1' | '6-in-1' | '8-in-1';
export type EscControlType = 'FOC' | 'BLHeli_32' | 'AM32' | 'BLDC' | 'other';

/** Optional propulsion / ESC technical specs for UAV products. */
export interface EscSpecs {
  /** Number of motor channels on the board (1 = discrete ESC, 4 = 4-in-1, etc.). */
  channels: number;
  /** Human-readable form factor, e.g. "4-in-1". */
  formFactor: EscFormFactor;
  /** Continuous current rating per channel, in amps. */
  continuousCurrentA: number;
  /** Peak / burst current per channel, in amps (optional). */
  peakCurrentA?: number;
  /** Supported LiPo cell count range, e.g. "4-8S". */
  voltageRange: string;
  controlType: EscControlType;
  /** Whether a BEC is present. */
  bec: boolean;
  /** Throttle / signal refresh rate, e.g. "500Hz". */
  signalFrequency?: string;
  /** Mounting pattern, e.g. "30.5x30.5mm". */
  mountingPattern?: string;
  /** Firmware family when relevant. */
  firmware?: string;
}

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
  /** Present when the product is an ESC / multi-ESC propulsion controller. */
  escSpecs?: EscSpecs;
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
