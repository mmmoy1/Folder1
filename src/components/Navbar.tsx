'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${transparent ? 'bg-white/15 backdrop-blur-sm' : 'bg-brand-600'}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className={`text-xl font-bold transition-colors ${transparent ? 'text-white' : 'text-gray-900'}`}>
                MarketFlow
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Shop
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className={`hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                transparent
                  ? 'text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm'
                  : 'text-brand-700 bg-brand-50 hover:bg-brand-100'
              }`}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
            <Link
              href="/cart"
              className={`relative p-2 transition-colors ${
                transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className={`sm:hidden p-2 transition-colors ${transparent ? 'text-white/80' : 'text-gray-600'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/" className="block text-gray-700 hover:text-brand-600 py-2" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/products" className="block text-gray-700 hover:text-brand-600 py-2" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link href="/admin" className="block text-gray-700 hover:text-brand-600 py-2" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
