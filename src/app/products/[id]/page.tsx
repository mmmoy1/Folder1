'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatEscChannels, isMultiEsc } from '@/lib/esc';
import { useCart } from '@/components/CartProvider';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/products" className="text-brand-600 hover:text-brand-700">Back to products</Link>
      </div>
    );
  }

  const mainImage = product.images[selectedImage] || `https://placehold.co/600x600/f0f7ff/0074c5?text=${encodeURIComponent(product.name.slice(0, 12))}`;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-700">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/600x600/f0f7ff/0074c5?text=${encodeURIComponent(product.name.slice(0, 12))}`;
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-brand-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-brand-600 font-medium uppercase tracking-wider">{product.category}</span>
            {product.escSpecs && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                {formatEscChannels(product.escSpecs)}
                {isMultiEsc(product) ? ' Multi ESC' : ''}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Save ${(product.compareAtPrice! - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          {product.escSpecs && (
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-gray-500">Channels</p>
                <p className="font-semibold text-gray-900">{product.escSpecs.channels}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-gray-500">Current</p>
                <p className="font-semibold text-gray-900">
                  {product.escSpecs.continuousCurrentA}A
                  {product.escSpecs.peakCurrentA ? ` / ${product.escSpecs.peakCurrentA}A pk` : ''}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-gray-500">Voltage</p>
                <p className="font-semibold text-gray-900">{product.escSpecs.voltageRange}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-gray-500">Control</p>
                <p className="font-semibold text-gray-900">{product.escSpecs.controlType}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-gray-500">BEC</p>
                <p className="font-semibold text-gray-900">{product.escSpecs.bec ? 'Yes' : 'No'}</p>
              </div>
              {product.escSpecs.mountingPattern && (
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs text-gray-500">Mount</p>
                  <p className="font-semibold text-gray-900">{product.escSpecs.mountingPattern}</p>
                </div>
              )}
              {product.escSpecs.signalFrequency && (
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs text-gray-500">Signal</p>
                  <p className="font-semibold text-gray-900">{product.escSpecs.signalFrequency}</p>
                </div>
              )}
              {product.escSpecs.firmware && (
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs text-gray-500">Firmware</p>
                  <p className="font-semibold text-gray-900">{product.escSpecs.firmware}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium w-20">SKU:</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{product.sku}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium w-20">Stock:</span>
              <span className={product.inventory > 5 ? 'text-green-600' : product.inventory > 0 ? 'text-amber-600' : 'text-red-600'}>
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </span>
            </div>
            {product.tags.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium w-20 text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {product.inventory > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-3 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20'
                }`}
              >
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
