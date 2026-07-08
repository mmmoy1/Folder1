'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, MarketplaceType, MarketplaceListing, PipelineJob } from '@/lib/types';
import { formatEscChannels, isMultiEsc } from '@/lib/esc';

const MARKETPLACES: { type: MarketplaceType; name: string; color: string }[] = [
  { type: 'ebay', name: 'eBay', color: '#E53238' },
  { type: 'amazon', name: 'Amazon', color: '#FF9900' },
  { type: 'etsy', name: 'Etsy', color: '#F1641E' },
  { type: 'shopify', name: 'Shopify', color: '#96BF48' },
];

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<(Product & { listings?: MarketplaceListing[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<MarketplaceType[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [lastJob, setLastJob] = useState<PipelineJob | null>(null);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const toggleMarketplace = (type: MarketplaceType) => {
    setSelectedMarketplaces(prev =>
      prev.includes(type) ? prev.filter(m => m !== type) : [...prev, type]
    );
  };

  const selectAll = () => {
    setSelectedMarketplaces(MARKETPLACES.map(m => m.type));
  };

  const handlePublish = async () => {
    if (!product || selectedMarketplaces.length === 0) return;
    setPublishing(true);
    setLastJob(null);

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          marketplaces: selectedMarketplaces,
        }),
      });
      const job = await res.json();
      setLastJob(job);

      const refreshed = await fetch(`/api/products/${params.id}`).then(r => r.json());
      setProduct(refreshed);
    } catch (err) {
      console.error('Pipeline failed:', err);
    }
    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <button onClick={() => router.push('/admin/products')} className="text-brand-600 hover:text-brand-700">
          Back to products
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/admin/products')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
          product.status === 'active' ? 'bg-green-50 text-green-700' :
          product.status === 'draft' ? 'bg-gray-100 text-gray-600' :
          'bg-red-50 text-red-600'
        }`}>
          {product.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                {product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {product.images.map((img, i) => (
                      <div key={i} className={`${i === 0 ? 'col-span-2' : ''} aspect-square rounded-xl overflow-hidden bg-gray-50`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                  {product.compareAtPrice && (
                    <p className="text-sm text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category</span>
                  <p className="font-medium text-gray-900">{product.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Inventory</span>
                  <p className="font-medium text-gray-900">{product.inventory} units</p>
                </div>
                {product.escSpecs && (
                  <div>
                    <span className="text-sm text-gray-500">ESC</span>
                    <p className="font-medium text-gray-900">
                      {formatEscChannels(product.escSpecs)}
                      {isMultiEsc(product) ? ' Multi ESC' : ''}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.escSpecs.continuousCurrentA}A · {product.escSpecs.voltageRange} · {product.escSpecs.controlType}
                    </p>
                  </div>
                )}
                {product.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {product.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-500">Description</span>
                <p className="text-gray-700 mt-1">{product.description}</p>
              </div>
            )}
            {product.escSpecs && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-500">ESC Specifications</span>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-gray-500">Channels</p>
                    <p className="font-medium text-gray-900">{product.escSpecs.channels}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-gray-500">Form factor</p>
                    <p className="font-medium text-gray-900">{product.escSpecs.formFactor}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="font-medium text-gray-900">{product.escSpecs.continuousCurrentA}A</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-gray-500">Voltage</p>
                    <p className="font-medium text-gray-900">{product.escSpecs.voltageRange}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Existing Listings */}
          {product.listings && product.listings.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Listings</h2>
              <div className="space-y-3">
                {product.listings.map(listing => {
                  const mp = MARKETPLACES.find(m => m.type === listing.marketplace);
                  return (
                    <div key={listing.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mp?.color }} />
                      <span className="font-medium text-gray-900">{mp?.name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${
                        listing.status === 'active' ? 'bg-green-100 text-green-700' :
                        listing.status === 'failed' ? 'bg-red-100 text-red-700' :
                        listing.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {listing.status}
                      </span>
                      {listing.url && (
                        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Publish Pipeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Publish to Marketplaces</h2>
            <p className="text-sm text-gray-500 mb-4">Select the marketplaces where you want to list this product</p>

            <div className="space-y-3 mb-4">
              {MARKETPLACES.map(mp => (
                <label
                  key={mp.type}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMarketplaces.includes(mp.type)
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMarketplaces.includes(mp.type)}
                    onChange={() => toggleMarketplace(mp.type)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mp.color }} />
                  <span className="font-medium text-gray-900">{mp.name}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium mb-4"
            >
              Select All Marketplaces
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing || selectedMarketplaces.length === 0}
              className="w-full py-3 px-6 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Publish ({selectedMarketplaces.length})
                </>
              )}
            </button>
          </div>

          {/* Pipeline Result */}
          {lastJob && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Results</h2>
              <div className={`text-sm font-medium px-3 py-2 rounded-xl mb-4 ${
                lastJob.status === 'completed' ? 'bg-green-50 text-green-700' :
                lastJob.status === 'failed' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                Job Status: {lastJob.status}
              </div>
              <div className="space-y-3">
                {lastJob.results.map((result, i) => {
                  const mp = MARKETPLACES.find(m => m.type === result.marketplace);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        result.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={
                            result.status === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'
                          } />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{mp?.name}</p>
                        {result.status === 'success' ? (
                          <p className="text-xs text-gray-500 truncate">ID: {result.externalId}</p>
                        ) : (
                          <p className="text-xs text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
