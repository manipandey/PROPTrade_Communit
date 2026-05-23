// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, LogIn, LogOut, Menu, X, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

interface HeaderProps {
  currentUser: { username: string; loggedIn: boolean; avatar: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

export default function Header({ currentUser, onOpenAuth, onLogout, activeTab, setActiveTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerData, setTickerData] = useState<TickerItem[]>([
    { symbol: 'XAUUSD (Gold)', price: '2428.50', change: '+1.24%', isPositive: true },
    { symbol: 'EURUSD', price: '1.0832', change: '+0.08%', isPositive: true },
    { symbol: 'US30 (Dow)', price: '39820', change: '-0.15%', isPositive: false },
    { symbol: 'BTCUSD', price: '67,250', change: '+2.10%', isPositive: true },
    { symbol: 'NEPSE (Nepal)', price: '2,014.25', change: '+0.45%', isPositive: true },
    { symbol: 'GBPUSD', price: '1.2715', change: '-0.04%', isPositive: false }
  ]);

  // Simulate updating ticker prices in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData((prev) =>
        prev.map((item) => {
          const numericPrice = parseFloat(item.price.replace(/,/g, ''));
          const percentChange = (Math.random() - 0.48) * 0.1; // slight bias towards green
          const newPrice = (numericPrice * (1 + percentChange / 100)).toFixed(
            item.symbol.includes('EUR') || item.symbol.includes('GBP') ? 4 : 2
          );
          const currentChange = parseFloat(item.change.replace('%', ''));
          const newChange = (currentChange + percentChange).toFixed(2) + '%';
          const formattedPrice = parseFloat(newPrice).toLocaleString(undefined, {
            minimumFractionDigits: item.symbol.includes('EUR') || item.symbol.includes('GBP') ? 4 : 2
          });

          return {
            ...item,
            price: formattedPrice,
            change: (parseFloat(newChange) >= 0 ? '+' : '') + newChange,
            isPositive: parseFloat(newChange) >= 0
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Community Feed' },
    { id: 'profiles', label: 'Top Traders' },
    { id: 'payouts', label: 'Payout Showcase' },
    { id: 'journals', label: 'Trading Journals' },
    { id: 'reviews', label: 'Prop Firm Reviews' },
    { id: 'academy', label: 'Learning Hub' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-black/85 backdrop-blur-md">
      {/* Ticker Tape */}
      <div className="w-full border-b border-zinc-900 bg-[#060608] py-1.5 overflow-hidden text-xs">
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-4">
          {tickerData.concat(tickerData).map((item, index) => (
            <div key={index} className="inline-flex items-center space-x-2 font-mono">
              <span className="text-zinc-400 font-semibold">{item.symbol}</span>
              <span className="text-white font-bold">{item.price}</span>
              <span
                className={`inline-flex items-center font-bold ${
                  item.isPositive ? 'text-brand-green' : 'text-red-500'
                }`}
              >
                {item.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                )}
                {item.change}
              </span>
              <span className="text-zinc-800">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main NavBar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Shield className="h-5 w-5 text-black stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border border-black bg-red-600 flex items-center justify-center text-[8px] font-bold text-white leading-none">
                🇳🇵
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
                Prop<span className="text-brand-green">Nepal</span>
              </span>
              <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono -mt-1">
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
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Section: Auth & Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser && currentUser.loggedIn ? (
              <div className="flex items-center space-x-3 rounded-xl border border-zinc-800 bg-[#0d0d0f] p-1.5 pr-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold text-white border border-zinc-700 glow-accent">
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{currentUser.username}</div>
                  <div className="text-[9px] font-semibold text-brand-green uppercase tracking-wider">Funded Trader</div>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 text-zinc-500 hover:text-red-500 transition-colors p-1"
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
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-[#0c0c0e] p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-950 bg-black/95 p-4 animate-fade-in space-y-4">
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
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-900 pt-4">
            {currentUser && currentUser.loggedIn ? (
              <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-3 border border-zinc-900">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/30 text-lg font-bold">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.username}</div>
                    <div className="text-xs text-brand-green font-semibold">Funded Trader</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 rounded-lg bg-red-950/30 border border-red-900/50 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
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
