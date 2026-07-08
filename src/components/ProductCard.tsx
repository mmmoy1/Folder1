'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatEscChannels, isMultiEsc } from '@/lib/esc';
import { useCart } from './CartProvider';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const mainImage = product.images[0] || '/placeholder.svg';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;
  const multi = isMultiEsc(product);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f0f7ff/0074c5?text=${encodeURIComponent(product.name.slice(0, 12))}`;
            }}
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
          {multi && (
            <span className="absolute bottom-3 left-3 bg-slate-900/85 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
              {formatEscChannels(product.escSpecs!)}
            </span>
          )}
          {product.inventory <= 3 && product.inventory > 0 && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Only {product.inventory} left
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        {product.escSpecs && (
          <p className="text-xs text-gray-500 mb-2">
            {product.escSpecs.continuousCurrentA}A · {product.escSpecs.voltageRange} · {product.escSpecs.controlType}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={product.inventory === 0}
            className="p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
