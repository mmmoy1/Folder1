import Link from 'next/link';
import { getAllProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getAllProducts('active').slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              Multi-Marketplace Pipeline
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Sell Everywhere,<br />
              <span className="text-brand-200">Manage Once</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-8 max-w-2xl">
              Upload your product images and details, then publish to eBay, Amazon, Etsy, and Shopify
              with a single click. Your integrated storefront showcases everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors shadow-lg shadow-brand-900/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Product
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Browse Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Logos */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-8">Publish to all major marketplaces</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 items-center">
            {[
              { name: 'eBay', color: '#E53238' },
              { name: 'Amazon', color: '#FF9900' },
              { name: 'Etsy', color: '#F1641E' },
              { name: 'Shopify', color: '#96BF48' },
            ].map(mp => (
              <div key={mp.name} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mp.color }} />
                <span className="text-lg font-semibold">{mp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Three simple steps to get your products listed across all major marketplaces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Products',
                description: 'Add your product images, descriptions, pricing, and inventory through our admin dashboard.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
              },
              {
                step: '2',
                title: 'Select Marketplaces',
                description: 'Choose which marketplaces to publish to: eBay, Amazon, Etsy, Shopify, or all of them at once.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
              },
              {
                step: '3',
                title: 'Publish & Sell',
                description: 'Hit publish and our pipeline syncs your listings. Track status in real-time from the dashboard.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
              },
            ].map(item => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <div className="absolute top-6 right-6 text-4xl font-bold text-gray-100">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-2">Shop our latest listings</p>
              </div>
              <Link href="/products" className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Selling?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Add your products and start publishing to all major marketplaces in minutes.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
          >
            Open Dashboard
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
