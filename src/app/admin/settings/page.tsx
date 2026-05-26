'use client';

import { useState } from 'react';

const MARKETPLACES = [
  { type: 'ebay', name: 'eBay', color: '#E53238', description: 'Connect your eBay seller account to list items on eBay.' },
  { type: 'amazon', name: 'Amazon', color: '#FF9900', description: 'Connect Amazon Seller Central to publish products on Amazon.' },
  { type: 'etsy', name: 'Etsy', color: '#F1641E', description: 'Link your Etsy shop to sync listings automatically.' },
  { type: 'shopify', name: 'Shopify', color: '#96BF48', description: 'Connect your Shopify store for two-way product sync.' },
];

export default function SettingsPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>({
    ebay: false,
    amazon: false,
    etsy: false,
    shopify: false,
  });

  const toggleConnection = (type: string) => {
    setConnections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your marketplace connections and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Marketplace Connections</h2>
          <p className="text-sm text-gray-500 mb-6">Connect your seller accounts to enable publishing to each marketplace.</p>

          <div className="space-y-4">
            {MARKETPLACES.map(mp => (
              <div key={mp.type} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: mp.color }}>
                  {mp.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{mp.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      connections[mp.type] ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {connections[mp.type] ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{mp.description}</p>
                </div>
                <button
                  onClick={() => toggleConnection(mp.type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    connections[mp.type]
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                  }`}
                >
                  {connections[mp.type] ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Pipeline Settings</h2>
          <p className="text-sm text-gray-500 mb-6">Configure how the publishing pipeline behaves.</p>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Auto-publish new products</p>
                <p className="text-sm text-gray-500 mt-0.5">Automatically publish products when status changes to Active</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Retry failed listings</p>
                <p className="text-sm text-gray-500 mt-0.5">Automatically retry failed marketplace listings</p>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Sync inventory across marketplaces</p>
                <p className="text-sm text-gray-500 mt-0.5">Keep inventory levels synced across all connected marketplaces</p>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
              </div>
            </label>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">Demo Mode</h3>
              <p className="text-sm text-amber-700 mt-1">
                This application runs in demo mode with simulated marketplace APIs.
                To connect real marketplace accounts, you would need to register for API access
                with each platform and provide your credentials here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
