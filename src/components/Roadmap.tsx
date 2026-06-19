// src/components/Roadmap.tsx
'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function Roadmap() {
  const milestones = [
    {
      quarter: 'Q1 2026',
      title: 'Community Portal Launch',
      status: 'completed',
      desc: 'Nepal\'s first trading-tech social network initialized. Launch of discussion forums, verified trader status badges, and payout split registers.',
      points: ['Establish local core moderation board', 'Launch certificate validator utility', 'Support initial user profile cards']
    },
    {
      quarter: 'Q2 2026',
      title: 'Discipline Journaling Engine',
      status: 'active',
      desc: 'Active logging system for funded and evaluation traders. Automatically computes net profit curves, average risk-to-reward splits, and win ratios.',
      points: ['Support custom export options', 'Integrated trade journaling calendar', 'Live market price feeds mapping']
    },
    {
      quarter: 'Q3 2026',
      title: 'Automated Discord & Telegram Bots',
      status: 'planned',
      desc: 'Connect our platform feed directly with local messaging servers. Broadcast payout proofs, daily NEPSE summaries, and order blocks directly into channels.',
      points: ['Webhook triggers for payout verification', 'Daily order block scanning alert triggers', 'Nepal local community leaderboards sync']
    },
    {
      quarter: 'Q4 2026',
      title: 'propNPL CopyTrading Pool',
      status: 'planned',
      desc: 'Establish a decentralized matching engine allowing retail capital to follow and copy trades executed by verified top funded traders on our platform.',
      points: ['Localized matching pools', 'Strict smart-contract escrow split setups', 'Real-time copy-execution mirrors']
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Community <span className="text-brand-green">Roadmap</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Building the future of trading in Nepal. Follow our development stages as we build tools, indicators, copy networks, and bots to empower local traders.
        </p>
      </div>

      {/* Timeline Layout */}
      <div className="relative border-l border-border-theme ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10 max-w-3xl mx-auto text-left">
        {milestones.map((ms, index) => {
          const isActive = ms.status === 'active';
          const isCompleted = ms.status === 'completed';
          
          return (
            <div key={index} className="relative">
              {/* Left timeline indicator circle */}
              <div className={`absolute -left-[31px] sm:-left-[47px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-bg transition-all ${
                isCompleted 
                  ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                  : isActive 
                    ? 'border-brand-green bg-bg text-brand-green pulse-indicator shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : 'border-border-theme text-text-muted'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isActive ? (
                  <Circle className="h-2 w-2 fill-current" />
                ) : (
                  <Circle className="h-2 w-2" />
                )}
              </div>

              {/* Card Container */}
              <div className={`rounded-xl border p-5 sm:p-6 transition-all duration-300 ${
                isActive 
                  ? 'border-brand-green/30 bg-bg-input glow-accent' 
                  : 'border-border-theme bg-bg-card hover:border-border-hover'
              }`}>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-theme/60 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-widest block">
                      TIMELINE TARGET
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-text-primary mt-0.5">
                      {ms.title}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCompleted 
                      ? 'bg-bg-input text-text-secondary border border-border-theme' 
                      : isActive 
                        ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                        : 'bg-bg text-text-muted border border-border-theme'
                  }`}>
                    {ms.quarter} • {ms.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {ms.desc}
                </p>

                {/* Bullets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ms.points.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-start space-x-2 text-[11px] text-text-secondary leading-snug">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-green flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
