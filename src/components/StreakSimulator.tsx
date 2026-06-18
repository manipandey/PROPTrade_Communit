// src/components/StreakSimulator.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Award, AlertTriangle } from 'lucide-react';
import { db, JournalEntry } from '@/lib/supabase';
import { checkPlanAlignment } from './TradingJournals';

interface DayItem {
  day: number;
  dateStr: string;
  label: string;
  logged: boolean;
  status: 'win' | 'loss' | 'no-setup' | null;
  pnl: string | null;
  violated?: boolean;
  violations?: string[];
}

interface StreakSimulatorProps {
  journals?: JournalEntry[];
  currentUser?: { username: string; loggedIn: boolean; avatar: string; isDemo?: boolean } | null;
  onRefresh?: () => void;
}

export default function StreakSimulator({ journals = [], currentUser = null, onRefresh }: StreakSimulatorProps) {
  const [editingDay, setEditingDay] = useState<DayItem | null>(null);
  const [editStatus, setEditStatus] = useState<'win' | 'loss' | 'no-setup' | 'empty'>('empty');
  const [editPnl, setEditPnl] = useState<string>('');

  // Generate the last 30 calendar days ending today, mapped to real user journal entries
  const days: DayItem[] = useMemo(() => {
    const list: DayItem[] = [];
    const journalsList = journals || [];

    for (let i = 29; i >= 0; i--) {
      // Calculate date offset from today
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Formulate UTC date matching dateStr to prevent timezone shift in display label
      const parts = dateStr.split('-').map(Number);
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      const label = utcDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

      // Find matching journal entries for this date
      const dayEntries = journalsList.filter(j => j.date === dateStr);

      if (dayEntries.length > 0) {
        // If all entries on this day are recorded as No Setup, treat as No Setup Day
        const allNoSetup = dayEntries.every(j => j.setup === 'No Setup');
        
        // Calculate plan violations for this day
        const dayViolations: string[] = [];
        dayEntries.forEach(entry => {
          const alignment = checkPlanAlignment(entry.date, entry.direction, entry.riskPct, entry.author);
          if (alignment.status === 'violated') {
            dayViolations.push(...alignment.violations);
          }
        });
        const isViolated = dayViolations.length > 0;
        const uniqueViolations = Array.from(new Set(dayViolations));

        if (allNoSetup) {
          list.push({
            day: 30 - i,
            dateStr,
            label,
            logged: true,
            status: 'no-setup',
            pnl: '—',
            violated: isViolated,
            violations: uniqueViolations
          });
        } else {
          const netPnl = dayEntries.reduce((sum, j) => sum + j.pnl, 0);
          
          if (netPnl > 0) {
            list.push({
              day: 30 - i,
              dateStr,
              label,
              logged: true,
              status: 'win',
              pnl: `+$${netPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              violated: isViolated,
              violations: uniqueViolations
            });
          } else if (netPnl < 0) {
            list.push({
              day: 30 - i,
              dateStr,
              label,
              logged: true,
              status: 'loss',
              pnl: `-$${Math.abs(netPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              violated: isViolated,
              violations: uniqueViolations
            });
          } else {
            // Net P&L is exactly 0 but has active trade entries
            const hasNoSetup = dayEntries.some(j => j.setup === 'No Setup');
            list.push({
              day: 30 - i,
              dateStr,
              label,
              logged: true,
              status: hasNoSetup ? 'no-setup' : 'win',
              pnl: hasNoSetup ? '—' : '+$0',
              violated: isViolated,
              violations: uniqueViolations
            });
          }
        }
      } else {
        list.push({
          day: 30 - i,
          dateStr,
          label,
          logged: false,
          status: null,
          pnl: null
        });
      }
    }
    return list;
  }, [journals]);

  const handleDayClick = (d: DayItem) => {
    setEditingDay(d);
    setEditStatus(d.status || 'empty');
    if (d.status === 'win' || d.status === 'loss') {
      setEditPnl(d.pnl ? d.pnl.replace(/[^0-9.]/g, '') : '');
    } else {
      setEditPnl('');
    }
  };

  const handleSaveDay = () => {
    if (!editingDay || !currentUser?.loggedIn) return;

    // Load active logs and clear entries for selected date
    const currentJournals = db.getJournals(currentUser.username);
    let updated = currentJournals.filter(j => j.date !== editingDay.dateStr);

    // If configured as non-empty status, insert corresponding simulated log entry
    if (editStatus !== 'empty') {
      const numVal = parseFloat(editPnl) || 0;
      const newEntry: JournalEntry = {
        id: `j-sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: editingDay.dateStr,
        asset: editStatus === 'no-setup' ? 'NO SETUP' : 'SIMULATED',
        direction: editStatus === 'loss' ? 'SELL' : 'BUY',
        lots: editStatus === 'no-setup' ? 0 : 1.0,
        entryPrice: editStatus === 'no-setup' ? 0 : 100,
        exitPrice: editStatus === 'no-setup' ? 0 : (editStatus === 'win' ? 100 + numVal : 100 - numVal),
        pnl: editStatus === 'no-setup' ? 0 : (editStatus === 'win' ? numVal : -numVal),
        notes: 'Logged via Streak Simulator interactive calendar config.',
        emotion: editStatus === 'win' ? 'calm' : editStatus === 'loss' ? 'anxious' : 'neutral',
        setup: editStatus === 'no-setup' ? 'No Setup' : 'Other',
        author: currentUser.username,
        session: 'London',
        newsChecked: true,
        riskSet: true,
        mindsetReady: true
      };
      updated = [newEntry, ...updated];
    }

    db.saveJournals(currentUser.username, updated);
    if (onRefresh) onRefresh();
    setEditingDay(null);
  };

  const handleResetCalendar = () => {
    if (!currentUser?.loggedIn) return;
    if (!confirm('Are you sure you want to clear all journal entries for the last 30 days? This will permanently delete both simulated and standard logs in this date range.')) return;

    const rollingDates = days.map(d => d.dateStr);
    const currentJournals = db.getJournals(currentUser.username);
    const updated = currentJournals.filter(j => !rollingDates.includes(j.date));

    db.saveJournals(currentUser.username, updated);
    if (onRefresh) onRefresh();
    setEditingDay(null);
  };

  // Calculations
  const loggedDaysCount = days.filter(d => d.logged).length;

  // Streak logic
  let longestStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < days.length; i++) {
    if (days[i].logged) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  const disciplineScore = Math.min(50 + (loggedDaysCount * 1.6), 98);
  const avgDrawdown = Math.max(3.8 - (loggedDaysCount * 0.1), 1.0).toFixed(1);

  // Badges list
  const badgesList = [
    { id: 'apprentice', name: 'Discipline Apprentice', icon: '🛡️', requirement: '5-Day Streak', color: '#3b82f6', unlocked: longestStreak >= 5 },
    { id: 'warrior', name: 'Consistency Warrior', icon: '⚔️', requirement: '10-Day Streak', color: '#8b5cf6', unlocked: longestStreak >= 10 },
    { id: 'candidate', name: 'Funded Candidate', icon: '🎓', requirement: '15-Day Streak', color: '#f59e0b', unlocked: longestStreak >= 15 },
    { id: 'elite', name: 'Prop Elite', icon: '🏆', requirement: '20-Day Streak', color: '#ec4899', unlocked: longestStreak >= 20 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Grid view */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">Interactive Calendar</span>
            <span className="text-[10px] text-zinc-400 font-medium">Click a day to log your results</span>
          </div>
          {currentUser?.loggedIn && (
            <button
              onClick={handleResetCalendar}
              className="text-[10px] hover:text-brand-green font-bold uppercase transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Reset Calendar 🔄
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {days.map(d => {
            const isLogged = d.logged;
            const isWin = d.status === 'win';
            const isLoss = d.status === 'loss';
            const isNoSetup = d.status === 'no-setup';

            let cellBg = 'var(--bg-card)';
            let cellBorder = 'var(--border)';
            let labelColor = 'var(--text-muted)';
            let glowEffect = 'none';

            if (isLogged) {
              if (isWin) {
                cellBg = 'rgba(34, 197, 94, 0.08)';
                cellBorder = d.violated ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.35)';
                labelColor = '#22c55e';
                glowEffect = d.violated ? '0 0 10px rgba(239, 68, 68, 0.2)' : '0 0 10px rgba(34, 197, 94, 0.15)';
              } else if (isLoss) {
                cellBg = 'rgba(239, 68, 68, 0.08)';
                cellBorder = d.violated ? 'rgba(239, 68, 68, 0.75)' : 'rgba(239, 68, 68, 0.35)';
                labelColor = '#ef4444';
                glowEffect = '0 0 10px rgba(239, 68, 68, 0.15)';
              } else if (isNoSetup) {
                cellBg = 'rgba(59, 130, 246, 0.08)';
                cellBorder = d.violated ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.35)';
                labelColor = '#3b82f6';
                glowEffect = d.violated ? '0 0 10px rgba(239, 68, 68, 0.2)' : '0 0 10px rgba(59, 130, 246, 0.15)';
              }
            }

            if (editingDay?.dateStr === d.dateStr) {
              cellBorder = 'var(--brand-green)';
            }

            return (
              <button
                key={d.dateStr}
                disabled={!currentUser?.loggedIn}
                onClick={() => handleDayClick(d)}
                className="aspect-square flex flex-col items-center justify-between p-2 rounded-xl border transition-all duration-300 hover:scale-[1.05] disabled:cursor-not-allowed relative"
                style={{
                  backgroundColor: cellBg,
                  borderColor: cellBorder,
                  boxShadow: glowEffect
                }}
              >
                {d.violated && (
                  <div className="absolute top-1 right-1 text-red-500" title="Rules Violated!">
                    <AlertTriangle className="h-2.5 w-2.5" />
                  </div>
                )}
                <span className="text-[9px] font-black uppercase" style={{ color: labelColor }}>
                  {d.label}
                </span>

                {isLogged ? (
                  <>
                    <span className="text-[10px] font-extrabold font-mono" style={{ color: isWin ? '#22c55e' : isLoss ? '#ef4444' : '#3b82f6' }}>
                      {d.pnl}
                    </span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-center" style={{ color: isWin ? 'rgba(34, 197, 94, 0.7)' : isLoss ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)' }}>
                      {isNoSetup ? 'NO SETUP' : d.status} {d.violated ? '⚠️' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-zinc-600 group-hover:text-zinc-400">+</span>
                    <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-extrabold">EMPTY</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Day Customization Panel */}
        {editingDay !== null && currentUser?.loggedIn && (
          <div className="rounded-2xl border p-5 mt-4 space-y-4 animate-fade-in text-left" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                Configure {editingDay.label}
              </h4>
              <button onClick={() => setEditingDay(null)} className="text-[10px] text-zinc-400 hover:text-zinc-200 font-bold uppercase transition-colors">
                Cancel ✕
              </button>
            </div>

            {editingDay.violated && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3.5 space-y-1.5 animate-fade-in text-left">
                <div className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase tracking-wide">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Trading Rules Violated
                </div>
                <ul className="list-disc pl-4 text-xs text-text-secondary space-y-1 leading-relaxed">
                  {editingDay.violations?.map((v, idx) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { value: 'win', label: 'Win Trade 🟩', color: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.35)', activeColor: '#22c55e' },
                { value: 'loss', label: 'Loss Trade 🟥', color: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.35)', activeColor: '#ef4444' },
                { value: 'no-setup', label: 'No Setup 🟦', color: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.35)', activeColor: '#3b82f6' },
                { value: 'empty', label: 'Clear ✕', color: 'var(--bg-secondary)', borderColor: 'var(--border)', activeColor: 'var(--text-muted)' }
              ] as const).map(opt => {
                const isActive = editStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setEditStatus(opt.value);
                      if (opt.value === 'win' && !editPnl) setEditPnl('250');
                      if (opt.value === 'loss' && !editPnl) setEditPnl('100');
                    }}
                    className="py-2.5 px-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border transition-all hover:scale-[1.03]"
                    style={{
                      backgroundColor: isActive ? opt.color : 'var(--bg-secondary)',
                      borderColor: isActive ? opt.borderColor : 'var(--border)',
                      color: isActive ? opt.activeColor : 'var(--text-secondary)'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {(editStatus === 'win' || editStatus === 'loss') && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  {editStatus === 'win' ? 'Profit Amount (USD)' : 'Loss Amount (USD)'}
                </label>
                <div className="relative rounded-lg overflow-hidden border border-border-theme flex items-center bg-bg-input">
                  <span className="pl-3 text-xs text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    value={editPnl}
                    onChange={e => setEditPnl(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full bg-transparent border-0 py-2.5 px-2 text-xs text-text-primary focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setEditingDay(null)}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDay}
                className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}
              >
                Save Day
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics view */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-2xl border p-5 space-y-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-brand-green" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Consistent Habits</div>
              <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Discipline Analytics</h3>
            </div>
          </div>

          {/* Discipline Score Indicator */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-zinc-800"
              style={{ borderLeftColor: '#22c55e', borderTopColor: '#22c55e', borderBottomColor: disciplineScore >= 80 ? '#22c55e' : '#27272a' }}>
              <div className="text-center">
                <span className="text-lg font-black text-brand-green">{disciplineScore.toFixed(0)}%</span>
                <div className="text-[7px] font-bold uppercase tracking-widest text-zinc-400">Score</div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Journaling Discipline</div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your discipline score updates as you log daily trades. Passing evaluations requires consistency, not just lucky wins.
              </p>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Logged Days', value: `${loggedDaysCount}/30`, color: 'var(--text-primary)' },
              { label: 'Longest Streak', value: `${longestStreak} Days`, color: '#22c55e' },
              { label: 'Avg Drawdown', value: `${avgDrawdown}%`, color: '#ef4444' }
            ].map(s => (
              <div key={s.label} className="text-center rounded-xl p-2 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">{s.label}</div>
                <div className="text-xs font-black font-mono" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Badges checklist */}
          <div className="space-y-2.5">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400">Unlocked Badges</div>
            <div className="grid grid-cols-2 gap-2">
              {badgesList.map(b => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 p-2 rounded-xl border transition-all duration-300"
                  style={{
                    backgroundColor: b.unlocked ? `${b.color}08` : 'var(--bg-secondary)',
                    borderColor: b.unlocked ? `${b.color}25` : 'var(--border)',
                    opacity: b.unlocked ? 1 : 0.4
                  }}
                >
                  <span className="text-lg">{b.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold truncate" style={{ color: b.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{b.name}</div>
                    <div className="text-[7px] font-medium text-zinc-500 uppercase">{b.requirement}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
