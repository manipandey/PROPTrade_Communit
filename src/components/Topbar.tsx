import React, { useEffect, useRef } from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { MarketItem } from '@/app/page';

interface TopbarProps {
  theme?: 'dark' | 'light';
  markets: MarketItem[];
  watchlist: string[];
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

export default function Topbar({ theme = 'dark', watchlist }: TopbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widget);

    // Map watchlist symbols to TradingView titles/proNames
    const symbolsConfig = watchlist.map((sym) => {
      const proName = mapToTradingViewSymbol(sym);
      return {
        proName,
        title: sym
      };
    });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbolsConfig,
      showSymbolLogo: true,
      colorTheme: theme === 'light' ? 'light' : 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });

    containerRef.current.appendChild(script);
  }, [watchlist, theme]);

  return (
    <div
      className="sticky top-0 z-20 flex items-center h-[52px] px-4 gap-3 flex-shrink-0 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Watchlist Tape Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
          Watchlist Tape
        </span>
      </div>

      <span style={{ color: 'var(--border)' }} className="text-[14px] flex-shrink-0 select-none">|</span>

      {/* Live Custom Ticker Tape Container */}
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
