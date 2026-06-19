// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { db } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import HomeDashboard from '@/components/HomeDashboard';
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
import LandingPage from '@/components/LandingPage';
import InstrumentCommunities from '@/components/InstrumentCommunities';
import TradingGame from '@/components/TradingGame';

export interface MarketItem {
  name: string;
  symbol: string;
  priceValue: number;
  changeValue: number;
  icon: string;
  category: string;
}

const ALL_AVAILABLE_MARKETS: MarketItem[] = [
  { name: 'NASDAQ 100', symbol: 'NAS100',  priceValue: 18940.20, changeValue: 0.82,  icon: '📈', category: 'Indices' },
  { name: 'XAUUSD', symbol: 'XAUUSD',  priceValue: 2428.50,  changeValue: -0.15, icon: '🪙', category: 'Commodities' },
  { name: 'EUR/USD',    symbol: 'EURUSD',   priceValue: 1.0842,    changeValue: 0.24,  icon: '💱', category: 'Forex' },
  { name: 'S&P 500',    symbol: 'SPX500',   priceValue: 5431.10,   changeValue: 0.45,  icon: '📊', category: 'Indices' },
  { name: 'US30 (Dow)',  symbol: 'US30',     priceValue: 39820.00,  changeValue: -0.08, icon: '🏢', category: 'Indices' },
  { name: 'GBP/USD',    symbol: 'GBPUSD',   priceValue: 1.2715,    changeValue: -0.04, icon: '💱', category: 'Forex' },
  { name: 'USD/JPY',    symbol: 'USDJPY',   priceValue: 156.82,    changeValue: 0.12,  icon: '💴', category: 'Forex' },
  { name: 'Crude Oil',  symbol: 'USOIL',    priceValue: 78.45,     changeValue: -1.20, icon: '🛢️', category: 'Commodities' },
];

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

interface ForexData {
  result: string;
  rates: Record<string, number>;
}

