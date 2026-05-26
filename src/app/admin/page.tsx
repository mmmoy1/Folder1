'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats, PipelineJob, Product } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<PipelineJob[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/pipeline').then(r => r.json()).then((jobs: PipelineJob[]) => setRecentJobs(jobs.slice(0, 5)));
    fetch('/api/products').then(r => r.json()).then((prods: Product[]) => setProducts(prods.slice(0, 5)));
  }, []);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.totalProducts, color: 'bg-blue-50 text-blue-700', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Active Listings', value: stats.activeListings, color: 'bg-green-50 text-green-700', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Marketplaces', value: stats.totalMarketplaces, color: 'bg-purple-50 text-purple-700', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    { label: 'Pending Jobs', value: stats.pendingJobs, color: 'bg-amber-50 text-amber-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your products and marketplace pipeline</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No products yet. Add your first product to get started.</p>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={p.images[0] || `https://placehold.co/100x100/f0f7ff/0074c5?text=${encodeURIComponent(p.name.slice(0, 4))}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">${p.price.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.status === 'active' ? 'bg-green-50 text-green-700' :
                    p.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pipeline Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline Activity</h2>
            <Link href="/admin/pipeline" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No pipeline jobs yet. Publish a product to see activity.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    job.status === 'completed' ? 'bg-green-50 text-green-600' :
                    job.status === 'failed' ? 'bg-red-50 text-red-600' :
                    job.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        job.status === 'completed' ? 'M5 13l4 4L19 7' :
                        job.status === 'failed' ? 'M6 18L18 6M6 6l12 12' :
                        'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                      } />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Published to {job.marketplaces.length} marketplace{job.marketplaces.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    job.status === 'completed' ? 'bg-green-50 text-green-700' :
                    job.status === 'failed' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
