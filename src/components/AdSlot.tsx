// src/components/AdSlot.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { db, Ad } from '@/lib/supabase';

interface AdSlotProps {
  variant?: 'banner' | 'sidebar';
  className?: string;
}

export default function AdSlot({ variant = 'banner', className = '' }: AdSlotProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const loadedAds = db.getAds() || [];
    setAds(loadedAds);
    if (loadedAds.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * loadedAds.length));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [ads]);

  const ad = ads[currentIndex];

  if (!ad) {
    if (variant === 'sidebar') {
      return (
        <div
          className={`rounded-xl p-4 space-y-2 animate-pulse ${className}`}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            height: '155px',
            width: '240px',
            overflow: 'hidden',
          }}
        >
          <div className="h-4 w-24 bg-bg-secondary rounded" />
          <div className="h-3 w-full bg-bg-secondary rounded" />
          <div className="h-3 w-2/3 bg-bg-secondary rounded font-mono" />
          <div className="h-3 w-1/2 bg-bg-secondary rounded" />
        </div>
      );
    }
    return (
      <div
        className={`rounded-xl px-5 py-4 flex items-start gap-4 animate-pulse ${className}`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
          height: '115px',
          maxWidth: '896px',
          width: '100%',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <div className="h-9 w-9 rounded-lg flex-shrink-0 bg-bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-bg-secondary rounded" />
          <div className="h-4 w-full bg-bg-secondary rounded" />
          <div className="h-3 w-24 bg-bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={`rounded-xl p-4 space-y-2 transition-all duration-300 ${className}`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease, background 0.3s ease',
          height: '155px',
          width: '240px',
          overflow: 'hidden',
          backgroundImage: ad.imageUrl ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(${ad.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex items-center gap-1.5">
          {ad.logoUrl ? (
            <div className="flex h-5 w-5 items-center justify-center rounded bg-bg-secondary border border-border-theme overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.logoUrl} alt="Logo" className="h-3.5 w-3.5 object-contain" />
            </div>
          ) : (
            <Quote className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {ad.isSponsored ? 'Sponsored Space' : 'Trading Wisdom'}
          </span>
        </div>
        <p className="text-xs leading-relaxed italic" style={{ color: ad.imageUrl ? '#ffffff' : 'var(--text-secondary)' }}>
          &ldquo;{ad.text}&rdquo;
        </p>
        <p className="text-[10px] font-semibold" style={{ color: ad.imageUrl ? '#cbd5e1' : 'var(--text-muted)' }}>
          — {ad.author}
        </p>
      </div>
    );
  }
 
  return (
    <div
      className={`rounded-xl px-5 py-4 flex items-start gap-4 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--accent)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-4px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, background 0.35s ease',
        height: '115px',
        maxWidth: '896px',
        width: '100%',
        margin: '0 auto',
        overflow: 'hidden',
        backgroundImage: ad.imageUrl ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(${ad.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 mt-0.5 overflow-hidden bg-bg-secondary border border-border-theme"
      >
        {ad.logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={ad.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
        ) : (
          <Quote className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
          {ad.isSponsored ? '💡 Sponsor Spotlight · Sponsored Space' : '💡 Trader Wisdom'}
        </div>
        <p className="text-sm font-medium italic leading-relaxed" style={{ color: ad.imageUrl ? '#ffffff' : 'var(--text-primary)' }}>
          &ldquo;{ad.text}&rdquo;
        </p>
        <p className="text-xs mt-1.5 font-semibold" style={{ color: ad.imageUrl ? '#cbd5e1' : 'var(--text-muted)' }}>
          — {ad.author}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex flex-col gap-1 justify-center flex-shrink-0 mt-2">
        {ads.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setVisible(true); }}
            className="h-1 w-1 rounded-full transition-all"
            style={{
              backgroundColor: i === currentIndex ? 'var(--accent)' : 'var(--border)',
              width: i === currentIndex ? '12px' : '4px',
            }}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
