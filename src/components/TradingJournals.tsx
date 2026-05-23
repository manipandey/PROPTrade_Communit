// src/components/TradingJournals.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, BookOpen, AlertCircle, FileText, Check } from 'lucide-react';
import { db, JournalEntry } from '@/lib/supabase';

interface TradingJournalsProps {
  currentUser: { username: string; loggedIn: boolean; avatar: string } | null;
  onOpenAuth: () => void;
}

export default function TradingJournals({ currentUser, onOpenAuth }: TradingJournalsProps) {
  const [journals, setJournals] = useState<JournalEntry[]>(() => db.getJournals());
  const [isLoggingTrade, setIsLoggingTrade] = useState(false);

  // Form Fields
  const [asset, setAsset] = useState('XAUUSD');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [lots, setLots] = useState('1.00');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');

  // Handle Trade Submission
  const handleLogTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.loggedIn) {
      onOpenAuth();
      return;
    }
    if (!asset || !entryPrice || !exitPrice || !pnl) return;

    const newTrade: JournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      asset: asset.toUpperCase(),
      direction,
      lots: parseFloat(lots) || 0.1,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: parseFloat(exitPrice) || 0,
      pnl: parseFloat(pnl) || 0,
      notes
    };

    const updatedJournals = [newTrade, ...journals];
    setJournals(updatedJournals);
    db.saveJournals(updatedJournals);

    // Reset Form
    setAsset('XAUUSD');
    setDirection('BUY');
    setLots('1.00');
    setEntryPrice('');
    setExitPrice('');
    setPnl('');
    setNotes('');
    setIsLoggingTrade(false);
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    if (journals.length === 0) {
      return { totalTrades: 0, netPnl: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0 };
    }

    const totalTrades = journals.length;
    const wins = journals.filter((j) => j.pnl > 0);
    const losses = journals.filter((j) => j.pnl <= 0);
    
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const netPnl = journals.reduce((acc, j) => acc + j.pnl, 0);

    const totalWinVal = wins.reduce((acc, j) => acc + j.pnl, 0);
    const totalLossVal = Math.abs(losses.reduce((acc, j) => acc + j.pnl, 0));

    const avgWin = wins.length > 0 ? totalWinVal / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossVal / losses.length : 0;

    const profitFactor = totalLossVal > 0 ? totalWinVal / totalLossVal : totalWinVal > 0 ? 99.9 : 0;

    return {
      totalTrades,
      netPnl,
      winRate: Math.round(winRate),
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      profitFactor: parseFloat(profitFactor.toFixed(2))
    };
  }, [journals]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-zinc-950 pb-6">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
            Trading <span className="text-brand-green">Journals</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Cultivate pure discipline. Track setups, analyze win rate patterns, monitor daily drawdown limits, and keep an active record of your trades.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentUser?.loggedIn) {
              setIsLoggingTrade(!isLoggingTrade);
            } else {
              onOpenAuth();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all glow-accent"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log New Trade</span>
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl border border-zinc-900 bg-[#070708] p-4 text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Total Trades</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.totalTrades}</span>
        </div>
        
        <div className="rounded-xl border border-zinc-900 bg-[#070708] p-4 text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Net P&L</span>
          <span className={`text-xl font-black mt-1 block font-mono ${stats.netPnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
            {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-[#070708] p-4 text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Win Rate</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.winRate}%</span>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-[#070708] p-4 text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Profit Factor</span>
          <span className="text-xl font-black text-brand-green mt-1 block font-mono">{stats.profitFactor}</span>
        </div>

        <div className="col-span-2 md:col-span-1 rounded-xl border border-zinc-900 bg-[#070708] p-4 text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Avg Win / Loss</span>
          <span className="text-xs font-bold text-zinc-300 mt-1.5 block font-mono">
            <span className="text-brand-green">${stats.avgWin}</span>
            <span className="text-zinc-600"> / </span>
            <span className="text-red-500">${stats.avgLoss}</span>
          </span>
        </div>
      </div>

      {/* Log Trade Form Drawer */}
      {isLoggingTrade && currentUser?.loggedIn && (
        <form onSubmit={handleLogTradeSubmit} className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6 space-y-4 glow-accent animate-fade-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5 text-brand-green" />
            <span>Enter Trade Details</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Asset/Pair</label>
              <input
                type="text"
                required
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="e.g. XAUUSD"
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'BUY' | 'SELL')}
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-zinc-300 focus:border-brand-green focus:outline-none transition-all"
              >
                <option value="BUY" className="bg-black text-brand-green font-bold">BUY (Long)</option>
                <option value="SELL" className="bg-black text-red-500 font-bold">SELL (Short)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Lot Size</label>
              <input
                type="text"
                required
                value={lots}
                onChange={(e) => setLots(e.target.value)}
                placeholder="1.00"
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="e.g. 2350.50"
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Exit Price</label>
              <input
                type="number"
                step="any"
                required
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="e.g. 2362.80"
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Net Profit ($)</label>
              <input
                type="number"
                step="any"
                required
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                placeholder="e.g. 1230 or -450"
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Trade Setup & Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supply zone rejection, FVG filled on 5m chart, strict risk stop hit..."
              className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2.5 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsLoggingTrade(false)}
              className="rounded-lg border border-zinc-900 bg-black/50 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-green px-5 py-2 text-xs font-bold text-black hover:bg-brand-green/90 uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]"
            >
              Log Position
            </button>
          </div>
        </form>
      )}

      {/* Guest Lock Notification */}
      {!currentUser?.loggedIn && (
        <div className="rounded-xl border border-zinc-900 bg-[#070709] p-5 text-center flex items-center justify-center gap-3 glass-panel">
          <AlertCircle className="h-5 w-5 text-brand-green pulse-indicator" />
          <div className="text-xs text-zinc-400 text-left">
            <span className="font-bold text-white block">Simulate Your Log Book</span>
            Log active positions, record notes, and let our stats system automatically compute profit factors. Sign in to begin!
          </div>
        </div>
      )}

      {/* Journal History Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-zinc-900 pb-3">
          <BookOpen className="h-5 w-5 text-brand-green" />
          <span>Active Trade Log History</span>
        </h3>

        <div className="rounded-xl border border-zinc-900 bg-[#070708] overflow-hidden">
          {journals.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 text-xs italic">
              No trades logged yet. Click "Log New Trade" at the top to record your first transaction!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4 text-center">Type</th>
                    <th className="py-3 px-4 text-center">Lots</th>
                    <th className="py-3 px-4 text-right">Entry / Exit</th>
                    <th className="py-3 px-4 text-right">Net P&L</th>
                    <th className="py-3 px-4 max-w-[200px] hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 font-medium">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3.5 px-4 text-zinc-500 font-mono">{j.date}</td>
                      <td className="py-3.5 px-4 text-white font-bold">{j.asset}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          j.direction === 'BUY' 
                            ? 'bg-brand-green/10 text-brand-green border border-brand-green/15' 
                            : 'bg-red-950/20 text-red-500 border border-red-900/15'
                        }`}>
                          {j.direction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-zinc-400 font-mono">{j.lots.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-400 font-mono leading-none">
                        <div>{j.entryPrice.toLocaleString()}</div>
                        <div className="text-[9px] text-zinc-600 mt-1">{j.exitPrice.toLocaleString()}</div>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-black font-mono ${j.pnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                        {j.pnl >= 0 ? '+' : ''}${j.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-[200px] truncate hidden sm:table-cell" title={j.notes}>
                        {j.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
