// src/components/TraderProfiles.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Heart, TrendingUp, CheckCircle, Brain, X, Trophy, Star, Users } from 'lucide-react';
import { db, TraderProfile } from '@/lib/supabase';
import { api } from '@/lib/api';

const RANK_CONFIG = [
  { label: '#1', color: '#FFD700', glow: 'rgba(255,215,0,0.25)', icon: '🥇', ring: 'rgba(255,215,0,0.4)' },
  { label: '#2', color: '#C0C0C0', glow: 'rgba(192,192,192,0.2)', icon: '🥈', ring: 'rgba(192,192,192,0.35)' },
  { label: '#3', color: '#CD7F32', glow: 'rgba(205,127,50,0.2)', icon: '🥉', ring: 'rgba(205,127,50,0.35)' },
];

export default function TraderProfiles() {
  const [profiles, setProfiles] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<TraderProfile | null>(null);
  const [cheeredTraders, setCheeredTraders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      const live = await api.getProfiles();
      setProfiles(live);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCheer = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheeredTraders(prev => ({ ...prev, [profileId]: !prev[profileId] }));
  };

  // Only show real (non-demo) profiles, sorted by win rate desc
  const displayProfiles = profiles
    .filter(p => !p.isDemo)
    .sort((a, b) => {
      const aWin = parseFloat(a.winRate) || 0;
      const bWin = parseFloat(b.winRate) || 0;
      return bWin - aWin;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">

      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest"
          style={{ borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.05)', color: '#22c55e' }}>
          <Trophy className="h-3 w-3" />
          Performance Leaderboard
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase"
          style={{ color: 'var(--text-primary)' }}>
          Top Funded <span style={{ color: '#22c55e' }}>Traders</span>
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Verified profiles of elite Nepalese prop traders who have cleared evaluations and processed real performance fee withdrawals.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-green border-r-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Loading Elite Trader Profiles...
          </p>
        </div>
      )}

      {/* Empty State — no real traders yet */}
      {!loading && displayProfiles.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl border border-dashed"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Users className="h-7 w-7" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Verified Traders Yet</h3>
            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Verified funded trader profiles will appear here once the admin approves submissions.
            </p>
          </div>
        </div>
      )}

      {/* Profile Cards Grid */}
      {!loading && displayProfiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProfiles.map((profile, idx) => {
            const rank = RANK_CONFIG[idx];
            const isCheered = cheeredTraders[profile.id];
            const username = profile.handle.replace('@', '');
            const badges = db.getUserBadges(username);
            const unlockedBadges = badges.filter(b => b.unlocked);

            return (
              <div
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className="group relative rounded-2xl border cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex flex-col overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: rank ? rank.ring : 'var(--border)',
                  boxShadow: rank ? `0 0 20px ${rank.glow}` : undefined,
                }}
              >
                {/* Rank badge */}
                {rank && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black"
                    style={{ backgroundColor: `${rank.color}15`, border: `1px solid ${rank.color}40`, color: rank.color }}>
                    <span>{rank.icon}</span>
                    <span>{rank.label}</span>
                  </div>
                )}

                {/* Hover glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="p-5 space-y-4 relative z-10 flex-1">
                  {/* Header row */}
                  <div className="flex justify-between items-start pt-5">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl border transition-all duration-300 group-hover:scale-105"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                          {profile.avatar}
                        </div>
                        {/* Online dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                          style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg-card)' }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold tracking-tight transition-colors group-hover:text-brand-green"
                          style={{ color: 'var(--text-primary)' }}>
                          {profile.name}
                        </h3>
                        <span className="text-[11px] font-mono" style={{ color: '#22c55e', opacity: 0.7 }}>
                          {profile.handle}
                        </span>
                      </div>
                    </div>

                    {/* Cheer button */}
                    <button
                      onClick={e => handleCheer(profile.id, e)}
                      className={`rounded-xl border p-2 transition-all duration-300 ${
                        isCheered
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-110'
                          : 'text-text-muted hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5'
                      }`}
                      style={!isCheered ? { borderColor: 'var(--border)' } : undefined}
                      title={isCheered ? 'Cheered!' : 'Support Trader'}
                    >
                      <Heart className={`h-4 w-4 transition-all ${isCheered ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Prop Firm Badges */}
                  {profile.propFirms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.propFirms.map(firm => (
                        <span key={firm}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                          <ShieldCheck className="h-2.5 w-2.5" />
                          {firm}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl p-3"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {[
                      { label: 'Balance', value: profile.balance, color: 'var(--text-primary)' },
                      { label: 'Win Rate', value: profile.winRate, color: '#22c55e' },
                      { label: 'Split', value: profile.profitSplit, color: '#60a5fa' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <div className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                          {stat.label}
                        </div>
                        <div className="text-xs font-black font-mono" style={{ color: stat.color }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discipline Badges */}
                  {unlockedBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {unlockedBadges.slice(0, 3).map(b => (
                        <span key={b.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold"
                          style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}
                          title={b.name}>
                          {b.emoji} {b.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 flex items-center justify-between border-t transition-colors"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest transition-colors group-hover:text-brand-green"
                    style={{ color: 'var(--text-muted)' }}>
                    View Performance Curve
                  </span>
                  <TrendingUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setSelectedProfile(null)}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl border"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  {selectedProfile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedProfile.name}
                    </h3>
                    <Award className="h-4 w-4" style={{ color: '#22c55e' }} />
                  </div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {selectedProfile.handle}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    <CheckCircle className="h-3 w-3" />
                    Verified Funded Trader
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)}
                className="rounded-lg p-2 transition-colors hover:bg-bg-hover"
                style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Funded Balance', value: selectedProfile.balance, color: 'var(--text-primary)' },
                  { label: 'Verified Win Rate', value: selectedProfile.winRate, color: '#22c55e' },
                  { label: 'Profit Split', value: selectedProfile.profitSplit, color: '#60a5fa' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3 text-center border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="text-[8px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </div>
                    <div className="text-sm font-black font-mono" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Prop Firms */}
              {selectedProfile.propFirms.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}>
                    <Star className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                    Funded Firms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.propFirms.map(firm => (
                      <span key={firm}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold"
                        style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                        <ShieldCheck className="h-3 w-3" />
                        {firm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              {(() => {
                const username = selectedProfile.handle.replace('@', '');
                const badges = db.getUserBadges(username);
                const unlocked = badges.filter(b => b.unlocked);
                if (unlocked.length === 0) return null;
                return (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                      style={{ color: 'var(--text-muted)' }}>
                      <Award className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                      Discipline Achievements
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {unlocked.map(b => (
                        <div key={b.id} className="flex items-center gap-2 rounded-lg p-2.5"
                          style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                          <span className="text-lg">{b.emoji}</span>
                          <div>
                            <div className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>{b.name}</div>
                            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{b.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Bio */}
              {selectedProfile.bio && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}>
                    <Brain className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                    Trading Thesis
                  </h4>
                  <p className="text-xs leading-relaxed rounded-xl p-3"
                    style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {selectedProfile.bio}
                  </p>
                </div>
              )}

              {/* Equity Curve */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}>
                  <TrendingUp className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                  Cumulative Growth Curve
                </h4>
                <div className="rounded-xl border p-4"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="h-32 w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2}`}
                        fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"
                        style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'drawChart 1.8s ease-out forwards' }}
                      />
                      <path
                        d={`M 0 35 L 14 ${35 - selectedProfile.equityCurve[1] * 2} L 28 ${35 - selectedProfile.equityCurve[2] * 2} L 42 ${35 - selectedProfile.equityCurve[3] * 2} L 56 ${35 - selectedProfile.equityCurve[4] * 2} L 70 ${35 - selectedProfile.equityCurve[5] * 2} L 84 ${35 - selectedProfile.equityCurve[6] * 2} L 100 ${35 - selectedProfile.equityCurve[7] * 2} L 100 40 L 0 40 Z`}
                        fill="url(#curve-fill)"
                      />
                      <line x1="0" y1="35" x2="100" y2="35" stroke="var(--border)" strokeDasharray="3,3" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                      <line x1="0" y1="5" x2="100" y2="5" stroke="var(--border)" strokeDasharray="3,3" />
                      <style>{`@keyframes drawChart { to { stroke-dashoffset: 0; } }`}</style>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono pt-2 border-t mt-2"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                    <span>EVALUATION START</span>
                    <span>MID POINT</span>
                    <span>WITHDRAWAL ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <button onClick={() => setSelectedProfile(null)}
                className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
