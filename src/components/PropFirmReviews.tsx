// src/components/PropFirmReviews.tsx
'use client';

import React, { useState } from 'react';
import { Star, ShieldCheck, Check, X, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, Review } from '@/lib/supabase';

export default function PropFirmReviews() {
  const [reviews] = useState<Review[]>(() => db.getReviews());
  const [selectedFirmId, setSelectedFirmId] = useState<string>('rf-1');

  const activeFirm = reviews.find((r) => r.id === selectedFirmId) || reviews[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Prop Firm <span className="text-brand-green">Reviews</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Unbiased comparisons. Evaluating major global prop firms based on target payout ratios, daily drawdown models, slip controls, and ease of processing payouts directly inside Nepal.
        </p>
      </div>

      {/* Comparison Grid Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 font-mono">
          <ShieldCheck className="h-4.5 w-4.5 text-brand-green" />
          <span>Firms Comparison Matrix</span>
        </h3>

        <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-theme bg-bg-input/40 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  <th className="py-3 px-4">Prop Provider</th>
                  <th className="py-3 px-4 text-center">Trust Rating</th>
                  <th className="py-3 px-4 text-center">Profit Target</th>
                  <th className="py-3 px-4 text-center">Daily Drawdown</th>
                  <th className="py-3 px-4 text-center">Max Drawdown</th>
                  <th className="py-3 px-4 text-center">Refundable Fee</th>
                  <th className="py-3 px-4 text-center">Nepal Local Payouts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-theme/40">
                {reviews.map((firm) => (
                  <tr
                    key={firm.id}
                    onClick={() => setSelectedFirmId(firm.id)}
                    className={`cursor-pointer transition-all ${
                      selectedFirmId === firm.id 
                        ? 'bg-brand-green/5 text-text-primary font-bold' 
                        : 'hover:bg-bg-hover/30 text-text-secondary'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-text-primary flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-brand-green pulse-indicator" />
                      <span>{firm.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-text-primary">
                        <Star className="h-3 w-3 text-brand-green fill-current" />
                        {firm.rating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{firm.profitTarget.split(' (')[0]}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-red-400">{firm.dailyDrawdown.split(' (')[0]}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-red-500">{firm.maxDrawdown}</td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded text-[10px]">
                        Yes
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-text-secondary">
                        <Landmark className="h-3.5 w-3.5 text-brand-green" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {firm.localSupport.includes('Direct Bank') || firm.localSupport.includes('eSewa') ? 'HIGH' : 'STANDARD'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Local Payment/Direct eSewa Advice Box */}
      <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 flex gap-3 text-xs leading-relaxed max-w-4xl mx-auto">
        <AlertCircle className="h-5 w-5 text-brand-green flex-shrink-0" />
        <div className="space-y-1 text-left">
          <span className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Nepal Payout Tips:</span>
          <p className="text-text-secondary">
            For direct payment in NPR, **FundedNext** offers native eSewa transfer splits and local Nepal bank transfers. For **FTMO**, the most optimized route is requesting payouts as Freelancing performance fees via Deel or RISE wallet, which can be withdrawn directly into your local Nepalese bank account.
          </p>
        </div>
      </div>

      {/* Detail Showcase Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        {/* Core details column */}
        <div className="md:col-span-6 rounded-xl border border-border-theme bg-bg-card p-6 space-y-4 glow-accent">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-text-primary">{activeFirm.name} Performance Overview</h3>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-brand-green text-xs bg-brand-green/10 px-2 py-1 rounded">
              <Star className="h-3.5 w-3.5 fill-current" />
              {activeFirm.rating} / 5.0
            </span>
          </div>

          <div className="space-y-3.5 text-xs text-text-secondary">
            <div className="flex justify-between py-2 border-b border-border-theme">
              <span className="font-semibold text-text-muted">Daily Drawdown Cap</span>
              <span className="font-mono text-text-primary font-bold">{activeFirm.dailyDrawdown}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-theme">
              <span className="font-semibold text-text-muted">Maximum Allowed Drawdown</span>
              <span className="font-mono text-text-primary font-bold">{activeFirm.maxDrawdown}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-theme">
              <span className="font-semibold text-text-muted">Profit Challenge Targets</span>
              <span className="font-mono text-text-primary font-bold">{activeFirm.profitTarget}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-theme">
              <span className="font-semibold text-text-muted">Fee Refund Policy</span>
              <span className="text-text-secondary font-bold">{activeFirm.refundFee}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-theme">
              <span className="font-semibold text-text-muted">Nepal Wallet Integrations</span>
              <span className="text-brand-green font-bold">{activeFirm.localSupport}</span>
            </div>
          </div>
        </div>

        {/* Pros & Cons column */}
        <div className="md:col-span-6 space-y-6">
          {/* Pros */}
          <div className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-green flex items-center gap-1.5">
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Verified Advantages</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              {activeFirm.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-brand-green flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
              <X className="h-4 w-4 stroke-[3]" />
              <span>Key Drawbacks</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-text-secondary">
              {activeFirm.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
