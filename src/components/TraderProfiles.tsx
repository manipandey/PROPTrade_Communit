// src/components/TraderProfiles.tsx
'use client';

import React, { useState } from 'react';
import { User, Award, ShieldCheck, Heart, TrendingUp, CheckCircle, Brain, X, Star } from 'lucide-react';
import { db, TraderProfile } from '@/lib/supabase';

export default function TraderProfiles() {
  const [profiles] = useState<TraderProfile[]>(() => db.getProfiles());
  const [selectedProfile, setSelectedProfile] = useState<TraderProfile | null>(null);
  const [cheeredTraders, setCheeredTraders] = useState<Record<string, boolean>>({});

  const handleCheer = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card opening
    setCheeredTraders((prev) => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
          Top Funded <span className="text-brand-green">Traders</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Learn from elite Nepalese prop traders. These individuals have proven consistency, cleared evaluations, and successfully processed multiple high-value payouts.
        </p>
      </div>

      {/* Profile Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const isCheered = cheeredTraders[profile.id];
          
          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="group relative rounded-xl border border-zinc-900 bg-[#070708] p-5 cursor-pointer transition-all duration-300 hover:border-brand-green/30 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(34,197,94,0.03)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-2xl group-hover:border-brand-green/30 transition-colors">
                      {profile.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-green transition-colors">
                        {profile.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{profile.handle}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleCheer(profile.id, e)}
                    className={`rounded-lg border p-2 transition-all ${
                      isCheered 
                        ? 'bg-red-950/20 border-red-900/40 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                        : 'border-zinc-800 bg-[#0d0d0f] text-zinc-500 hover:border-red-900/50 hover:text-red-400'
                    }`}
                    title={isCheered ? 'Cheered!' : 'Support Trader'}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>

                {/* Badging list */}
                <div className="flex flex-wrap gap-1.5">
                  {profile.propFirms.map((firm) => (
                    <span
                      key={firm}
                      className="inline-flex items-center gap-1 rounded bg-zinc-950 border border-zinc-900 px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-300"
                    >
                      <ShieldCheck className="h-3 w-3 text-brand-green" />
                      {firm}
                    </span>
                  ))}
                </div>

                {/* Bio Excerpt */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>

                {/* Metric Summary Bar */}
                <div className="grid grid-cols-3 gap-2 border-t border-zinc-900/60 pt-4 text-center">
                  <div>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Max Balance</span>
                    <span className="text-xs font-black text-white mt-0.5 block">{profile.balance}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Win Rate</span>
                    <span className="text-xs font-black text-brand-green mt-0.5 block">{profile.winRate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block">Profit Split</span>
                    <span className="text-xs font-black text-zinc-300 mt-0.5 block">{profile.profitSplit}</span>
                  </div>
                </div>
              </div>

              {/* View Detail Indicator */}
              <div className="mt-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-brand-green flex items-center justify-between border-t border-zinc-900/40 pt-3">
                <span>View Performance Curve</span>
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Profile Drawer/Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0f] p-6 sm:p-8 shadow-2xl glow-accent">
            {/* Close */}
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Detail Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-3xl font-bold">
                {selectedProfile.avatar}
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-white leading-none">{selectedProfile.name}</h3>
                  <Award className="h-4.5 w-4.5 text-brand-green" />
                </div>
                <div className="text-xs text-zinc-500 font-mono">{selectedProfile.handle}</div>
                <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 rounded px-2 py-0.5">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verified Account Status</span>
                </div>
              </div>
            </div>

            {/* Account Info Stats */}
            <div className="grid grid-cols-3 gap-3 border border-zinc-900 bg-black/40 rounded-xl p-4 text-center mb-6">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Funded Balance</div>
                <div className="text-base font-black text-white mt-1">{selectedProfile.balance}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verified Winrate</div>
                <div className="text-base font-black text-brand-green mt-1">{selectedProfile.winRate}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Split</div>
                <div className="text-base font-black text-zinc-300 mt-1">{selectedProfile.profitSplit}</div>
              </div>
            </div>

            {/* Bio & Tactics */}
            <div className="space-y-4 text-left">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                  <Brain className="h-3.5 w-3.5 text-brand-green" />
                  <span>Trading Thesis</span>
                </h4>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed bg-black/35 border border-zinc-900 rounded-lg p-3">
                  {selectedProfile.bio}
                </p>
              </div>

              {/* Verified Performance Equity Curve */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-green" />
                  <span>Cumulative Evaluation Growth Curve</span>
                </h4>
                <div className="rounded-xl border border-zinc-900 bg-black p-4">
                  {/* SVG Line Graph */}
                  <div className="h-32 w-full flex items-end pt-2">
                    <svg className="w-full h-full text-brand-green overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2} L 100 40 L 0 40 Z`}
                        fill="url(#chart-glow)"
                      />
                      {/* Grid Horizontal reference lines */}
                      <line x1="0" y1="35" x2="100" y2="35" stroke="#1f1f23" strokeDasharray="3,3" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#1f1f23" strokeDasharray="3,3" />
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#1f1f23" strokeDasharray="3,3" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono pt-2 border-t border-zinc-900 mt-2">
                    <span>EVALUATION START</span>
                    <span>MID POINT</span>
                    <span>PAYOUT ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-green hover:text-black hover:border-brand-green transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
