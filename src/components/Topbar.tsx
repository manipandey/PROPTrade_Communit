// src/components/Topbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings } from 'lucide-react';

interface TopbarProps {
  theme?: 'dark' | 'light';
}

const TICKER_GROUPS = {
  all: [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'FOREXCOM:NSXUSD', title: 'NASDAQ 100' },
    { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
    { proName: 'OANDA:XAUUSD', title: 'Gold' },
    { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' }
  ],
  forex: [
    { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
    { proName: 'FX_IDC:GBPUSD', title: 'GBP/USD' },
    { proName: 'FX_IDC:USDJPY', title: 'USD/JPY' },
    { proName: 'FX_IDC:AUDUSD', title: 'AUD/USD' },
    { proName: 'FX_IDC:USDCAD', title: 'USD/CAD' }
  ],
  crypto: [
    { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
    { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
    { proName: 'COINBASE:SOLUSD', title: 'Solana' },
    { proName: 'COINBASE:ADAUSD', title: 'Cardano' }
  ],
  indices: [
    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
    { proName: 'FOREXCOM:DJI', title: 'Dow Jones 30' },
    { proName: 'OANDA:XAUUSD', title: 'Gold' },
    { proName: 'OANDA:BCOUSD', title: 'Brent Crude' }
  ]
};

export default function Topbar({ theme = 'dark' }: TopbarProps) {
  const [category, setCategory] = useState<'all' | 'forex' | 'crypto' | 'indices'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic widget insertion
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widget);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: TICKER_GROUPS[category],
      showSymbolLogo: true,
      colorTheme: theme === 'light' ? 'light' : 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });

    containerRef.current.appendChild(script);
  }, [category, theme]);

  return (
    <div
      className="sticky top-0 z-20 flex items-center h-[52px] px-4 gap-3 flex-shrink-0 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Ticker Selector Dropdown */}
      <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
        <select
          id="topbar-ticker-selector"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'all' | 'forex' | 'crypto' | 'indices')}
          className="rounded border bg-bg-card px-2 py-1 text-[10px] font-bold text-text-secondary focus:border-brand-green focus:outline-none transition-all uppercase tracking-wider cursor-pointer"
          style={{ borderColor: 'var(--border)' }}
        >
          <option value="all">All Markets</option>
          <option value="forex">Forex</option>
          <option value="crypto">Crypto</option>
          <option value="indices">Indices</option>
        </select>
      </div>

      <span style={{ color: 'var(--border)' }} className="text-[14px] flex-shrink-0 select-none">|</span>

      {/* Live TradingView Ticker Tape Container */}
      <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center">
        <div ref={containerRef} className="tradingview-widget-container w-full"></div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search markets or traders..."
            className="t-input pl-8 pr-3 py-1.5 text-xs w-[200px]"
            style={{ fontSize: '12px' }}
          />
        </div>

        {/* Bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Notifications"
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </button>

        {/* Settings */}
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title="Settings"
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
