// src/components/TraderProfiles.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BookOpen, Trophy, Flame,
  BarChart2, Target, Star, Users, X, Award
} from 'lucide-react';
import { db, JournalEntry } from '@/lib/supabase';

interface TraderStat {
  username: string;
  avatar: string;
  totalTrades: number;
  loggedDays: number;
  totalPnl: number;
  winRate: number;
  streak: number;
  avgRR: number;
  badges: { id: string; name: string; emoji: string; description: string; unlocked: boolean }[];
  recentTrades: JournalEntry[];
}

const RANK_META = [
  { color: '#FFD700', glow: 'rgba(255,215,0,0.2)',  ring: 'rgba(255,215,0,0.35)',  icon: '🥇', label: '#1' },
  { color: '#C0C0C0', glow: 'rgba(192,192,192,0.15)', ring: 'rgba(192,192,192,0.3)',  icon: '🥈', label: '#2' },
  { color: '#CD7F32', glow: 'rgba(205,127,50,0.15)', ring: 'rgba(205,127,50,0.3)',  icon: '🥉', label: '#3' },
];

function computeStreak(journals: JournalEntry[]): number {
  const days = Array.from(new Set(journals.map(j => j.date))).sort().reverse();
  let streak = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(d);
    if (!prev) { streak = 1; prev = cur; continue; }
    const diff = (prev.getTime() - cur.getTime()) / 86400000;
    if (diff <= 1) { streak++; prev = cur; } else break;
  }
  return streak;
}

