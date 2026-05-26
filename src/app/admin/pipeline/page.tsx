'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PipelineJob, MarketplaceListing, Product } from '@/lib/types';

const MARKETPLACE_COLORS: Record<string, string> = {
  ebay: '#E53238',
  amazon: '#FF9900',
  etsy: '#F1641E',
  shopify: '#96BF48',
};

const MARKETPLACE_NAMES: Record<string, string> = {
  ebay: 'eBay',
  amazon: 'Amazon',
  etsy: 'Etsy',
  shopify: 'Shopify',
};

export default function PipelinePage() {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'jobs' | 'listings'>('jobs');

  useEffect(() => {
    Promise.all([
      fetch('/api/pipeline').then(r => r.json()),
      fetch('/api/listings').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([j, l, p]) => {
      setJobs(j);
      setListings(l);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const getProductName = (id: string) => {
    const p = products.find(pr => pr.id === id);
    return p?.name || 'Unknown Product';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600 mt-1">View marketplace publishing jobs and active listings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('jobs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'jobs' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pipeline Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Marketplace Listings ({listings.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : tab === 'jobs' ? (
        jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No pipeline jobs yet</h2>
            <p className="text-gray-500 mb-6">Go to a product and click &ldquo;Publish&rdquo; to create your first pipeline job.</p>
            <Link href="/admin/products" className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
              View Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link href={`/admin/products/${job.productId}`} className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                      {getProductName(job.productId)}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{new Date(job.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    job.status === 'completed' ? 'bg-green-50 text-green-700' :
                    job.status === 'failed' ? 'bg-red-50 text-red-700' :
                    job.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {job.results.map((result, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${
                      result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MARKETPLACE_COLORS[result.marketplace] }} />
                        <span className="text-sm font-medium">{MARKETPLACE_NAMES[result.marketplace]}</span>
                      </div>
                      {result.status === 'success' ? (
                        <p className="text-xs text-green-700 truncate">Listed: {result.externalId}</p>
                      ) : (
                        <p className="text-xs text-red-700 truncate">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h2>
            <p className="text-gray-500">Publish products to see marketplace listings here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Marketplace</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">External ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/products/${listing.productId}`} className="text-sm font-medium text-gray-900 hover:text-brand-600">
                        {getProductName(listing.productId)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MARKETPLACE_COLORS[listing.marketplace] }} />
                        <span className="text-sm text-gray-700">{MARKETPLACE_NAMES[listing.marketplace]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        listing.status === 'active' ? 'bg-green-50 text-green-700' :
                        listing.status === 'failed' ? 'bg-red-50 text-red-700' :
                        listing.status === 'syncing' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs font-mono text-gray-500 truncate block max-w-[200px]">
                        {listing.externalId || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-500">
                        {listing.lastSyncedAt ? new Date(listing.lastSyncedAt).toLocaleString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
