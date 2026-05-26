'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    tag: 'Multi-Marketplace Pipeline',
    title: 'Sell Everywhere,',
    highlight: 'Manage Once',
    description:
      'Upload your product images and details, then publish to eBay, Amazon, Etsy, and Shopify with a single click.',
    cta: { label: 'Add Your First Product', href: '/admin/products/new' },
    secondary: { label: 'Browse Store', href: '/products' },
  },
  {
    tag: '4 Marketplaces, 1 Dashboard',
    title: 'Reach Millions of',
    highlight: 'Customers',
    description:
      'Publish to eBay, Amazon, Etsy, and Shopify simultaneously. Track every listing from a single pipeline view.',
    cta: { label: 'Open Dashboard', href: '/admin' },
    secondary: { label: 'View Pipeline', href: '/admin/pipeline' },
  },
  {
    tag: 'Built-In Storefront',
    title: 'Your Own',
    highlight: 'Online Store',
    description:
      'Every product you add is instantly available on your beautiful integrated storefront with cart and checkout.',
    cta: { label: 'Shop Now', href: '/products' },
    secondary: { label: 'Learn More', href: '#how-it-works' },
  },
];

const VIDEO_SRC = 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || index === current) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 500);
    },
    [current, transitioning],
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 7000);
  };

  const slide = SLIDES[current];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
            <source src="https://static.videezy.com/system/resources/previews/000/041/882/original/Technology.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-gray-900" />
        )}
        {/* Overlay layers */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/40 to-transparent" />
      </div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-brand-400/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div
            className={`max-w-3xl transition-all duration-500 ease-out ${
              transitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Tag */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-md border border-white/20 text-white/90 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {slide.tag}
            </span>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {slide.title}
              <br />
              <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
                {slide.highlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/75 mb-10 max-w-2xl leading-relaxed">
              {slide.description}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-all shadow-2xl shadow-black/20 hover:shadow-brand-500/20 hover:scale-[1.02]"
              >
                {slide.cta.label}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href={slide.secondary.href}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                {slide.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace ticker strip */}
      <div className="absolute bottom-28 sm:bottom-24 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-6 sm:gap-10 text-white/40">
            <span className="text-xs uppercase tracking-widest font-medium whitespace-nowrap hidden sm:block">Publish to</span>
            <div className="h-px flex-1 bg-white/10 hidden sm:block" />
            {[
              { name: 'eBay', color: '#E53238' },
              { name: 'Amazon', color: '#FF9900' },
              { name: 'Etsy', color: '#F1641E' },
              { name: 'Shopify', color: '#96BF48' },
            ].map((mp) => (
              <div key={mp.name} className="flex items-center gap-2 hover:text-white/70 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10" style={{ backgroundColor: mp.color }} />
                <span className="text-sm font-semibold tracking-wide">{mp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); resetTimer(); }}
                className="group flex items-center gap-2"
                aria-label={`Go to slide ${i + 1}`}
              >
                <div className="relative h-1 overflow-hidden rounded-full transition-all duration-300" style={{ width: i === current ? 48 : 16 }}>
                  <div className="absolute inset-0 bg-white/25 rounded-full" />
                  {i === current && (
                    <div className="absolute inset-0 bg-white rounded-full origin-left animate-slider-progress" />
                  )}
                </div>
              </button>
            ))}
            <span className="ml-3 text-xs text-white/40 font-mono tabular-nums">
              {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Nav arrows */}
      <div className="absolute right-6 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
        <button
          onClick={() => { goTo((current - 1 + SLIDES.length) % SLIDES.length); resetTimer(); }}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => { goTo((current + 1) % SLIDES.length); resetTimer(); }}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-6 sm:right-8 lg:right-12 z-10 hidden lg:flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 rotate-90 origin-center translate-y-6">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent mt-8" />
      </div>
    </section>
  );
}
