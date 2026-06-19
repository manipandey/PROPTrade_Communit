// src/components/Footer.tsx
'use client';

import React from 'react';
import { ShieldAlert, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border-theme bg-bg-secondary text-xs py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-green to-emerald-600">
                <Shield className="h-4.5 w-4.5 text-black stroke-[2.5]" />
              </div>
              <span className="text-sm font-black tracking-tight text-text-primary uppercase font-sans">
                Alpha<span className="text-brand-green">Journal</span>
              </span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Nepal&apos;s premier prop trading community portal. Sharing evaluations, verifying payouts, logging trading journals, and building a disciplined local retail trading ecosystem.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-primary mb-3">Platform Links</h4>
            <ul className="space-y-2 text-text-muted text-[11px]">
              <li><span className="hover:text-brand-green cursor-pointer">Community Discussions</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">Trader Rankings Leaderboard</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">Certificate Validator Engine</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">Discipline Trade Journal Logs</span></li>
            </ul>
          </div>

          {/* Prop Reviews links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-primary mb-3">Funding Reviews</h4>
            <ul className="space-y-2 text-text-muted text-[11px]">
              <li><span className="hover:text-brand-green cursor-pointer">FTMO Rules Evaluation</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">FundedNext Nepal Bank Payouts</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">The 5%ers Scaling Program</span></li>
              <li><span className="hover:text-brand-green cursor-pointer">Drawdown Models Compared</span></li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-primary mb-3">Support & Network</h4>
            <ul className="space-y-2 text-text-muted text-[11px]">
              <li><span>Email: support@alphajournal.com</span></li>
              <li><span>Kathmandu, Nepal</span></li>
              <li className="inline-flex items-center gap-1 bg-brand-green/5 border border-brand-green/10 text-brand-green rounded px-2.5 py-1 text-[10px] font-mono font-bold mt-1.5 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green pulse-indicator" />
                <span>ALL SYSTEMS STABLE</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="rounded-xl border border-border-theme bg-bg-input/45 p-4 flex gap-3 text-[10px] leading-relaxed text-text-muted max-w-4xl mx-auto">
          <ShieldAlert className="h-5 w-5 text-text-muted flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <span className="font-bold text-text-secondary uppercase tracking-widest block text-[9px]">Financial & Evaluation Disclosure</span>
            <p>
              AlphaJournal is an educational community portal and trade journaling provider. AlphaJournal does not offer direct trading challenges, financial brokerage services, or retail advisory accounts. Funded evaluations are simulated challenges offered by external firms where payouts represent performance fees. Trading financial instruments carries high risk. Adhere strictly to proper sizing parameters.
            </p>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border-theme pt-6 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <div>
            &copy; {new Date().getFullYear()} AlphaJournal. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-brand-green fill-current" />
            <span>for Nepalese Retail Traders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
