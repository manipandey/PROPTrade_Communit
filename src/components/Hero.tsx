// src/components/Hero.tsx
'use client';

import React from 'react';
import { BookOpen, Trophy, TrendingUp, BarChart2 } from 'lucide-react';

interface HeroProps {
  onBrowseFeed: () => void;
  onOpenJournal: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  username?: string;
}

const QUICK_STATS = [
  { icon: TrendingUp, label: 'Total Community Performance Fees', value: '$248,350+', color: 'var(--accent)' },
  { icon: Trophy,     label: 'Active Funded Traders',   value: '1,450+',   color: '#f59e0b' },
  { icon: BarChart2,  label: 'Avg Community Win Rate',  value: '61.2%',    color: 'var(--accent)' },
];

export default function Hero({ onBrowseFeed, onOpenJournal, onOpenAuth, isLoggedIn, username }: HeroProps) {
  return (
    <div className="space-y-5">
      {/* Welcome Card */}
      <div
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Background accent glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: 'var(--accent-light)', transform: 'translate(40%, -40%)' }}
        />

        <div className="relative z-10 space-y-4 max-w-lg">
          <h1 className="text-3xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome,{' '}
            <span style={{ color: 'var(--accent)' }}>
              {isLoggedIn && username ? username : 'AlphaJournal Elite'}
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Nepal&apos;s premier community for prop firm traders. Share insights, track market volatility, and scale your capital with collective intelligence.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              id="hero-start-journal-btn"
              onClick={isLoggedIn ? onOpenJournal : onOpenAuth}
              className="btn-primary"
            >
              <BookOpen className="h-4 w-4" />
              Start Trading Journal
            </button>
            <button
              id="hero-view-leaderboard-btn"
              onClick={onBrowseFeed}
              className="btn-ghost"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_STATS.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="t-card p-4 flex items-center gap-4"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {value}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
