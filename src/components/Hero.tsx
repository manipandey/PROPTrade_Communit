// src/components/Hero.tsx
'use client';

import React from 'react';
import { ArrowRight, Trophy, Flame, TrendingUp, Compass, Calendar, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onBrowseFeed: () => void;
  onOpenJournal: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export default function Hero({ onBrowseFeed, onOpenJournal, onOpenAuth, isLoggedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-950 bg-black">
      {/* Background gradients and glowing radial backdrops */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green/5 blur-[100px]" />
      <div className="absolute top-10 right-10 -z-10 h-64 w-64 rounded-full bg-emerald-950/10 blur-[80px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/5 px-4 py-1.5 text-xs font-bold text-brand-green uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5 pulse-indicator" />
              <span>Nepal's #1 Prop Trading Community</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
              Master the Markets.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">
                Secure Prop Funding.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto lg:mx-0 text-base text-zinc-400 sm:text-lg">
              Connect with Nepal's premier funded traders. Share payout proofs, log your trading journals, master evaluation rules, and build your reputation to access institutional trading capital.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={onBrowseFeed}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3.5 text-sm font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02]"
              >
                <span>Browse Discussions</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={isLoggedIn ? onOpenJournal : onOpenAuth}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#0d0d0f]/60 px-6 py-3.5 text-sm font-bold text-zinc-300 uppercase tracking-wider hover:border-brand-green hover:text-white hover:bg-zinc-900/40 transition-all hover:scale-[1.02]"
              >
                <span>Start Trade Log</span>
                <Compass className="h-4 w-4 text-brand-green" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-zinc-900">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">$248,350+</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Total Payouts</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">1,450+</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Active Traders</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">61.2%</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Avg Win Rate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-brand-green font-mono">24 HRS</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Payout Processed</div>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Fintech Dashboard Preview) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto w-full max-w-[420px] rounded-2xl border border-zinc-800 bg-[#070708] p-6 shadow-2xl glow-accent overflow-hidden">
              <div className="absolute top-0 right-0 h-[100px] w-[100px] bg-brand-green/5 blur-3xl rounded-full" />
              
              {/* Fake Dashboard Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-brand-green pulse-indicator" />
                  <span className="text-[10px] font-bold font-mono uppercase text-zinc-400">Live Trading Feed</span>
                </div>
                <span className="text-[10px] font-bold font-mono text-brand-green bg-brand-green/10 rounded px-2 py-0.5">
                  XAUUSD ACTIVE
                </span>
              </div>

              {/* Fake Chart Widget */}
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-900 bg-black/60 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Prop Account Equity</span>
                      <h4 className="text-xl font-bold text-white mt-0.5">$104,250.00</h4>
                    </div>
                    <span className="inline-flex items-center text-xs font-bold text-brand-green">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +4.25%
                    </span>
                  </div>
                  
                  {/* CSS SVG Mini Curve */}
                  <div className="h-20 w-full flex items-end pt-2">
                    <svg className="w-full h-full text-brand-green overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 25 C10 20, 20 28, 30 18 C40 10, 50 15, 60 8 C70 0, 80 12, 100 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 25 C10 20, 20 28, 30 18 C40 10, 50 15, 60 8 C70 0, 80 12, 100 3 L100 30 L0 30 Z"
                        fill="url(#chart-glow)"
                      />
                      <circle cx="100" cy="3" r="3" fill="#22c55e" className="pulse-indicator" />
                    </svg>
                  </div>
                </div>

                {/* Dashboard Metrics Rows */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-900 bg-black/60 p-3">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Daily Profit Cap</span>
                    <span className="text-sm font-bold text-white mt-1 block">$1,450.00</span>
                    <div className="w-full bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-green h-1 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-900 bg-black/60 p-3">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Drawdown Room</span>
                    <span className="text-sm font-bold text-brand-green mt-1 block">$5,000 / $5,000</span>
                    <div className="w-full bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                {/* Recent Trading Activity Feed Item */}
                <div className="rounded-xl border border-zinc-900 bg-black/40 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-semibold">Recent Payout Verified</span>
                    <span>10m ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green font-bold font-sans">
                      B
                    </div>
                    <div>
                      <div className="font-bold text-white">BishalFX received $1,240</div>
                      <div className="text-[10px] text-zinc-400 font-medium">FundedNext Account • NRS 164,500 via eSewa</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Small floating badge */}
            <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#0d0d0f] p-3 shadow-xl">
              <CheckCircle2 className="h-5 w-5 text-brand-green" />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verified Payouts</div>
                <div className="text-xs font-bold text-white">eSewa & Bank Transfer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
