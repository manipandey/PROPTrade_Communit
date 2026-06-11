// src/components/RightPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Trophy, Users, Settings, Check } from 'lucide-react';

interface MarketItem {
  name: string;
  symbol: string;
  priceValue: number;
  changeValue: number;
  icon: string;
  category: string;
}

const ALL_AVAILABLE_MARKETS: MarketItem[] = [
  { name: 'NASDAQ 100', symbol: 'NAS100',  priceValue: 18940.20, changeValue: 0.82,  icon: '📈', category: 'Indices' },
  { name: 'Gold (XAU)', symbol: 'XAUUSD',  priceValue: 2428.50,  changeValue: -0.15, icon: '🪙', category: 'Commodities' },
  { name: 'EUR/USD',    symbol: 'EURUSD',   priceValue: 1.0842,    changeValue: 0.24,  icon: '💱', category: 'Forex' },
  { name: 'S&P 500',    symbol: 'SPX500',   priceValue: 5431.10,   changeValue: 0.45,  icon: '📊', category: 'Indices' },
  { name: 'US30 (Dow)',  symbol: 'US30',     priceValue: 39820.00,  changeValue: -0.08, icon: '🏢', category: 'Indices' },
  { name: 'Bitcoin',    symbol: 'BTCUSD',   priceValue: 67250.00,  changeValue: 2.10,  icon: '🪙', category: 'Crypto' },
  { name: 'Ethereum',   symbol: 'ETHUSD',   priceValue: 3512.40,   changeValue: 1.45,  icon: '💎', category: 'Crypto' },
  { name: 'GBP/USD',    symbol: 'GBPUSD',   priceValue: 1.2715,    changeValue: -0.04, icon: '💱', category: 'Forex' },
  { name: 'USD/JPY',    symbol: 'USDJPY',   priceValue: 156.82,    changeValue: 0.12,  icon: '💴', category: 'Forex' },
  { name: 'Crude Oil',  symbol: 'USOIL',    priceValue: 78.45,     changeValue: -1.20, icon: '🛢️', category: 'Commodities' },
];

const TOP_TRADERS = [
  { rank: 1, name: 'Samir R. Shah',   winRate: '72%', profit: '$24.5k', avatar: 'SR' },
  { rank: 2, name: 'Ishaan Ghimire',  winRate: '65%', profit: '$18.2k', avatar: 'IG' },
  { rank: 3, name: 'Anjali KC',       winRate: '68%', profit: '$12.9k', avatar: 'AK' },
];

interface RightPanelProps {
  onNavigate?: (tab: string) => void;
}

export default function RightPanel({ onNavigate }: RightPanelProps) {
  const [markets, setMarkets] = useState<MarketItem[]>(ALL_AVAILABLE_MARKETS);
  const [watchlist, setWatchlist] = useState<string[]>(['NAS100', 'XAUUSD', 'EURUSD', 'BTCUSD']);
  const [isEditing, setIsEditing] = useState(false);

  // Load watchlist on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('propnepal_watchlist');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWatchlist(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Update markets in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          const move = (Math.random() - 0.48) * 0.08;
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

  // Toggle watchlist symbol
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

  // Filter markets to show only watchlist
  const activeMarkets = markets.filter(m => watchlist.includes(m.symbol));

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
                  onClick={() => handleToggleWatchlist(market.symbol)}
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
          /* Live Watchlist Tickers List */
          <div className="space-y-2">
            {activeMarkets.map((market) => {
              const isMajorFX = market.symbol.includes('EUR') || market.symbol.includes('GBP') || market.symbol.includes('JPY');
              const decimals = isMajorFX ? (market.symbol === 'USDJPY' ? 2 : 4) : 2;
              const formattedPrice = market.priceValue.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              });
              const formattedChange = (market.changeValue >= 0 ? '+' : '') + market.changeValue.toFixed(2) + '%';
              const isPositive = market.changeValue >= 0;

              return (
                <div
                  key={market.symbol}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm flex-shrink-0"
                    style={{ backgroundColor: isPositive ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)' }}
                  >
                    {market.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {market.name}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      {market.category}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      {formattedPrice}
                    </div>
                    <div
                      className="text-[10px] font-bold flex items-center justify-end gap-0.5"
                      style={{ color: isPositive ? 'var(--accent)' : 'var(--red)' }}
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formattedChange}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => onNavigate?.('tools')}
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
