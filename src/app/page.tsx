// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CommunityFeed from '@/components/CommunityFeed';
import TraderProfiles from '@/components/TraderProfiles';
import PayoutShowcase from '@/components/PayoutShowcase';
import LearningHub from '@/components/LearningHub';
import TradingJournals from '@/components/TradingJournals';
import PropFirmReviews from '@/components/PropFirmReviews';
import Roadmap from '@/components/Roadmap';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Trophy, TrendingUp, ShieldAlert, Sparkles, Flame, GraduationCap, Compass, Landmark } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; loggedIn: boolean; avatar: string } | null>(null);

  // Load user status on mount
  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleAuthSuccess = (username: string) => {
    const updatedUser = db.getCurrentUser();
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    db.setCurrentUser({ username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '' });
    setCurrentUser(db.getCurrentUser());
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Sticky Header with Ticker Tape */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab Render Orchestration */}
      <main className="flex-1 w-full bg-black">
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fade-in pb-16">
            
            {/* Hero Splash section */}
            <Hero
              onBrowseFeed={() => setActiveTab('feed')}
              onOpenJournal={() => setActiveTab('journals')}
              onOpenAuth={() => setAuthOpen(true)}
              isLoggedIn={currentUser?.loggedIn || false}
            />

            {/* Core Feature Cards */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 space-y-2">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/5 border border-brand-green/15 px-3 py-1 rounded-full font-mono">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Platform Suite</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Why Funded Traders Choose <span className="text-brand-green">PropNepal</span>
                </h2>
                <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                  A high-tech digital sandbox containing specialized evaluation tools, community logs, and direct localized advice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  onClick={() => setActiveTab('payouts')}
                  className="group rounded-xl border border-zinc-900 bg-[#070708] p-5 cursor-pointer hover:border-brand-green/30 hover:scale-[1.01] transition-all"
                >
                  <Trophy className="h-7 w-7 text-brand-green mb-3 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white group-hover:text-brand-green">
                    Payout showcase
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                    Verify real-time splits processed directly to Nepalese eSewa wallets and bank transfers. Check recent leaderboards!
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('journals')}
                  className="group rounded-xl border border-zinc-900 bg-[#070708] p-5 cursor-pointer hover:border-brand-green/30 hover:scale-[1.01] transition-all"
                >
                  <TrendingUp className="h-7 w-7 text-brand-green mb-3 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white group-hover:text-brand-green">
                    Trading Journals
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                    Log entry/exit trades inside an automated mathematical tracker. Calculate win rates and cumulative profit targets.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="group rounded-xl border border-zinc-900 bg-[#070708] p-5 cursor-pointer hover:border-brand-green/30 hover:scale-[1.01] transition-all"
                >
                  <Landmark className="h-7 w-7 text-brand-green mb-3 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white group-hover:text-brand-green">
                    Prop Firm Reviews
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                    Unbiased comparison reviews rating drawdown types, profit target policies, news gaps, and Nepalese support channels.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('academy')}
                  className="group rounded-xl border border-zinc-900 bg-[#070708] p-5 cursor-pointer hover:border-brand-green/30 hover:scale-[1.01] transition-all"
                >
                  <GraduationCap className="h-7 w-7 text-brand-green mb-3 stroke-[2.5]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-white group-hover:text-brand-green">
                    Learning Academy
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                    Master Smart Money Concepts, FVG, Asian sweeps, and strict drawdown rules. Take our trading style assessment quiz!
                  </p>
                </div>
              </div>
            </section>

            {/* Featured Discussions Preview Block */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 border-y border-zinc-950 py-12 bg-[#040405]">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">HIGHLIGHTED DISCUSSIONS</h3>
                  <h4 className="text-lg font-black text-white uppercase">What traders are talking about today</h4>
                </div>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:underline uppercase tracking-wider"
                >
                  <span>Go to Community Feed</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab('feed')}
                  className="rounded-xl border border-zinc-900 bg-black p-5 cursor-pointer hover:border-zinc-800 transition-all text-left space-y-2.5"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>BY u/PrabeshFX</span>
                    <span className="text-brand-green bg-brand-green/10 px-2 py-0.5 rounded font-bold uppercase">FTMO RULES</span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                    How to handle daily drawdown limits on FTMO? Sharing my risk management framework
                  </h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    Many traders fail not because of their strategy, but because they violate the 5% daily drawdown rule. Here is my exact protocol...
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('feed')}
                  className="rounded-xl border border-zinc-900 bg-black p-5 cursor-pointer hover:border-zinc-800 transition-all text-left space-y-2.5"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                    <span>BY u/BishalFX</span>
                    <span className="text-brand-green bg-brand-green/10 px-2 py-0.5 rounded font-bold uppercase">PAYOUTS</span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                    Got my first payout approved on FundedNext! $1,240 payout split processed via eSewa!
                  </h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    Stoked to share that my 80/20 split payout from FundedNext was processed today! I requested it yesterday and it arrived directly via eSewa in NRS...
                  </p>
                </div>
              </div>
            </section>

            {/* Development Roadmap section */}
            <Roadmap />
          </div>
        )}

        {activeTab === 'feed' && <CommunityFeed currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} />}

        {activeTab === 'profiles' && <TraderProfiles />}

        {activeTab === 'payouts' && <PayoutShowcase />}

        {activeTab === 'journals' && (
          <TradingJournals currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} />
        )}

        {activeTab === 'reviews' && <PropFirmReviews />}

        {activeTab === 'academy' && <LearningHub />}
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Global simulated AuthModal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
