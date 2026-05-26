# MarketFlow - Multi-Marketplace E-Commerce Pipeline

A full-stack e-commerce application with a multi-marketplace publishing pipeline, powered by Firebase. Upload products with images, publish to eBay, Amazon, Etsy, and Shopify from a single dashboard, and sell through an integrated storefront.

## Features

### Full-Screen Hero with Background Video
- Looping background video with overlay slider
- 3-slide carousel with auto-advance, dot navigation, and arrow controls
- Transparent navbar that solidifies on scroll

### E-Commerce Storefront
- Product listing with category, pricing, and inventory display
- Product detail pages with image galleries
- Shopping cart with quantity management
- Checkout flow with shipping and payment forms

### Admin Dashboard
- Dashboard with key metrics
- Full product management (create, edit, delete)
- Image upload to Firebase Storage
- Product status management (draft, active, archived)

### Multi-Marketplace Pipeline
- **eBay** — Publish listings with automatic category mapping
- **Amazon** — Create listings via SP-API format
- **Etsy** — Sync products with taxonomy support
- **Shopify** — Push products with variant support
- Real-time pipeline status tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting
- **Auth**: Firebase Admin SDK (server-side)

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project ([create one here](https://console.firebase.google.com/))
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Clone & Install

```bash
git clone <repo-url>
cd ecommerce-pipeline
npm install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one)
2. Enable **Firestore Database** (start in test mode)
3. Enable **Storage** (start in test mode)
4. Go to **Project Settings > General > Your apps** and add a Web app
5. Copy the config values

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Firebase Admin (Server-Side)

Generate a service account key:
1. Go to **Project Settings > Service Accounts**
2. Click **Generate new private key**
3. Save the file as `service-account-key.json` in the project root

Add to `.env.local`:
```env
FIREBASE_SERVICE_ACCOUNT_KEY=./service-account-key.json
```

### 5. Seed Sample Data

```bash
npm run db:seed
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### 7. Deploy to Firebase

```bash
# Login to Firebase
firebase login

# Set your project
firebase use your-project-id

# Deploy everything (hosting, firestore rules, storage rules)
npm run deploy
```

Or deploy individually:
```bash
npm run deploy:hosting    # Deploy the Next.js app
npm run deploy:firestore  # Deploy Firestore rules & indexes
npm run deploy:storage    # Deploy Storage rules
```

## Project Structure

```
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── storage.rules               # Firebase Storage rules
├── .env.example                # Environment variable template
├── scripts/
│   └── init-db.mjs             # Firestore seed script
└── src/
    ├── app/
    │   ├── page.tsx                    # Storefront home (hero slider)
    │   ├── products/                   # Product listing & detail
    │   ├── cart/                       # Shopping cart
    │   ├── checkout/                   # Checkout flow
    │   ├── admin/
    │   │   ├── page.tsx                # Admin dashboard
    │   │   ├── products/               # Product management
    │   │   ├── pipeline/               # Pipeline job viewer
    │   │   └── settings/               # Marketplace settings
    │   └── api/
    │       ├── products/               # Product CRUD API
    │       ├── upload/                 # Firebase Storage upload API
    │       ├── pipeline/               # Pipeline execution API
    │       ├── listings/               # Marketplace listings API
    │       └── stats/                  # Dashboard statistics API
    ├── components/
    │   ├── HeroSlider.tsx             # Full-screen video hero slider
    │   ├── CartProvider.tsx            # Cart state (Context)
    │   ├── Navbar.tsx                  # Transparent/solid navbar
    │   ├── ProductCard.tsx             # Product card
    │   └── Footer.tsx                  # Site footer
    └── lib/
        ├── types.ts                    # TypeScript types
        ├── firebase.ts                 # Firebase client SDK
        ├── firebase-admin.ts           # Firebase Admin SDK
        ├── db.ts                       # Firestore data layer
        └── marketplace/
            ├── index.ts                # Pipeline orchestrator
            ├── ebay.ts                 # eBay connector
            ├── amazon.ts               # Amazon connector
            ├── etsy.ts                 # Etsy connector
            └── shopify.ts              # Shopify connector
```

## Deployment Notes

- The app deploys to **Firebase Hosting** with **Cloud Functions** for server-side rendering
- Firestore rules are set to allow all reads/writes for demo purposes — tighten these for production
- Marketplace connectors run in simulation mode — add real API credentials in Settings for production use
- Set environment variables in Firebase: `firebase functions:config:set` or use the Firebase Console
