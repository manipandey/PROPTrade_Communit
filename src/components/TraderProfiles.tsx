// src/components/TraderProfiles.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Heart, TrendingUp, CheckCircle, Brain, X } from 'lucide-react';
import { db, TraderProfile } from '@/lib/supabase';

export default function TraderProfiles() {
  const [profiles, setProfiles] = useState<TraderProfile[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfiles(db.getProfiles());
  }, []);
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
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Top Funded <span className="text-brand-green">Traders</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
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
              className="group relative rounded-2xl border border-border-theme/50 bg-bg-card/40 backdrop-blur-xl p-6 cursor-pointer transition-all duration-500 hover:border-brand-green/40 hover:-translate-y-2 hover:rotate-[1deg] hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.15)] flex flex-col justify-between overflow-hidden"
            >
              {/* Animated background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="space-y-5 relative z-10">
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-bg-input to-bg-secondary border border-border-theme/50 shadow-inner text-3xl group-hover:border-brand-green/40 transition-colors group-hover:scale-110 duration-500">
                      {profile.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-text-primary group-hover:text-brand-green transition-colors tracking-tight">
                        {profile.name}
                      </h3>
                      <span className="text-[11px] text-brand-green/70 font-mono tracking-wider">{profile.handle}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleCheer(profile.id, e)}
                    className={`rounded-xl border p-2.5 transition-all duration-300 ${
                      isCheered 
                        ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-110' 
                        : 'border-border-theme/50 bg-bg-secondary/50 text-text-muted hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5'
                    }`}
                    title={isCheered ? 'Cheered!' : 'Support Trader'}
                  >
                    <Heart className={`h-4.5 w-4.5 transition-all ${isCheered ? 'fill-current scale-110' : ''}`} />
                  </button>
                </div>

                {/* Badging list */}
                <div className="flex flex-wrap gap-2">
                  {profile.propFirms.map((firm) => (
                    <span
                      key={firm}
                      className="inline-flex items-center gap-1.5 rounded-md bg-bg-input/60 border border-border-theme/50 px-2.5 py-1 text-[10px] font-mono font-bold text-text-secondary shadow-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                      {firm}
                    </span>
                  ))}
                  {(() => {
                    const username = profile.handle.replace('@', '');
                    const badges = db.getUserBadges(username);
                    const unlocked = badges.filter(b => b.unlocked);
                    return unlocked.map(b => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 text-[10px] font-mono font-bold text-brand-green shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                        title={`${b.name}: ${b.description}`}
                      >
                        <span>{b.emoji}</span>
                        <span>{b.name}</span>
                      </span>
                    ));
                  })()}
                </div>

                {/* Bio Excerpt */}
                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed font-medium">
                  {profile.bio}
                </p>

                {/* Metric Summary Bar */}
                <div className="grid grid-cols-3 gap-3 border-t border-border-theme/40 pt-5 text-center">
                  <div className="group/stat">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block transition-colors group-hover/stat:text-text-secondary">Max Balance</span>
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white mt-1 block">{profile.balance}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block transition-colors group-hover/stat:text-text-secondary">Win Rate</span>
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400 mt-1 block drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">{profile.winRate}</span>
                  </div>
                  <div className="group/stat">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block transition-colors group-hover/stat:text-text-secondary">Profit Split</span>
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mt-1 block">{profile.profitSplit}</span>
                  </div>
                </div>
              </div>

              {/* View Detail Indicator */}
              <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-brand-green flex items-center justify-between border-t border-border-theme/30 pt-4 relative z-10 transition-colors">
                <span className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">View Performance Curve</span>
                <TrendingUp className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Profile Drawer/Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-theme bg-bg-card p-6 sm:p-8 shadow-2xl glow-accent">
            {/* Close */}
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Detail Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-input border border-border-theme text-3xl font-bold">
                {selectedProfile.avatar}
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-text-primary leading-none">{selectedProfile.name}</h3>
                  <Award className="h-4.5 w-4.5 text-brand-green" />
                </div>
                <div className="text-xs text-text-muted font-mono">{selectedProfile.handle}</div>
                {selectedProfile.isDemo ? (
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-0.5 animate-pulse">
                    <CheckCircle className="h-3 w-3 text-yellow-500" />
                    <span>Simulated Demo Profile</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-green bg-brand-green/10 border border-brand-green/20 rounded px-2 py-0.5">
                    <CheckCircle className="h-3 w-3" />
                    <span>Verified Account Status</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info Stats */}
            <div className="grid grid-cols-3 gap-3 border border-border-theme bg-bg-input/40 rounded-xl p-4 text-center mb-6">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Funded Balance</div>
                <div className="text-base font-black text-text-primary mt-1">{selectedProfile.balance}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verified Winrate</div>
                <div className="text-base font-black text-brand-green mt-1">{selectedProfile.winRate}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Current Split</div>
                <div className="text-base font-black text-text-secondary mt-1">{selectedProfile.profitSplit}</div>
              </div>
            </div>

            {/* Bio & Tactics */}
            <div className="space-y-5 text-left">
              {/* Unlocked Badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-2">
                  <Award className="h-3.5 w-3.5 text-brand-green" />
                  <span>Discipline Achievements & Badges</span>
                </h4>
                {(() => {
                  const username = selectedProfile.handle.replace('@', '');
                  const badges = db.getUserBadges(username);
                  const unlocked = badges.filter(b => b.unlocked);
                  if (unlocked.length === 0) {
                    return (
                      <p className="text-[10px] text-text-muted italic bg-bg-input/20 border border-border-theme rounded-lg p-3">
                        No discipline badges unlocked yet. Logging trades consistently with low risk unlocks achievements.
                      </p>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {unlocked.map(b => (
                        <div key={b.id} className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/10 rounded-lg p-2.5">
                          <span className="text-lg">{b.emoji}</span>
                          <div>
                            <div className="text-[10px] font-black text-text-primary leading-tight">{b.name}</div>
                            <div className="text-[9px] text-text-muted mt-0.5">{b.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1">
                  <Brain className="h-3.5 w-3.5 text-brand-green" />
                  <span>Trading Thesis</span>
                </h4>
                <p className="mt-1.5 text-xs text-text-secondary leading-relaxed bg-bg-input/35 border border-border-theme rounded-lg p-3">
                  {selectedProfile.bio}
                </p>
              </div>

              {/* Verified Performance Equity Curve */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-green" />
                  <span>Cumulative Evaluation Growth Curve</span>
                </h4>
                <div className="rounded-xl border border-border-theme bg-bg-input p-4">
                  {/* SVG Line Graph */}
                  <div className="h-32 w-full flex items-end pt-2">
                    <svg className="w-full h-full text-brand-green overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: '300',
                          strokeDashoffset: '300',
                          animation: 'drawChart 2s ease-out forwards'
                        }}
                      />
                      <style>{`
                        @keyframes drawChart {
                          to { stroke-dashoffset: 0; }
                        }
                      `}</style>
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2} L 100 40 L 0 40 Z`}
                        fill="url(#chart-glow)"
                      />
                      {/* Grid Horizontal reference lines */}
                      <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border)" strokeDasharray="3,3" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                      <line x1="0" y1="5" x2="100" y2="5" stroke="var(--border)" strokeDasharray="3,3" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-text-muted font-mono pt-2 border-t border-border-theme mt-2">
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
                className="rounded-lg bg-bg-input border border-border-theme text-text-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-green hover:text-black hover:border-brand-green transition-all"
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
