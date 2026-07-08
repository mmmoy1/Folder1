import { getAllProducts } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { multiEsc?: string };
}) {
  const multiEscOnly = searchParams?.multiEsc === '1' || searchParams?.multiEsc === 'true';
  let products = await getAllProducts('active');
  if (multiEscOnly) {
    products = products.filter(p => p.escSpecs && p.escSpecs.channels > 1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {multiEscOnly ? 'Multi ESC Products' : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">{products.length} items available</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !multiEscOnly
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          <Link
            href="/products?multiEsc=1"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              multiEscOnly
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Multi ESC
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {multiEscOnly ? 'No multi-ESC products yet' : 'No products yet'}
          </h2>
          <p className="text-gray-500 mb-6">
            {multiEscOnly
              ? 'Add a 4-in-1 or other multi-channel ESC through the admin dashboard.'
              : 'Add products through the admin dashboard to see them here.'}
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
