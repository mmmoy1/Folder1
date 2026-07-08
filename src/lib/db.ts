import { adminDb } from './firebase-admin';
import { Product, MarketplaceListing, PipelineJob, PipelineResult } from './types';

const PRODUCTS = 'products';
const LISTINGS = 'marketplace_listings';
const JOBS = 'pipeline_jobs';

function docToProduct(doc: FirebaseFirestore.DocumentSnapshot): Product {
  const d = doc.data()!;
  return {
    id: doc.id,
    name: d.name,
    description: d.description || '',
    price: d.price,
    compareAtPrice: d.compareAtPrice || undefined,
    sku: d.sku,
    category: d.category || '',
    tags: d.tags || [],
    images: d.images || [],
    inventory: d.inventory || 0,
    status: d.status || 'draft',
    escSpecs: d.escSpecs || undefined,
    createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || '',
    updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt || '',
  };
}

function docToListing(doc: FirebaseFirestore.DocumentSnapshot): MarketplaceListing {
  const d = doc.data()!;
  return {
    id: doc.id,
    productId: d.productId,
    marketplace: d.marketplace,
    externalId: d.externalId || undefined,
    status: d.status || 'pending',
    lastSyncedAt: d.lastSyncedAt?.toDate?.()?.toISOString?.() || d.lastSyncedAt || undefined,
    error: d.error || undefined,
    url: d.url || undefined,
    createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || '',
  };
}

function docToJob(doc: FirebaseFirestore.DocumentSnapshot): PipelineJob {
  const d = doc.data()!;
  return {
    id: doc.id,
    productId: d.productId,
    marketplaces: d.marketplaces || [],
    status: d.status || 'queued',
    results: d.results || [],
    createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || '',
    completedAt: d.completedAt?.toDate?.()?.toISOString?.() || d.completedAt || undefined,
  };
}

// Product CRUD

export async function getAllProducts(status?: string): Promise<Product[]> {
  let query: FirebaseFirestore.Query = adminDb.collection(PRODUCTS).orderBy('createdAt', 'desc');
  if (status) {
    query = query.where('status', '==', status);
  }
  const snap = await query.get();
  return snap.docs.map(docToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await adminDb.collection(PRODUCTS).doc(id).get();
  if (!doc.exists) return null;
  return docToProduct(doc);
}

export async function createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const now = new Date();
  const ref = adminDb.collection(PRODUCTS).doc(product.id);
  await ref.set({
    name: product.name,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice || null,
    sku: product.sku,
    category: product.category,
    tags: product.tags,
    images: product.images,
    inventory: product.inventory,
    status: product.status,
    escSpecs: product.escSpecs || null,
    createdAt: now,
    updatedAt: now,
  });
  return (await getProductById(product.id))!;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'escSpecs'>> & { escSpecs?: Product['escSpecs'] | null }
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const data: Record<string, any> = { updatedAt: new Date() };
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.price !== undefined) data.price = updates.price;
  if (updates.compareAtPrice !== undefined) data.compareAtPrice = updates.compareAtPrice;
  if (updates.sku !== undefined) data.sku = updates.sku;
  if (updates.category !== undefined) data.category = updates.category;
  if (updates.tags !== undefined) data.tags = updates.tags;
  if (updates.images !== undefined) data.images = updates.images;
  if (updates.inventory !== undefined) data.inventory = updates.inventory;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.escSpecs !== undefined) data.escSpecs = updates.escSpecs || null;

  await adminDb.collection(PRODUCTS).doc(id).update(data);
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const doc = await adminDb.collection(PRODUCTS).doc(id).get();
  if (!doc.exists) return false;

  const batch = adminDb.batch();
  batch.delete(adminDb.collection(PRODUCTS).doc(id));

  const listings = await adminDb.collection(LISTINGS).where('productId', '==', id).get();
  listings.docs.forEach(d => batch.delete(d.ref));
  const jobs = await adminDb.collection(JOBS).where('productId', '==', id).get();
  jobs.docs.forEach(d => batch.delete(d.ref));

  await batch.commit();
  return true;
}

