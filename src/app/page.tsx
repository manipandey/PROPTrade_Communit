// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Hero from '@/components/Hero';
import RightPanel from '@/components/RightPanel';
import CommunityFeed from '@/components/CommunityFeed';
import TraderProfiles from '@/components/TraderProfiles';
import PayoutShowcase from '@/components/PayoutShowcase';
import LearningHub from '@/components/LearningHub';
import TradingJournals from '@/components/TradingJournals';
import Tools from '@/components/Tools';
import PropFirmReviews from '@/components/PropFirmReviews';
import Roadmap from '@/components/Roadmap';
import AuthModal from '@/components/AuthModal';
import AdSlot from '@/components/AdSlot';
import AdminPanel from '@/components/AdminPanel';

type Theme = 'dark' | 'light';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentUser, setCurrentUser] = useState<{
    username: string; loggedIn: boolean; avatar: string; isDemo?: boolean
  } | null>(null);

  // Load user and theme on mount — syncing from external localStorage store
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const user = db.getCurrentUser();
    const stored = (localStorage.getItem('propnepal_theme') as Theme) || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
    setCurrentUser(user);
    setTheme(stored);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleToggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('propnepal_theme', next);
  };

  const handleAuthSuccess = () => {
    setCurrentUser(db.getCurrentUser());
  };

  const handleLogout = () => {
    db.setCurrentUser({ username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '' });
    setCurrentUser(db.getCurrentUser());
  };

  const handleMobileToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Close mobile menu on tab change
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Left Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/* Main Area (right of sidebar) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <Topbar theme={theme} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-[1400px] mx-auto p-6 space-y-6">

            {/* ── HOME ── */}
            {activeTab === 'home' && (
              <div className="flex gap-6 animate-fade-in">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-6">
                  <Hero
                    onBrowseFeed={() => handleSetActiveTab('home')}
                    onOpenJournal={() => handleSetActiveTab('journals')}
                    onOpenAuth={() => setAuthOpen(true)}
                    isLoggedIn={currentUser?.loggedIn || false}
                    username={currentUser?.username}
                  />

                  {/* Live Trading Feed preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        Live Trading Feed
                      </h2>
                    </div>
                    <CommunityFeed currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} />
                  </div>

                  <Roadmap />
                </div>

                {/* Right Panel */}
                <div className="hidden xl:block">
                  <div className="sticky top-6 space-y-4">
                    <RightPanel onNavigate={handleSetActiveTab} />
                    <AdSlot variant="sidebar" />
                  </div>
                </div>
              </div>
            )}

            {/* ── TOP TRADERS ── */}
            {activeTab === 'profiles' && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Top Traders
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Verified funded trader profiles and performance rankings
                  </p>
                </div>
                <TraderProfiles />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── PAYOUT SHOWCASE ── */}
            {activeTab === 'payouts' && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Payout Showcase
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Verified real-time payouts processed to eSewa and Nepalese bank accounts
                  </p>
                </div>
                <PayoutShowcase />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── TRADING JOURNALS ── */}
            {activeTab === 'journals' && (
              <div className="animate-fade-in space-y-5">
                <TradingJournals
                  currentUser={currentUser}
                  onOpenAuth={() => setAuthOpen(true)}
                />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── TRADING TOOLS ── */}
            {activeTab === 'tools' && (
              <div className="animate-fade-in space-y-5">
                <Tools theme={theme} />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── PROP FIRM REVIEWS ── */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Prop Firm Reviews
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Unbiased comparisons for drawdown types, profit targets, and Nepal payout channels
                  </p>
                </div>
                <PropFirmReviews />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── LEARNING HUB ── */}
            {activeTab === 'academy' && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Learning Hub
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Master SMC, FVG fills, liquidity sweeps and evaluation strategies
                  </p>
                </div>
                <LearningHub />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── ADMIN PANEL ── */}
            {activeTab === 'admin' && currentUser?.loggedIn && currentUser.username === 'admin' && (
              <div className="animate-fade-in space-y-5">
                <AdminPanel />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