export default function TraderProfiles() {
  const [leaderboard, setLeaderboard] = useState<TraderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TraderStat | null>(null);
  const [sortBy, setSortBy] = useState<'pnl' | 'winRate' | 'days' | 'streak'>('pnl');

  useEffect(() => {
    // Gather all registered users' journal stats
    const users = db.getRegisteredUsers();
    const stats: TraderStat[] = [];

    for (const u of users) {
      if (u.username === 'admin') continue; // skip admin account
      const journals = db.getJournals(u.username).filter(
        j => !['NO SETUP', 'SIMULATED'].includes(j.asset) // exclude simulator entries
      );
      if (journals.length === 0) continue; // skip users with no journals

      const wins = journals.filter(j => j.pnl > 0).length;
      const totalTrades = journals.length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      const totalPnl = journals.reduce((sum, j) => sum + j.pnl, 0);
      const loggedDays = new Set(journals.map(j => j.date)).size;
      const streak = computeStreak(journals);
      const rrTrades = journals.filter(j => j.riskReward && j.riskReward > 0);
      const avgRR = rrTrades.length > 0
        ? parseFloat((rrTrades.reduce((sum, j) => sum + (j.riskReward || 0), 0) / rrTrades.length).toFixed(2))
        : 0;

      stats.push({
        username: u.username,
        avatar: u.avatar || '👤',
        totalTrades,
        loggedDays,
        totalPnl,
        winRate,
        streak,
        avgRR,
        badges: db.getUserBadges(u.username),
        recentTrades: journals.slice(0, 5),
      });
    }

    setLeaderboard(stats);
    setLoading(false);
  }, []);

  const sorted = [...leaderboard].sort((a, b) => {
    if (sortBy === 'pnl') return b.totalPnl - a.totalPnl;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    if (sortBy === 'days') return b.loggedDays - a.loggedDays;
    if (sortBy === 'streak') return b.streak - a.streak;
    return 0;
  });

  const SORT_OPTIONS: { key: typeof sortBy; label: string; icon: React.ReactNode }[] = [
    { key: 'pnl',     label: 'Total Profit',  icon: <TrendingUp className="h-3 w-3" /> },
    { key: 'winRate', label: 'Win Rate',       icon: <Target className="h-3 w-3" /> },
    { key: 'days',    label: 'Consistency',    icon: <BookOpen className="h-3 w-3" /> },
    { key: 'streak',  label: 'Active Streak',  icon: <Flame className="h-3 w-3" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">

      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest"
          style={{ borderColor: 'rgba(34,197,94,0.3)', backgroundColor: 'rgba(34,197,94,0.05)', color: '#22c55e' }}>
          <Trophy className="h-3 w-3" />
          Journal Leaderboard
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase"
          style={{ color: 'var(--text-primary)' }}>
          Top <span style={{ color: '#22c55e' }}>Traders</span>
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Rankings based on real trading journal entries — profit, win rate, consistency, and active streaks. Log trades daily to climb the board.
        </p>
      </div>

      {/* Sort Controls */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all"
              style={
                sortBy === opt.key
                  ? { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.35)', color: '#22c55e' }
                  : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-24 text-center flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-green border-r-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Computing leaderboard...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && sorted.length === 0 && (
        <div className="py-24 flex flex-col items-center text-center space-y-4 rounded-2xl border border-dashed"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Users className="h-7 w-7" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Journal Entries Yet</h3>
            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Start logging trades in your Trading Journal — once members submit entries, the leaderboard will populate automatically.
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Grid */}
      {!loading && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((trader, idx) => {
            const rank = RANK_META[idx];
            const isProfit = trader.totalPnl >= 0;
            const unlockedBadges = trader.badges.filter(b => b.unlocked);

            return (
              <div
                key={trader.username}
                onClick={() => setSelected(trader)}
                className="group relative rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: rank ? rank.ring : 'var(--border)',
                  boxShadow: rank ? `0 0 24px ${rank.glow}` : undefined,
                }}
              >
                {/* Top rank badge */}
                {rank && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ backgroundColor: `${rank.color}18`, border: `1px solid ${rank.color}40`, color: rank.color }}>
                    {rank.icon} {rank.label}
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="p-5 pt-10 space-y-4 relative z-10 flex-1">

                  {/* Avatar + name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-11 w-11 flex items-center justify-center rounded-xl text-2xl border transition-transform group-hover:scale-105"
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                          {trader.avatar}
                        </div>
                        {/* Live dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                          style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg-card)' }} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold tracking-tight group-hover:text-brand-green transition-colors"
                          style={{ color: 'var(--text-primary)' }}>
                          {trader.username}
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {trader.loggedDays} days journaled
                        </div>
                      </div>
                    </div>

                    {/* Rank number for non-podium */}
                    {!rank && (
                      <div className="text-lg font-black" style={{ color: 'var(--text-muted)' }}>
                        #{idx + 1}
                      </div>
                    )}
                  </div>

                  {/* P&L — Hero stat */}
                  <div className="rounded-xl p-3 text-center"
                    style={{
                      backgroundColor: isProfit ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${isProfit ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                      Total Journal P&amp;L
                    </div>
                    <div className="text-xl font-black font-mono flex items-center justify-center gap-1"
                      style={{ color: isProfit ? '#22c55e' : '#ef4444' }}>
                      {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {isProfit ? '+' : '-'}${Math.abs(trader.totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Win Rate',  value: `${trader.winRate}%`,       color: trader.winRate >= 50 ? '#22c55e' : '#ef4444' },
                      { label: 'Trades',    value: trader.totalTrades,          color: 'var(--text-primary)' },
                      { label: 'Streak',    value: `${trader.streak}d 🔥`,     color: '#f59e0b' },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg p-2 text-center border"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          {s.label}
                        </div>
                        <div className="text-xs font-black font-mono mt-0.5" style={{ color: s.color }}>
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Unlocked badges */}
                  {unlockedBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {unlockedBadges.slice(0, 3).map(b => (
                        <span key={b.id} className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: 'rgba(34,197,94,0.07)', borderColor: 'rgba(34,197,94,0.2)', color: '#22c55e' }}
                          title={b.name}>
                          {b.emoji} {b.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-5 py-2.5 flex items-center justify-between border-t"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest group-hover:text-brand-green transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    View Full Stats
                  </span>
                  <BarChart2 className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 flex items-center justify-center rounded-2xl text-3xl border"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  {selected.avatar}
                </div>
                <div>
                  <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {selected.username}
                  </h3>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    @{selected.username} · {selected.totalTrades} total trades
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    <BookOpen className="h-3 w-3" />
                    Active Journal Trader
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="rounded-lg p-2 hover:bg-bg-hover transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Full stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total P&L',      value: `${selected.totalPnl >= 0 ? '+' : ''}$${selected.totalPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: selected.totalPnl >= 0 ? '#22c55e' : '#ef4444' },
                  { label: 'Win Rate',        value: `${selected.winRate}%`,    color: selected.winRate >= 50 ? '#22c55e' : '#ef4444' },
                  { label: 'Days Journaled',  value: `${selected.loggedDays}`,  color: 'var(--text-primary)' },
                  { label: 'Active Streak',   value: `${selected.streak} days 🔥`, color: '#f59e0b' },
                  { label: 'Total Trades',    value: selected.totalTrades,      color: 'var(--text-primary)' },
                  { label: 'Avg R:R',         value: selected.avgRR > 0 ? `${selected.avgRR}:1` : '—', color: '#60a5fa' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                    <div className="text-sm font-black font-mono" style={{ color: s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges */}
              {selected.badges.filter(b => b.unlocked).length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}>
                    <Award className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                    Discipline Badges
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.badges.filter(b => b.unlocked).map(b => (
                      <div key={b.id} className="flex items-center gap-2 rounded-lg p-2.5"
                        style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <span className="text-xl">{b.emoji}</span>
                        <div>
                          <div className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>{b.name}</div>
                          <div className="text-[9px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{b.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Trades */}
              {selected.recentTrades.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}>
                    <Star className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
                    Recent Journal Entries
                  </h4>
                  <div className="space-y-2">
                    {selected.recentTrades.map(trade => (
                      <div key={trade.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 border"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: trade.direction === 'BUY' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: trade.direction === 'BUY' ? '#22c55e' : '#ef4444',
                            }}>
                            {trade.direction}
                          </span>
                          <div>
                            <div className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>
                              {trade.asset}
                            </div>
                            <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                              {trade.date} · {trade.setup}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-black font-mono"
                          style={{ color: trade.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <button onClick={() => setSelected(null)}
                className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
