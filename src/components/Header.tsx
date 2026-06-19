// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Menu, X, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { db } from '@/lib/supabase';

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

interface ForexData {
  result: string;
  rates: Record<string, number>;
}

interface HeaderProps {
  currentUser: { id?: string; username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string; } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TickerItem {
  symbol: string;
  priceValue: number;
  changeValue: number;
}

export default function Header({ currentUser, onOpenAuth, onLogout, activeTab, setActiveTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerData, setTickerData] = useState<TickerItem[]>([
    { symbol: 'XAUUSD', priceValue: 2428.50, changeValue: 1.24 },
    { symbol: 'EURUSD', priceValue: 1.0832, changeValue: 0.08 },
    { symbol: 'US30 (Dow)', priceValue: 39820, changeValue: -0.15 },
    { symbol: 'USDJPY', priceValue: 156.82, changeValue: 0.12 },
    { symbol: 'NEPSE (Nepal)', priceValue: 2014.25, changeValue: 0.45 },
    { symbol: 'GBPUSD', priceValue: 1.2715, changeValue: -0.04 }
  ]);

  // Simulate updating ticker prices in real-time (micro-movements)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData((prev) =>
        prev.map((item) => {
          const percentChange = (Math.random() - 0.48) * 0.05;
          const nextPrice = item.priceValue * (1 + percentChange / 100);
          const nextChange = item.changeValue + percentChange;

          return {
            ...item,
            priceValue: nextPrice,
            changeValue: nextChange
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real-time live prices
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
          console.warn('Could not fetch live forex rates in header:', e);
        }
        
        if (forexData?.result === 'success' && forexData.rates) {
          const rates = forexData.rates;
          
          setTickerData((prev) =>
            prev.map((item) => {
              let livePrice = item.priceValue;
              const liveChange = item.changeValue;
              
              if (item.symbol === 'XAUUSD' && rates.XAU) {
                livePrice = 1 / rates.XAU;
              } else if (item.symbol === 'EURUSD' && rates.EUR) {
                livePrice = 1 / rates.EUR;
              } else if (item.symbol === 'GBPUSD' && rates.GBP) {
                livePrice = 1 / rates.GBP;
              } else if (item.symbol === 'USDJPY' && rates.JPY) {
                livePrice = rates.JPY;
              }
              
              return {
                ...item,
                priceValue: livePrice,
                changeValue: liveChange,
              };
            })
          );
        }
      } catch (error) {
        console.warn('Error updating live header prices:', error);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'profiles', label: 'Top Traders' },
    { id: 'payouts', label: 'Performance Fees' },
    { id: 'journals', label: 'Trading Journals' },
    { id: 'reviews', label: 'Prop Firm Reviews' },
    { id: 'academy', label: 'Learning Hub' },
    { id: 'admin', label: 'Admin Panel' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-theme bg-bg/85 backdrop-blur-md">
      {/* Ticker Tape */}
      <div className="w-full border-b border-border-theme bg-bg-secondary py-1.5 overflow-hidden text-xs">
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-4">
          {tickerData.concat(tickerData).map((item, index) => {
            const isEURorGBP = item.symbol.includes('EUR') || item.symbol.includes('GBP');
            const decimals = isEURorGBP ? 4 : 2;
            const displayPrice = item.priceValue.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            });
            const displayChange = (item.changeValue >= 0 ? '+' : '') + item.changeValue.toFixed(2) + '%';
            const isPositive = item.changeValue >= 0;

            return (
              <div key={index} className="inline-flex items-center space-x-2 font-mono">
                <span className="text-text-secondary font-semibold">{item.symbol}</span>
                <span className="text-text-primary font-bold">{displayPrice}</span>
                <span
                  className={`inline-flex items-center font-bold ${
                    isPositive ? 'text-brand-green' : 'text-red-500'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {displayChange}
                </span>
                <span className="text-text-subtle">|</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main NavBar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" className="h-10 w-10 object-contain" alt="propNPL Logo" />
            <div>
              <span className="text-lg font-black tracking-tight text-text-primary uppercase font-sans">
                prop<span className="text-brand-green">NPL</span>
              </span>
              <div className="text-[9px] font-bold uppercase tracking-wider text-text-muted font-mono -mt-1">
                Community Platform
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Section: Auth & Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser && currentUser.loggedIn ? (
              <div className="flex items-center space-x-3 rounded-xl border border-border-theme bg-bg-secondary p-1.5 pr-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold border glow-accent ${
                  currentUser.isDemo ? 'bg-yellow-950/20 text-yellow-400 border-yellow-800/40' : 'bg-bg-input text-text-primary border-border-theme'
                }`}>
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-text-primary flex items-center gap-1">
                    {currentUser.username}
                    {currentUser.isDemo && (
                      <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Demo</span>
                    )}
                  </div>
                  <div className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">
                    {currentUser.isDemo ? 'Demo Profile' : 'Funded Trader'}
                  </div>
                </div>
                {currentUser.isDemo && (
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this demo account and all its journal data? This cannot be undone.")) {
                        db.deleteUserAccount(currentUser.username);
                        onLogout();
                      }
                    }}
                    className="ml-2 text-text-muted hover:text-red-500 transition-colors p-1"
                    title="Delete Demo Account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onLogout}
                  className="ml-1 text-text-muted hover:text-red-500 transition-colors p-1"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center space-x-2 rounded-lg bg-brand-green px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/95 transition-all glow-accent"
              >
                <LogIn className="h-4 w-4" />
                <span>Join Community</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-border-theme bg-bg-input p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-theme bg-bg/95 p-4 animate-fade-in space-y-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full rounded-lg py-3 px-4 text-left text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === item.id
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-border-theme pt-4">
            {currentUser && currentUser.loggedIn ? (
              <div className="flex flex-col gap-3 rounded-xl bg-bg-input p-3 border border-border-theme">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg font-bold ${
                      currentUser.isDemo ? 'bg-yellow-950/20 text-yellow-400 border-yellow-800/40' : 'bg-brand-green/10 text-brand-green border-brand-green/30'
                    }`}>
                      {currentUser.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                        {currentUser.username}
                        {currentUser.isDemo && (
                          <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Demo</span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted font-semibold">
                        {currentUser.isDemo ? 'Demo Profile' : 'Funded Trader'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentUser.isDemo && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this demo account and all its journal data? This cannot be undone.")) {
                            db.deleteUserAccount(currentUser.username);
                            onLogout();
                            setMobileMenuOpen(false);
                          }
                        }}
                        className="flex items-center justify-center rounded-lg bg-red-950/20 border border-red-900/50 p-2 text-red-400 hover:bg-red-950/50 hover:text-red-355 transition-all"
                        title="Delete Demo Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-1 rounded-lg bg-bg-input border border-border-theme px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-brand-green py-3 text-sm font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              >
                <LogIn className="h-4 w-4" />
                <span>Join Community</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
