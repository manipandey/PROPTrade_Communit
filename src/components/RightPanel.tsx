// src/components/RightPanel.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Users, Settings, Check } from 'lucide-react';

interface MarketItem {
  name: string;
  symbol: string;
  priceValue: number;
  changeValue: number;
  icon: string;
  category: string;
}

const mapToTradingViewSymbol = (sym: string): string => {
  const map: Record<string, string> = {
    'NAS100': 'FOREXCOM:NSXUSD',
    'XAUUSD': 'OANDA:XAUUSD',
    'EURUSD': 'FX_IDC:EURUSD',
    'SPX500': 'FOREXCOM:SPXUSD',
    'US30': 'FOREXCOM:DJI',
    'BTCUSD': 'BITSTAMP:BTCUSD',
    'ETHUSD': 'BITSTAMP:ETHUSD',
    'GBPUSD': 'FX_IDC:GBPUSD',
    'USDJPY': 'FX_IDC:USDJPY',
    'USOIL': 'OANDA:BCOUSD'
  };
  return map[sym] || sym;
};


const TOP_TRADERS = [
  { rank: 1, name: 'Samir R. Shah',   winRate: '72%', profit: '$24.5k', avatar: 'SR' },
  { rank: 2, name: 'Ishaan Ghimire',  winRate: '65%', profit: '$18.2k', avatar: 'IG' },
  { rank: 3, name: 'Anjali KC',       winRate: '68%', profit: '$12.9k', avatar: 'AK' },
];

interface RightPanelProps {
  onNavigate?: (tab: string, subTab?: string) => void;
  markets: MarketItem[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  theme?: 'dark' | 'light';
}

export default function RightPanel({ onNavigate, markets, watchlist, onToggleWatchlist, theme = 'dark' }: RightPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic widget insertion for TradingView Watchlist
  useEffect(() => {
    if (isEditing || !widgetContainerRef.current) return;
    
    // Clear previous widget
    widgetContainerRef.current.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widgetContainerRef.current.appendChild(widget);

    // Map watchlist symbols to TradingView titles/proNames
    const symbolsConfig = watchlist.map((sym) => {
      const proName = mapToTradingViewSymbol(sym);
      return {
        s: proName,
        d: sym
      };
    });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      title: 'Watchlist',
      tabs: [
        {
          title: 'Watchlist',
          symbols: symbolsConfig
        }
      ],
      showChart: false,
      locale: 'en',
      width: '100%',
      height: 380,
      colorTheme: theme === 'light' ? 'light' : 'dark',
      isTransparent: true,
      plotLineColorGrowing: 'rgba(34, 197, 94, 1)',
      plotLineColorFalling: 'rgba(239, 68, 68, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0.06)',
      scaleLineColor: 'rgba(240, 243, 250, 0.06)',
      symbolActiveColor: 'rgba(33, 150, 243, 0.12)'
    });

    widgetContainerRef.current.appendChild(script);
  }, [watchlist, theme, isEditing]);

  return (
    <div className="w-[240px] flex-shrink-0 space-y-4">
      {/* Market Tickers */}
      <div className="t-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Watchlist
            </h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1 rounded hover:bg-bg-hover transition-colors ${isEditing ? 'text-brand-green' : 'text-text-muted hover:text-text-primary'}`}
              title="Edit Watchlist"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="live-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-indicator" />
            LIVE
          </span>
        </div>

        {isEditing ? (
          /* Watchlist editor view */
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <p className="text-[10px] text-text-muted pb-1 font-sans">Select tickers to show:</p>
            {markets.map((market) => {
              const selected = watchlist.includes(market.symbol);
              return (
                <div
                  key={market.symbol}
                  onClick={() => onToggleWatchlist(market.symbol)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border border-border-theme/40 hover:border-brand-green/30"
                  style={{ backgroundColor: selected ? 'var(--accent-light)' : 'var(--bg)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{market.icon}</span>
                    <div>
                      <div className="text-[10px] font-bold text-text-primary leading-tight">{market.symbol}</div>
                      <div className="text-[8px] text-text-muted leading-none">{market.name}</div>
                    </div>
                  </div>
                  {selected && <Check className="h-3.5 w-3.5 text-brand-green flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        ) : (
          /* Live TradingView Watchlist Widget */
          <div className="relative w-full h-[380px] overflow-hidden rounded-lg">
            <div ref={widgetContainerRef} className="tradingview-widget-container w-full h-full"></div>
          </div>
        )}

        <button
          onClick={() => onNavigate?.('tools', 'chart')}
          className="w-full text-xs font-semibold py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-border)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent-light)')}
        >
          View All Markets →
        </button>
      </div>

      {/* Top Traders */}
      <div className="t-card p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Top Traders
          </h3>
        </div>

        <div className="space-y-2">
          {TOP_TRADERS.map((trader) => (
            <div
              key={trader.rank}
              className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* Rank */}
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black flex-shrink-0"
                style={{
                  backgroundColor: trader.rank === 1 ? 'rgba(234,179,8,0.15)' : 'var(--bg-hover)',
                  color: trader.rank === 1 ? '#ca8a04' : 'var(--text-muted)',
                  border: trader.rank === 1 ? '1px solid rgba(234,179,8,0.3)' : '1px solid var(--border)',
                }}
              >
                {trader.rank}
              </div>
              {/* Avatar */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                {trader.avatar}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {trader.name}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  Win Rate: {trader.winRate}
                </div>
              </div>
              {/* Profit */}
              <div className="text-right flex-shrink-0">
                <div className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
                  {trader.profit}
                </div>
                <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                  Profit (MTD)
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-primary w-full text-sm"
          onClick={() => onNavigate?.('profiles')}
        >
          <Users className="h-4 w-4" />
          Join The Challenge
        </button>
      </div>
    </div>
  );
}