type Theme = 'dark' | 'light';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    username: string;
    loggedIn: boolean;
    avatar: string;
    isDemo?: boolean;
    email?: string;
  } | null>(null);
  const [markets, setMarkets] = useState<MarketItem[]>(ALL_AVAILABLE_MARKETS);
  const [watchlist, setWatchlist] = useState<string[]>(['NAS100', 'XAUUSD', 'EURUSD', 'GBPUSD']);
  const [showLanding, setShowLanding] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch real-time market data from APIs
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        let forexData: ForexData | null = null;
        try {
          const forexRes = await fetch('https://open.er-api.com/v6/latest/USD');
          if (forexRes.ok) {
            forexData = await forexRes.json();
          }
        } catch (e) {
          console.warn('Could not fetch live forex rates:', e);
        }
        
        if (forexData?.result === 'success' && forexData.rates) {
          const rates = forexData.rates;
          
          setMarkets((prev) =>
            prev.map((m) => {
              let livePrice = m.priceValue;
              let liveChange = m.changeValue;
              
              if (m.symbol === 'XAUUSD' && rates.XAU) {
                livePrice = 1 / rates.XAU;
              } else if (m.symbol === 'EURUSD' && rates.EUR) {
                livePrice = 1 / rates.EUR;
              } else if (m.symbol === 'GBPUSD' && rates.GBP) {
                livePrice = 1 / rates.GBP;
              } else if (m.symbol === 'USDJPY' && rates.JPY) {
                livePrice = rates.JPY;
              }
              
              return {
                ...m,
                priceValue: livePrice,
                changeValue: liveChange,
              };
            })
          );
        }
      } catch (error) {
        console.warn('Error updating live market data:', error);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 20000);
    return () => clearInterval(interval);
  }, []);

  // Update markets in real-time (micro-movements for tick animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const move = (Math.random() - 0.48) * 0.05;
          const nextPrice = m.priceValue * (1 + move / 100);
          const nextChange = m.changeValue + move;
          return {
            ...m,
            priceValue: nextPrice,
            changeValue: nextChange,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem('propnepal_theme') as Theme) || 'light';
    document.documentElement.setAttribute('data-theme', stored);
    setTheme(stored);

    const saved = localStorage.getItem('propnepal_watchlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchlist(parsed);
        }
      } catch {
        // ignore
      }
    }

    const unsubscribe = api.onAuthStateChange((user: any) => {
      if (user) {
        const u = {
          id: user.id,
          username: user.username || user.email?.split('@')[0] || 'User',
          loggedIn: true,
          avatar: user.avatar || '👤',
          email: user.email,
          isDemo: user.is_demo
        };
        setCurrentUser(u);
        db.setCurrentUser(u);
        setShowLanding(false);
      } else {
        const guest = { username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '', isDemo: false };
        setCurrentUser(guest);
        db.setCurrentUser(guest);
      }
      setIsInitializing(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleWatchlist = (symbol: string) => {
    let next: string[];
    if (watchlist.includes(symbol)) {
      if (watchlist.length <= 1) return; // keep at least 1 item
      next = watchlist.filter(s => s !== symbol);
    } else {
      next = [...watchlist, symbol];
    }
    setWatchlist(next);
    localStorage.setItem('propnepal_watchlist', JSON.stringify(next));
  };

  const handleToggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('propnepal_theme', next);
  };

  const handleAuthSuccess = async () => {
    const user = await api.getCurrentUser();
    if (user) {
      const u = {
        id: user.id,
        username: user.username || user.email?.split('@')[0] || 'User',
        loggedIn: true,
        avatar: user.avatar || '👤',
        email: user.email,
        isDemo: user.is_demo
      };
      setCurrentUser(u);
      db.setCurrentUser(u);
      setShowLanding(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    const guest = { username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '', isDemo: false };
    setCurrentUser(guest);
    db.setCurrentUser(guest);
    setShowLanding(true);
  };

  const handleMobileToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Close mobile menu on tab change
  const handleSetActiveTab = (tab: string, subTab?: string) => {
    setActiveTab(tab);
    if (subTab) setActiveSubTab(subTab);
    else setActiveSubTab(undefined);
    setMobileMenuOpen(false);
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-main"><div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Show landing page for unauthenticated users who haven't chosen to browse as guest
  if (showLanding && !currentUser?.loggedIn) {
    return (
      <>
        <LandingPage
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenAuth={() => setAuthOpen(true)}
          onEnterApp={() => setShowLanding(false)}
        />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

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
        <Topbar theme={theme} markets={markets} watchlist={watchlist} currentUser={currentUser} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="max-w-[1400px] mx-auto p-6 space-y-6">

            {/* ── HOME ── */}
            {activeTab === 'home' && (
              <div className="flex gap-6 animate-fade-in">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-6">
                  <HomeDashboard
                    onOpenJournal={() => handleSetActiveTab('journals')}
                    onOpenAuth={() => setAuthOpen(true)}
                    currentUser={currentUser}
                  />

                  {/* Live Trading Feed preview */}
                  <div className="space-y-3 pt-4 border-t border-border-theme">
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
                    <RightPanel
                      onNavigate={handleSetActiveTab}
                      markets={markets}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      theme={theme}
                    />
                    <AdSlot variant="sidebar" />
                  </div>
                </div>
              </div>
            )}

            {/* ── COMMUNITY FEED ── */}
            {activeTab === 'community' && (
              <div className="flex gap-6 animate-fade-in">
                {/* Left: Main content */}
                <div className="flex-1 min-w-0 space-y-6">
                  <Hero
                    onBrowseFeed={() => handleSetActiveTab('community')}
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
                    <RightPanel
                      onNavigate={handleSetActiveTab}
                      markets={markets}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      theme={theme}
                    />
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

            {/* ── PERFORMANCE FEES SHOWCASE ── */}
            {activeTab === 'payouts' && (
              <div className="animate-fade-in space-y-5">
                <div>
                  <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Performance Fees
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Verified freelancing performance fees that can be withdrawn to a Nepali bank from the RISE wallet
                  </p>
                </div>
                <PayoutShowcase />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── INSTRUMENT COMMUNITIES ── */}
            {activeTab === 'communities' && (
              <div className="animate-fade-in space-y-5">
                <InstrumentCommunities
                  currentUser={currentUser}
                  onOpenAuth={() => setAuthOpen(true)}
                />
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
                <Tools theme={theme} defaultSubTab={activeSubTab as 'calendar' | 'news' | 'margin' | 'lotSize' | 'chart'} />
                <AdSlot variant="banner" className="mt-4" />
              </div>
            )}

            {/* ── TRADING GAME ── */}
            {activeTab === 'game' && (
              <div className="animate-fade-in space-y-5">
                <TradingGame theme={theme} />
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
                <LearningHub currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} />
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
