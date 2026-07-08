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

/**
 * UAV propulsion catalog focused on multi-ESC (4-in-1) boards.
 * The former single-channel ALPHA 60A 24S FOC ESC listing is replaced by
 * multi-channel ESC SKUs suitable for multirotor builds.
 */
const sampleProducts = [
  {
    name: 'T-MOTOR Cine 80A 8S 4-in-1 ESC',
    description:
      'Compact 4-in-1 ESC for FPV cinelifters. STM32G071 MCU, AM32 firmware, dual parallel MOSFET groups for lower heat, dual TVS protection, and anti-loose connectors. Replaces discrete single ESCs with one multi-ESC board on a 30.5×30.5mm stack.',
    price: 306.90,
    compareAtPrice: 339.90,
    sku: 'TM-C80A-4IN1',
    category: 'UAV Propulsion',
    tags: ['t-motor', '4-in-1', 'multi-esc', 'am32', 'cine', 'fpv', '80a', '8s'],
    inventory: 28,
    escSpecs: {
      channels: 4,
      formFactor: '4-in-1',
      continuousCurrentA: 80,
      peakCurrentA: 90,
      voltageRange: '4-8S',
      controlType: 'AM32',
      bec: false,
      mountingPattern: '30.5x30.5mm',
      firmware: 'AM32',
    },
  },
  {
    name: 'T-MOTOR F55A PRO III 55A 3-8S 4-in-1 ESC',
    description:
      'High-performance 4-in-1 ESC for 5-inch freestyle and racing multirotors. BLHeli_32 / AM32-class drive, 55A continuous per channel, 3–8S input. One multi-ESC board replaces four discrete ESCs for cleaner wiring and stack mounting.',
    price: 89.90,
    compareAtPrice: 109.90,
    sku: 'TM-F55A-PRO3-4IN1',
    category: 'UAV Propulsion',
    tags: ['t-motor', '4-in-1', 'multi-esc', 'blheli32', 'racing', '55a', 'fpv'],
    inventory: 64,
    escSpecs: {
      channels: 4,
      formFactor: '4-in-1',
      continuousCurrentA: 55,
      peakCurrentA: 70,
      voltageRange: '3-8S',
      controlType: 'BLHeli_32',
      bec: false,
      mountingPattern: '30.5x30.5mm',
      firmware: 'BLHeli_32',
    },
  },
  {
    name: 'T-MOTOR P60A V2 60A 3-6S 4-in-1 ESC',
    description:
      '60A continuous 4-in-1 ESC for 6–7 inch long-range platforms. Multi-ESC layout with 3–6S support — a direct multi-channel alternative when stepping away from a single ALPHA-class discrete ESC on smaller airframes.',
    price: 79.90,
    compareAtPrice: 99.90,
    sku: 'TM-P60A-V2-4IN1',
    category: 'UAV Propulsion',
    tags: ['t-motor', '4-in-1', 'multi-esc', 'long-range', '60a', '6s'],
    inventory: 42,
    escSpecs: {
      channels: 4,
      formFactor: '4-in-1',
      continuousCurrentA: 60,
      peakCurrentA: 75,
      voltageRange: '3-6S',
      controlType: 'BLHeli_32',
      bec: false,
      mountingPattern: '30.5x30.5mm',
      firmware: 'BLHeli_32',
    },
  },
  {
    name: 'T-MOTOR Velox V50A SE 4-in-1 ESC',
    description:
      'Lightweight V50A SE 4-in-1 ESC for cine and freestyle stacks. Multi-ESC board with secure mounting and clean signal routing for F7 flight-controller stacks.',
    price: 69.90,
    compareAtPrice: null,
    sku: 'TM-V50A-SE-4IN1',
    category: 'UAV Propulsion',
    tags: ['t-motor', '4-in-1', 'multi-esc', 'velox', '50a', 'cine'],
    inventory: 51,
    escSpecs: {
      channels: 4,
      formFactor: '4-in-1',
      continuousCurrentA: 50,
      peakCurrentA: 60,
      voltageRange: '3-6S',
      controlType: 'BLHeli_32',
      bec: false,
      mountingPattern: '30.5x30.5mm',
      firmware: 'BLHeli_32',
    },
  },
  {
    name: 'T-MOTOR ALPHA 60A 12S FOC ESC (Single)',
    description:
      'Industrial FOC single-channel ESC for heavy-lift multirotors (6–12S). Low noise sine-wave drive. Prefer multi-ESC (4-in-1) SKUs for compact FPV builds; keep this discrete unit for HV industrial airframes that need one ESC per motor.',
    price: 189.90,
    compareAtPrice: 219.90,
    sku: 'TM-ALPHA-60A-12S',
    category: 'UAV Propulsion',
    tags: ['t-motor', 'alpha', 'foc', 'single-esc', '12s', '60a', 'industrial'],
    inventory: 36,
    escSpecs: {
      channels: 1,
      formFactor: 'single',
      continuousCurrentA: 60,
      peakCurrentA: 80,
      voltageRange: '6-12S',
      controlType: 'FOC',
      bec: false,
      signalFrequency: '500Hz',
      firmware: 'ALPHA FOC',
    },
  },
  {
    name: 'T-MOTOR 4-in-1 ESC Wiring Harness Kit',
    description:
      'Motor and signal harness kit for converting discrete single-ESC builds to a multi-ESC (4-in-1) stack. Includes XT60 input lead, capacitor, and 4× motor bullet adapters.',
    price: 24.90,
    compareAtPrice: null,
    sku: 'TM-4IN1-HARNESS',
    category: 'UAV Propulsion',
    tags: ['t-motor', '4-in-1', 'multi-esc', 'harness', 'accessories'],
    inventory: 120,
    escSpecs: null,
  },
  {
    name: 'MN501-S KV240 Propulsion Motor',
    description:
      'Matched T-MOTOR propulsion motor for multirotor builds using multi-ESC or discrete FOC ESCs. Smooth FOC-friendly windings for mapping and inspection platforms.',
    price: 129.90,
    compareAtPrice: 149.90,
    sku: 'TM-MN501S-KV240',
    category: 'UAV Propulsion',
    tags: ['t-motor', 'motor', 'mn501', 'propulsion', 'uav'],
    inventory: 40,
    escSpecs: null,
  },
  {
    name: 'Carbon Prop 18×6.5 Pair',
    description:
      'Balanced carbon fiber propeller pair for heavy-lift and long-endurance multirotors. Pair with multi-ESC or ALPHA FOC propulsion stacks.',
    price: 34.90,
    compareAtPrice: null,
    sku: 'TM-PROP-1865',
    category: 'UAV Propulsion',
    tags: ['propeller', 'carbon', 'uav', 't-motor'],
    inventory: 90,
    escSpecs: null,
  },
];

async function seed() {
  const batch = db.batch();
  const now = new Date();

  for (const p of sampleProducts) {
    const id = randomUUID();
    const imgUrl = `https://placehold.co/600x600/0b1f33/7dd3fc?text=${encodeURIComponent(p.name.split(' ').slice(0, 3).join('\\n'))}`;

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
      escSpecs: p.escSpecs,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  const multiCount = sampleProducts.filter(p => p.escSpecs && p.escSpecs.channels > 1).length;
  console.log(`Seeded ${sampleProducts.length} products (${multiCount} multi-ESC) to Firestore`);
}

seed()
  .then(() => process.exit(0))
  .catch(err => { console.error('Seed failed:', err); process.exit(1); });
