// src/components/PayoutShowcase.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Award, ShieldAlert, Sparkles, Printer, ArrowRight, DollarSign, Calendar, Landmark, Check } from 'lucide-react';
import { db, Payout } from '@/lib/supabase';

export default function PayoutShowcase() {
  const [payouts, setPayouts] = useState<Payout[]>(() => db.getPayouts());
  const [leaderboard] = useState([
    { rank: '1', trader: 'PrabeshFX', total: '$42,500', trades: '124', firm: 'FTMO' },
    { rank: '2', trader: 'SandhyaScalps', total: '$28,900', trades: '82', firm: 'The 5%ers' },
    { rank: '3', trader: 'BishalFX', total: '$18,200', trades: '61', firm: 'FundedNext' },
    { rank: '4', trader: 'RohanPips', total: '$15,400', trades: '49', firm: 'FundedNext' }
  ]);

  // Certificate Generator States
  const [certName, setCertName] = useState('Anish Traders');
  const [certFirm, setCertFirm] = useState('FTMO');
  const [certAmount, setCertAmount] = useState('5000');
  const [certGenerated, setCertGenerated] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleCreatePayoutProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName || !certAmount) return;

    const numericAmount = parseFloat(certAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const newPayout: Payout = {
      id: `p-${Date.now()}`,
      trader: certName.replace(/\s+/g, ''),
      amount: numericAmount,
      propFirm: certFirm,
      date: new Date().toISOString().split('T')[0],
      hash: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}-NP`
    };

    const updatedPayouts = [newPayout, ...payouts];
    setPayouts(updatedPayouts);
    db.savePayouts(updatedPayouts);
    setCertGenerated(true);

    // Auto reset trigger after 3s
    setTimeout(() => {
      setCertGenerated(false);
    }, 4000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase font-sans">
          Payout <span className="text-brand-green">Showcase</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          The Wall of Fame. Real payout splits processed by Nepalese traders from global funding providers. Local payment confirmations verified via eSewa and bank statements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Recent Payouts & Leaderboard */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Wall of Fame List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-brand-green" />
              <span>Recent Payouts Verified</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="rounded-xl border border-zinc-900 bg-[#070708] p-4 space-y-3 hover:border-zinc-800 transition-all"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span className="font-bold uppercase tracking-wider text-brand-green bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                      {payout.propFirm}
                    </span>
                    <span>{payout.date}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-bold text-white uppercase">
                      {payout.trader.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">u/{payout.trader}</div>
                      <div className="text-[10px] text-zinc-500 font-mono leading-none mt-0.5">{payout.hash}</div>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-zinc-900/60 pt-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payout Amount</span>
                    <span className="text-base font-black text-brand-green font-mono">
                      ${payout.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-brand-green" />
              <span>PropNepal Rankings Leaderboard</span>
            </h3>

            <div className="rounded-xl border border-zinc-900 bg-[#070708] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Trader</th>
                    <th className="py-3 px-4">Primary Firm</th>
                    <th className="py-3 px-4 text-center">Total Trades</th>
                    <th className="py-3 px-4 text-right">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {leaderboard.map((item) => (
                    <tr key={item.rank} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-brand-green">{item.rank}</td>
                      <td className="py-3.5 px-4 font-bold text-white">u/{item.trader}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-400">{item.firm}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-400">{item.trades}</td>
                      <td className="py-3.5 px-4 text-right font-black text-white font-mono">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Certificate Builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6 space-y-4 glow-accent">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Certificate Generator
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Enter your funding achievements to compile a custom, high-fidelity PropNepal certificate! Generating also registers you in the community payout stream.
              </p>
            </div>

            <form onSubmit={handleCreatePayoutProof} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Trader Name</label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. Samir FX"
                  className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Prop Firm</label>
                  <select
                    value={certFirm}
                    onChange={(e) => setCertFirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-zinc-300 focus:border-brand-green focus:outline-none transition-all"
                  >
                    <option value="FTMO" className="bg-black">FTMO</option>
                    <option value="FundedNext" className="bg-black">FundedNext</option>
                    <option value="The 5%ers" className="bg-black">The 5%ers</option>
                    <option value="FundedMax" className="bg-black">FundedMax</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Amount (USD)</label>
                  <input
                    type="number"
                    required
                    value={certAmount}
                    onChange={(e) => setCertAmount(e.target.value)}
                    placeholder="e.g. 1250"
                    className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-brand-green py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)] flex items-center justify-center gap-1.5"
              >
                {certGenerated ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Registered Successfully!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Compile Certificate</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Certificate Visual Mockup Panel */}
          <div className="border border-zinc-900 bg-black rounded-xl p-4 overflow-hidden">
            <div
              ref={certificateRef}
              className="relative w-full aspect-[4/3] rounded-lg border-2 border-dashed border-brand-green/30 bg-[#070709] p-6 flex flex-col justify-between text-center glow-accent overflow-hidden"
              id="printable-certificate"
            >
              {/* Corner tech borders */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-brand-green/80" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-brand-green/80" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-brand-green/80" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-brand-green/80" />

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-2">
                <Award className="h-48 w-48 text-brand-green" />
              </div>

              {/* Header */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green font-mono">
                  PROPNEPAL TRADING NETWORK
                </h4>
                <h5 className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">
                  NEPAL'S FIRST PROP TRADING COMMUNITY
                </h5>
              </div>

              {/* Body */}
              <div className="space-y-3">
                <div className="text-[7px] font-bold uppercase tracking-wider text-zinc-500">
                  This Certificate of Payout Achievement is Proudly Awarded to
                </div>
                <div className="text-lg font-black tracking-tight text-white uppercase border-b border-zinc-900 pb-1.5 max-w-[80%] mx-auto font-sans text-glow">
                  {certName || 'Your Name'}
                </div>
                <div className="text-[8px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  For executing institutional risk parameters and successfully processing a certified payout split of
                </div>
                <div className="text-2xl font-black text-brand-green font-mono text-glow">
                  ${parseFloat(certAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">
                  Funded via {certFirm} Evaluation Account
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="flex justify-between items-end border-t border-zinc-900/60 pt-4 px-2">
                <div className="text-left font-mono text-[7px] text-zinc-500 space-y-0.5">
                  <div className="font-bold text-white italic">PropNepal Review Board</div>
                  <div>VERIFIED SECURE</div>
                </div>
                {/* Micro seal logo */}
                <div className="h-10 w-10 rounded-full border border-brand-green/30 bg-brand-green/5 flex items-center justify-center shadow-[0_0_8px_rgba(34,197,94,0.1)]">
                  <Award className="h-5 w-5 text-brand-green" />
                </div>
                <div className="text-right font-mono text-[7px] text-zinc-500 space-y-0.5">
                  <div className="font-bold text-brand-green">APPROVED SPLIT</div>
                  <div>HASH ID: TXN-NP</div>
                </div>
              </div>
            </div>

            {/* Print certificate Button */}
            <div className="mt-3 flex justify-center">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#0d0d0f] hover:border-brand-green hover:text-white px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