// Marketplace Listings

export async function getListingsForProduct(productId: string): Promise<MarketplaceListing[]> {
  const snap = await adminDb.collection(LISTINGS)
    .where('productId', '==', productId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(docToListing);
}

export async function getAllListings(): Promise<MarketplaceListing[]> {
  const snap = await adminDb.collection(LISTINGS).orderBy('createdAt', 'desc').get();
  return snap.docs.map(docToListing);
}

export async function createListing(listing: Omit<MarketplaceListing, 'createdAt'>): Promise<MarketplaceListing> {
  const ref = adminDb.collection(LISTINGS).doc(listing.id);
  await ref.set({
    productId: listing.productId,
    marketplace: listing.marketplace,
    externalId: listing.externalId || null,
    status: listing.status,
    lastSyncedAt: listing.lastSyncedAt || null,
    error: listing.error || null,
    url: listing.url || null,
    createdAt: new Date(),
  });
  return (await getListingById(listing.id))!;
}

export async function getListingById(id: string): Promise<MarketplaceListing | null> {
  const doc = await adminDb.collection(LISTINGS).doc(id).get();
  if (!doc.exists) return null;
  return docToListing(doc);
}

export async function updateListing(id: string, updates: Partial<MarketplaceListing>): Promise<void> {
  const data: Record<string, any> = {};
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.externalId !== undefined) data.externalId = updates.externalId;
  if (updates.lastSyncedAt !== undefined) data.lastSyncedAt = updates.lastSyncedAt;
  if (updates.error !== undefined) data.error = updates.error;
  if (updates.url !== undefined) data.url = updates.url;

  if (Object.keys(data).length > 0) {
    await adminDb.collection(LISTINGS).doc(id).update(data);
  }
}

// Pipeline Jobs

export async function createPipelineJob(job: Omit<PipelineJob, 'createdAt' | 'completedAt'>): Promise<PipelineJob> {
  const ref = adminDb.collection(JOBS).doc(job.id);
  await ref.set({
    productId: job.productId,
    marketplaces: job.marketplaces,
    status: job.status,
    results: job.results,
    createdAt: new Date(),
    completedAt: null,
  });
  return (await getPipelineJobById(job.id))!;
}

export async function getPipelineJobById(id: string): Promise<PipelineJob | null> {
  const doc = await adminDb.collection(JOBS).doc(id).get();
  if (!doc.exists) return null;
  return docToJob(doc);
}

export async function getAllPipelineJobs(): Promise<PipelineJob[]> {
  const snap = await adminDb.collection(JOBS).orderBy('createdAt', 'desc').get();
  return snap.docs.map(docToJob);
}

export async function updatePipelineJob(
  id: string,
  updates: { status?: string; results?: PipelineResult[]; completedAt?: string }
): Promise<void> {
  const data: Record<string, any> = {};
  if (updates.status) data.status = updates.status;
  if (updates.results) data.results = updates.results;
  if (updates.completedAt) data.completedAt = new Date(updates.completedAt);

  if (Object.keys(data).length > 0) {
    await adminDb.collection(JOBS).doc(id).update(data);
  }
}

export async function getDashboardStats() {
  const [productsSnap, listingsSnap, jobsSnap] = await Promise.all([
    adminDb.collection(PRODUCTS).count().get(),
    adminDb.collection(LISTINGS).where('status', '==', 'active').count().get(),
    adminDb.collection(JOBS).where('status', 'in', ['queued', 'processing']).count().get(),
  ]);

  return {
    totalProducts: productsSnap.data().count,
    activeListings: listingsSnap.data().count,
    totalMarketplaces: 4,
    pendingJobs: jobsSnap.data().count,
  };
}
