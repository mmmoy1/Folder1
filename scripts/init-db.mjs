import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'store.db');

mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Features Bluetooth 5.3, comfortable memory foam earpads, and foldable design for portability.',
    price: 149.99,
    compareAtPrice: 199.99,
    sku: 'WH-NC1000',
    category: 'Electronics',
    tags: ['wireless', 'headphones', 'noise-canceling', 'bluetooth', 'audio'],
    inventory: 45,
  },
  {
    name: 'Minimalist Leather Watch',
    description: 'Elegant minimalist watch with genuine Italian leather strap and Japanese quartz movement. Sapphire crystal glass, water-resistant to 50m, and ultra-slim 7mm profile.',
    price: 89.99,
    compareAtPrice: 120.00,
    sku: 'MW-LTH200',
    category: 'Jewelry',
    tags: ['watch', 'leather', 'minimalist', 'accessories'],
    inventory: 30,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Super soft organic cotton t-shirt made from 100% GOTS-certified organic cotton. Pre-shrunk, breathable, and ethically manufactured. Available in multiple colors.',
    price: 29.99,
    sku: 'OC-TEE100',
    category: 'Clothing',
    tags: ['organic', 'cotton', 't-shirt', 'sustainable', 'clothing'],
    inventory: 120,
  },
  {
    name: 'Smart Home Security Camera',
    description: '2K HDR indoor/outdoor security camera with night vision, two-way audio, and motion detection. Works with Alexa and Google Home. Includes free cloud storage.',
    price: 69.99,
    compareAtPrice: 99.99,
    sku: 'SC-2KHDR',
    category: 'Electronics',
    tags: ['smart home', 'security', 'camera', 'surveillance', '2k'],
    inventory: 55,
  },
  {
    name: 'Handmade Ceramic Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs with unique glazed finishes. Microwave and dishwasher safe. Each mug holds 12oz and features a comfortable ergonomic handle.',
    price: 44.99,
    sku: 'HM-MUG4',
    category: 'Home',
    tags: ['ceramic', 'mug', 'handmade', 'kitchen', 'home decor'],
    inventory: 25,
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Extra-thick 6mm non-slip yoga mat made from eco-friendly TPE material. Excellent cushioning for joints, lightweight and portable. Comes with carrying strap.',
    price: 39.99,
    sku: 'YM-PRO6',
    category: 'Sports',
    tags: ['yoga', 'fitness', 'mat', 'exercise', 'eco-friendly'],
    inventory: 80,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof IPX7 portable speaker with 360-degree sound, 24-hour battery life, and built-in microphone. Pairs two speakers for stereo sound.',
    price: 59.99,
    compareAtPrice: 79.99,
    sku: 'BS-PORT360',
    category: 'Electronics',
    tags: ['speaker', 'bluetooth', 'waterproof', 'portable', 'audio'],
    inventory: 65,
  },
  {
    name: 'Artisan Scented Candle Collection',
    description: 'Collection of 3 hand-poured soy wax candles in amber glass jars. Scents include Lavender Fields, Vanilla Bean, and Cedar Wood. Each candle burns for 50+ hours.',
    price: 34.99,
    sku: 'AC-SOY3',
    category: 'Home',
    tags: ['candle', 'soy wax', 'home fragrance', 'artisan', 'gift'],
    inventory: 40,
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, description, price, compare_at_price, sku, category, tags, images, inventory, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
`);

for (const p of sampleProducts) {
  const id = randomUUID();
  const imgUrl = `https://placehold.co/600x600/f0f7ff/0074c5?text=${encodeURIComponent(p.name.split(' ').slice(0, 2).join('\\n'))}`;
  insert.run(
    id, p.name, p.description, p.price, p.compareAtPrice || null,
    p.sku, p.category, JSON.stringify(p.tags), JSON.stringify([imgUrl]),
    p.inventory
  );
}

console.log(`Database initialized with ${sampleProducts.length} sample products at ${dbPath}`);
db.close();
