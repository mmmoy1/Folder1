import Database from 'better-sqlite3';
import path from 'path';
import { Product, MarketplaceListing, PipelineJob, PipelineResult } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'store.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables(db);
  }
  return db;
}

function initTables(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      compare_at_price REAL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      inventory INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      marketplace TEXT NOT NULL,
      external_id TEXT,
      status TEXT DEFAULT 'pending',
      last_synced_at TEXT,
      error TEXT,
      url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pipeline_jobs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      marketplaces TEXT NOT NULL,
      status TEXT DEFAULT 'queued',
      results TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    sku: row.sku,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    images: JSON.parse(row.images || '[]'),
    inventory: row.inventory,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToListing(row: any): MarketplaceListing {
  return {
    id: row.id,
    productId: row.product_id,
    marketplace: row.marketplace,
    externalId: row.external_id,
    status: row.status,
    lastSyncedAt: row.last_synced_at,
    error: row.error,
    url: row.url,
    createdAt: row.created_at,
  };
}

function rowToJob(row: any): PipelineJob {
  return {
    id: row.id,
    productId: row.product_id,
    marketplaces: JSON.parse(row.marketplaces || '[]'),
    status: row.status,
    results: JSON.parse(row.results || '[]'),
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

// Product CRUD
export function getAllProducts(status?: string): Product[] {
  const database = getDb();
  let rows;
  if (status) {
    rows = database.prepare('SELECT * FROM products WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    rows = database.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  }
  return rows.map(rowToProduct);
}

export function getProductById(id: string): Product | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return row ? rowToProduct(row) : null;
}

export function createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Product {
  const database = getDb();
  const now = new Date().toISOString();
  database.prepare(`
    INSERT INTO products (id, name, description, price, compare_at_price, sku, category, tags, images, inventory, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.id, product.name, product.description, product.price,
    product.compareAtPrice || null, product.sku, product.category,
    JSON.stringify(product.tags), JSON.stringify(product.images),
    product.inventory, product.status, now, now
  );
  return getProductById(product.id)!;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const database = getDb();
  const existing = getProductById(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  database.prepare(`
    UPDATE products SET name=?, description=?, price=?, compare_at_price=?, sku=?, category=?,
    tags=?, images=?, inventory=?, status=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    merged.name, merged.description, merged.price, merged.compareAtPrice || null,
    merged.sku, merged.category, JSON.stringify(merged.tags),
    JSON.stringify(merged.images), merged.inventory, merged.status, id
  );
  return getProductById(id);
}

export function deleteProduct(id: string): boolean {
  const database = getDb();
  const result = database.prepare('DELETE FROM products WHERE id = ?').run(id);
  return result.changes > 0;
}

// Marketplace Listings
export function getListingsForProduct(productId: string): MarketplaceListing[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM marketplace_listings WHERE product_id = ? ORDER BY created_at DESC').all(productId);
  return rows.map(rowToListing);
}

export function getAllListings(): MarketplaceListing[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM marketplace_listings ORDER BY created_at DESC').all();
  return rows.map(rowToListing);
}

export function createListing(listing: Omit<MarketplaceListing, 'createdAt'>): MarketplaceListing {
  const database = getDb();
  database.prepare(`
    INSERT INTO marketplace_listings (id, product_id, marketplace, external_id, status, last_synced_at, error, url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(listing.id, listing.productId, listing.marketplace, listing.externalId || null,
    listing.status, listing.lastSyncedAt || null, listing.error || null, listing.url || null);
  return getListingById(listing.id)!;
}

export function getListingById(id: string): MarketplaceListing | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM marketplace_listings WHERE id = ?').get(id);
  return row ? rowToListing(row) : null;
}

export function updateListing(id: string, updates: Partial<MarketplaceListing>): void {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) { fields.push('status=?'); values.push(updates.status); }
  if (updates.externalId !== undefined) { fields.push('external_id=?'); values.push(updates.externalId); }
  if (updates.lastSyncedAt !== undefined) { fields.push('last_synced_at=?'); values.push(updates.lastSyncedAt); }
  if (updates.error !== undefined) { fields.push('error=?'); values.push(updates.error); }
  if (updates.url !== undefined) { fields.push('url=?'); values.push(updates.url); }

  if (fields.length > 0) {
    values.push(id);
    database.prepare(`UPDATE marketplace_listings SET ${fields.join(', ')} WHERE id=?`).run(...values);
  }
}

// Pipeline Jobs
export function createPipelineJob(job: Omit<PipelineJob, 'createdAt' | 'completedAt'>): PipelineJob {
  const database = getDb();
  database.prepare(`
    INSERT INTO pipeline_jobs (id, product_id, marketplaces, status, results, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(job.id, job.productId, JSON.stringify(job.marketplaces), job.status, JSON.stringify(job.results));
  return getPipelineJobById(job.id)!;
}

export function getPipelineJobById(id: string): PipelineJob | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM pipeline_jobs WHERE id = ?').get(id);
  return row ? rowToJob(row) : null;
}

export function getAllPipelineJobs(): PipelineJob[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM pipeline_jobs ORDER BY created_at DESC').all();
  return rows.map(rowToJob);
}

export function updatePipelineJob(id: string, updates: { status?: string; results?: PipelineResult[]; completedAt?: string }): void {
  const database = getDb();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status) { fields.push('status=?'); values.push(updates.status); }
  if (updates.results) { fields.push('results=?'); values.push(JSON.stringify(updates.results)); }
  if (updates.completedAt) { fields.push('completed_at=?'); values.push(updates.completedAt); }

  if (fields.length > 0) {
    values.push(id);
    database.prepare(`UPDATE pipeline_jobs SET ${fields.join(', ')} WHERE id=?`).run(...values);
  }
}

export function getDashboardStats() {
  const database = getDb();
  const totalProducts = (database.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
  const activeListings = (database.prepare("SELECT COUNT(*) as count FROM marketplace_listings WHERE status = 'active'").get() as any).count;
  const pendingJobs = (database.prepare("SELECT COUNT(*) as count FROM pipeline_jobs WHERE status IN ('queued', 'processing')").get() as any).count;
  return { totalProducts, activeListings, totalMarketplaces: 4, pendingJobs };
}
