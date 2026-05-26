# MarketFlow - Multi-Marketplace E-Commerce Pipeline

A full-stack e-commerce application with a multi-marketplace publishing pipeline. Upload products with images, publish to eBay, Amazon, Etsy, and Shopify from a single dashboard, and sell through an integrated storefront.

## Features

### E-Commerce Storefront
- Product listing with category, pricing, and inventory display
- Product detail pages with image galleries
- Shopping cart with quantity management
- Checkout flow with shipping and payment forms
- Responsive design for all screen sizes

### Admin Dashboard
- Dashboard with key metrics (products, listings, marketplace count, pending jobs)
- Full product management (create, edit, delete)
- Image upload with multi-file support
- Product status management (draft, active, archived)

### Multi-Marketplace Pipeline
- **eBay** - Publish listings to eBay with automatic category mapping
- **Amazon** - Create Amazon product listings via SP-API format
- **Etsy** - Sync products to Etsy shops with taxonomy support
- **Shopify** - Push products to Shopify stores with variant support
- Real-time pipeline status tracking with per-marketplace results
- Marketplace listing management with external IDs and URLs

### Settings
- Marketplace connection management
- Pipeline configuration (auto-publish, retry, inventory sync)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via better-sqlite3)
- **Image Handling**: File upload with UUID naming

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Seed Sample Data

```bash
npm run db:init
```

This creates a SQLite database with 8 sample products.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Storefront home
│   ├── products/                   # Product listing & detail pages
│   ├── cart/                       # Shopping cart
│   ├── checkout/                   # Checkout flow
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── products/               # Product management (list, create, edit)
│   │   ├── pipeline/               # Pipeline job viewer
│   │   └── settings/               # Marketplace & pipeline settings
│   └── api/
│       ├── products/               # Product CRUD API
│       ├── upload/                  # Image upload API
│       ├── pipeline/               # Pipeline execution API
│       ├── listings/               # Marketplace listings API
│       └── stats/                  # Dashboard statistics API
├── components/
│   ├── CartProvider.tsx            # Cart state management (Context)
│   ├── Navbar.tsx                  # Navigation with cart badge
│   ├── ProductCard.tsx             # Product card component
│   └── Footer.tsx                  # Site footer
└── lib/
    ├── types.ts                    # TypeScript type definitions
    ├── db.ts                       # SQLite database layer
    └── marketplace/
        ├── index.ts                # Pipeline orchestrator
        ├── ebay.ts                 # eBay marketplace connector
        ├── amazon.ts               # Amazon marketplace connector
        ├── etsy.ts                 # Etsy marketplace connector
        └── shopify.ts              # Shopify marketplace connector
```

## How It Works

1. **Add Products**: Upload product images and fill in details (name, description, price, SKU, category, tags) through the admin dashboard
2. **Select Marketplaces**: Choose which marketplaces to publish to (eBay, Amazon, Etsy, Shopify)
3. **Publish**: The pipeline processes each marketplace in sequence, creating listings and tracking results
4. **Monitor**: View pipeline job status, marketplace listings, and sync status from the pipeline page
5. **Sell**: Products appear on the integrated storefront where customers can browse, add to cart, and checkout

## Notes

- The marketplace connectors run in **demo/simulation mode** with realistic delays and success rates
- To connect real marketplace APIs, register for developer accounts with each platform and add your credentials in Settings
- The database is SQLite stored at `data/store.db` - suitable for development and small deployments
- Images are stored locally in `public/uploads/`
