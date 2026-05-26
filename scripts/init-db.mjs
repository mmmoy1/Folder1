import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString();
  credential = cert(JSON.parse(json));
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const keyPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (existsSync(keyPath)) {
    credential = cert(JSON.parse(readFileSync(keyPath, 'utf-8')));
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8')));
}

const appConfig = credential ? { credential } : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID };

if (!credential && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Error: No Firebase credentials found.');
  console.error('Set FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT_BASE64, or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  process.exit(1);
}

const app = initializeApp(appConfig);
const db = getFirestore(app);

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
    compareAtPrice: null,
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
    compareAtPrice: null,
    sku: 'HM-MUG4',
    category: 'Home',
    tags: ['ceramic', 'mug', 'handmade', 'kitchen', 'home decor'],
    inventory: 25,
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Extra-thick 6mm non-slip yoga mat made from eco-friendly TPE material. Excellent cushioning for joints, lightweight and portable. Comes with carrying strap.',
    price: 39.99,
    compareAtPrice: null,
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
    compareAtPrice: null,
    sku: 'AC-SOY3',
    category: 'Home',
    tags: ['candle', 'soy wax', 'home fragrance', 'artisan', 'gift'],
    inventory: 40,
  },
];

async function seed() {
  const batch = db.batch();
  const now = new Date();

  for (const p of sampleProducts) {
    const id = randomUUID();
    const imgUrl = `https://placehold.co/600x600/f0f7ff/0074c5?text=${encodeURIComponent(p.name.split(' ').slice(0, 2).join('\\n'))}`;

    const ref = db.collection('products').doc(id);
    batch.set(ref, {
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      sku: p.sku,
      category: p.category,
      tags: p.tags,
      images: [imgUrl],
      inventory: p.inventory,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`Seeded ${sampleProducts.length} sample products to Firestore`);
}

seed()
  .then(() => process.exit(0))
  .catch(err => { console.error('Seed failed:', err); process.exit(1); });
