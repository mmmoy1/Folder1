import Link from 'next/link';
import { getAllProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getAllProducts('active').slice(0, 8);

  return (
    <div>
      {/* Full-screen Hero Slider with background video */}
      <HeroSlider />

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Simple Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Three simple steps to get your products listed across all major marketplaces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Products',
                description: 'Add your product images, descriptions, pricing, and inventory through our admin dashboard.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ),
              },
              {
                step: '02',
                title: 'Select Marketplaces',
                description: 'Choose which marketplaces to publish to: eBay, Amazon, Etsy, Shopify, or all of them at once.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
              },
              {
                step: '03',
                title: 'Publish & Sell',
                description: 'Hit publish and our pipeline syncs your listings. Track status in real-time from the dashboard.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
              },
            ].map(item => (
              <div key={item.step} className="relative group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-brand-100 transition-all duration-300">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-100 transition-colors">
                  <svg className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <div className="absolute top-6 right-6 text-5xl font-bold text-gray-100 group-hover:text-brand-50 transition-colors">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '4', label: 'Marketplaces' },
              { value: '1', label: 'Dashboard' },
              { value: '∞', label: 'Products' },
              { value: '0', label: 'Hassle' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-brand-200 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Shop</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Featured Products</h2>
                <p className="text-gray-600 mt-2 text-lg">Browse our latest listings from the storefront</p>
              </div>
              <Link href="/products" className="hidden sm:inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold transition-colors">
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
            <div className="sm:hidden text-center mt-8">
              <Link href="/products" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold">
                View all products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-gray-900" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Ready to Start Selling?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Add your products and start publishing to all major marketplaces in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-all shadow-2xl shadow-black/20 hover:scale-[1.02]"
            >
              Open Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Add Product
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
