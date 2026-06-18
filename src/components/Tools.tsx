// src/components/Tools.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, FileText, Percent, BarChart2, Bell, AlertTriangle, Calculator } from 'lucide-react';

interface ToolsProps {
  theme: 'dark' | 'light';
  defaultSubTab?: 'calendar' | 'news' | 'margin' | 'lotSize' | 'chart';
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  thumbnail: string;
  link: string;
}

interface TradingViewGlobal {
  TradingView?: {
    widget: new (config: Record<string, unknown>) => unknown;
  };
}

interface RssItem {
  title: string;
  description?: string;
  content?: string;
  pubDate: string;
  link: string;
}

interface CalendarEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  forecast: string;
  previous: string;
  actual: string;
  day: 'today' | 'tomorrow' | 'week';
}

const INITIAL_EVENTS: CalendarEvent[] = [];

const getNewsThumbnail = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('spacex') || t.includes('musk') || t.includes('space')) return 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=60';
  if (t.includes('gold') || t.includes('bullion')) return 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=60';
  if (t.includes('oil') || t.includes('crude')) return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60';
  if (t.includes('crypto') || t.includes('btc') || t.includes('bitcoin') || t.includes('eth') || t.includes('blockchain')) return 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&auto=format&fit=crop&q=60';
  if (t.includes('fed') || t.includes('reserve') || t.includes('inflation') || t.includes('rates') || t.includes('fomc') || t.includes('interest')) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60';
  if (t.includes('bank') || t.includes('finance') || t.includes('stock') || t.includes('index') || t.includes('nasdaq')) return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60';
  if (t.includes('auto') || t.includes('mercedes') || t.includes('vehicle') || t.includes('cars')) return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=60';
  return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60';
};

const INITIAL_NEWS_ARTICLES = [
  {
    id: 'n-1',
    title: 'Federal Reserve Signals Rate Holds as Core CPI Drops to 3.4%',
    summary: 'The FOMC members voted unanimously to maintain target rates while adjusting their inflation forecasts slightly downwards. Analysts suggest rate cuts may begin by September.',
    source: 'MacroNews',
    time: 'Jun 11, 2026',
    category: 'Macro / Fed',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60',
    link: 'https://www.cnbc.com/'
  },
  {
    id: 'n-2',
    title: 'Gold Spot Rebounds to $2,380 as Safe-Haven Flows Intensify',
    summary: 'Geopolitical tensions and continuing purchases by global central banks support precious metals. Retail and institutional buyers scale bids across spot liquidity zones.',
    source: 'BullionWire',
    time: 'Jun 11, 2026',
    category: 'Commodities',
    thumbnail: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=60',
    link: 'https://www.cnbc.com/'
  },
  {
    id: 'n-3',
    title: 'NEPSE Index Reclaims 2,050 Level; Bank Stocks Lead Volume Charge',
    summary: 'The Nepalese stock index registers strong volume gains. Local liquidity indicators improve as commercial banks reduce interest rates on deposits.',
    source: 'NepalShare Hub',
    time: 'Jun 11, 2026',
    category: 'NEPSE',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60',
    link: 'https://www.cnbc.com/'
  },
  {
    id: 'n-4',
    title: 'FundedNext & FTMO Spreads Tighten Ahead of NY Session Volatility',
    summary: 'Major prop firms report record trading volumes on indices. Scalpers are cautioned regarding slippage spikes during high-impact news times.',
    source: 'PropFirm Intel',
    time: 'Jun 10, 2026',
    category: 'Prop News',
    thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60',
    link: 'https://www.cnbc.com/'
  }
];

export default function Tools({ theme, defaultSubTab }: ToolsProps) {
  const [subTab, setSubTab] = useState<'calendar' | 'news' | 'margin' | 'lotSize' | 'chart'>('calendar');

  // News States
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Sync defaultSubTab when prop changes
  useEffect(() => {
    if (defaultSubTab) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setSubTab(defaultSubTab);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [defaultSubTab]);

  // Load real-time market news from RSS to JSON parser
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.fxstreet.com%2Frss');
        const data = await res.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          const items = data.items.map((item: RssItem, idx: number) => {
            let category = 'Forex News';
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes('fed') || titleLower.includes('inflation') || titleLower.includes('rates') || titleLower.includes('ecb') || titleLower.includes('boe')) category = 'Macro / Central Banks';
            else if (titleLower.includes('gold') || titleLower.includes('oil') || titleLower.includes('silver') || titleLower.includes('commodity')) category = 'Commodities';
            else if (titleLower.includes('crypto') || titleLower.includes('bitcoin') || titleLower.includes('eth')) category = 'Crypto';
            else if (titleLower.includes('stock') || titleLower.includes('spx') || titleLower.includes('nasdaq')) category = 'Equities';
            
            return {
              id: `live-news-${idx}`,
              title: item.title,
              // Clean up HTML tags if present in description
              summary: (item.description || item.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '... Click read full article to view details.',
              source: 'FXStreet',
              time: new Date(item.pubDate.replace(/-/g, '/')).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              category,
              thumbnail: getNewsThumbnail(item.title),
              link: item.link
            };
          });
          setNews(items);
        } else {
          setNews(INITIAL_NEWS_ARTICLES);
        }
      } catch {
        setNews(INITIAL_NEWS_ARTICLES);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);



  // Margin Calculator States
  const [calcPair, setCalcPair] = useState('EURUSD');
  const [calcLeverage, setCalcLeverage] = useState('100');
  const [calcLots, setCalcLots] = useState('1.0');
  const [calcPrice, setCalcPrice] = useState('1.0850');
  const [calculatedMargin, setCalculatedMargin] = useState<number | null>(null);

  // TradingView Symbol State
  const [tvSymbol, setTvSymbol] = useState('FX:EURUSD');
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Load advanced TradingView chart widget with drawing tools
  useEffect(() => {
    if (subTab !== 'chart' || !chartContainerRef.current) return;

    // Clear previous widget
    chartContainerRef.current.innerHTML = '';

    const containerId = 'tradingview-advanced-chart-terminal';
    const widgetDiv = document.createElement('div');
    widgetDiv.id = containerId;
    widgetDiv.className = 'w-full h-full';
    chartContainerRef.current.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as unknown as TradingViewGlobal).TradingView) {
        new (window as unknown as Required<TradingViewGlobal>).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: theme === 'light' ? 'light' : 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false, // SHOWS drawing toolbar
          allow_symbol_change: true,
          container_id: containerId,
        });
      }
    };

    chartContainerRef.current.appendChild(script);
  }, [tvSymbol, theme, subTab]);

  // Sync default prices for margin calculator when pair changes
  useEffect(() => {
    const prices: Record<string, string> = {
      EURUSD: '1.0850',
      GBPUSD: '1.2720',
      XAUUSD: '2350.00',
      BTCUSD: '67500.00',
      US30: '39200.00'
    };
    if (prices[calcPair]) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setCalcPrice(prices[calcPair]);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [calcPair]);

  // Compute Margin
  const handleCalculateMargin = (e: React.FormEvent) => {
    e.preventDefault();
    const lotsNum = parseFloat(calcLots) || 0;
    const priceNum = parseFloat(calcPrice) || 0;
    const levNum = parseFloat(calcLeverage) || 100;

    let contractSize = 100000; // default for Forex
    if (calcPair === 'XAUUSD') {
      contractSize = 100; // 1 lot gold = 100 oz
    } else if (calcPair === 'BTCUSD') {
      contractSize = 1; // 1 lot btc = 1 coin
    } else if (calcPair === 'US30') {
      contractSize = 10; // indices multiplier
    }

    const margin = (contractSize * lotsNum * priceNum) / levNum;
    setCalculatedMargin(margin);
  };

  // Lot Size Calculator States
  const [lotBalance, setLotBalance] = useState('50000');
  const [lotRiskPct, setLotRiskPct] = useState('1');
  const [lotStopLoss, setLotStopLoss] = useState('20');
  const [lotPair, setLotPair] = useState('EURUSD');
  const [calculatedLots, setCalculatedLots] = useState<number | null>(null);
  const [calculatedRiskAmt, setCalculatedRiskAmt] = useState<number | null>(null);

  // Compute Lot Size
  const handleCalculateLotSize = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(lotBalance) || 0;
    const riskPctNum = parseFloat(lotRiskPct) || 0;
    const stopLossNum = parseFloat(lotStopLoss) || 0;

    const riskAmt = balanceNum * (riskPctNum / 100);
    setCalculatedRiskAmt(riskAmt);

    if (stopLossNum <= 0) {
      setCalculatedLots(0);
      return;
    }

    let lotSize = 0;
    if (lotPair === 'EURUSD' || lotPair === 'GBPUSD') {
      // 1 pip = $10 for standard lot of 100,000 units
      lotSize = riskAmt / (stopLossNum * 10);
    } else if (lotPair === 'USDJPY') {
      // 1 pip = approx $6.3 depending on exchange rate
      lotSize = riskAmt / (stopLossNum * 6.3);
    } else if (lotPair === 'XAUUSD') {
      // stop loss in USD price points (1 point = $100 per lot, or 10 points = $10)
      // Let's assume standard gold stop loss where 1 point = $1 per lot
      lotSize = riskAmt / (stopLossNum * 1.0);
    } else if (lotPair === 'BTCUSD') {
      lotSize = riskAmt / stopLossNum;
    } else if (lotPair === 'US30') {
      lotSize = riskAmt / stopLossNum;
    }

    setCalculatedLots(lotSize);
  };



  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Trading <span className="text-brand-green">Tools</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Equip your trading station. Live economic announcements, market sentiment updates, custom margin calculators, and TradingView terminal charts.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <button
          id="tools-tab-calendar"
          onClick={() => setSubTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            subTab === 'calendar'
              ? 'bg-brand-green text-black border-brand-green'
              : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Economic Calendar</span>
        </button>

        <button
          id="tools-tab-news"
          onClick={() => setSubTab('news')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            subTab === 'news'
              ? 'bg-brand-green text-black border-brand-green'
              : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Market News</span>
        </button>

        <button
          id="tools-tab-margin"
          onClick={() => setSubTab('margin')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            subTab === 'margin'
              ? 'bg-brand-green text-black border-brand-green'
              : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Margin Calculator</span>
        </button>

        <button
          id="tools-tab-lotsize"
          onClick={() => setSubTab('lotSize')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            subTab === 'lotSize'
              ? 'bg-brand-green text-black border-brand-green'
              : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Lot Size Calculator</span>
        </button>

        <button
          id="tools-tab-chart"
          onClick={() => setSubTab('chart')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
            subTab === 'chart'
              ? 'bg-brand-green text-black border-brand-green'
              : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Live Charts</span>
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="animate-fade-in">

        {/* ── ECONOMIC CALENDAR ── */}
        {subTab === 'calendar' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden h-[600px] w-full relative">
              {/* TradingView Economic Calendar Widget */}
              <div id="tradingview-economic-calendar" className="w-full h-full" ref={(el) => {
                if (!el || el.innerHTML) return;
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
                script.type = 'text/javascript';
                script.async = true;
                script.innerHTML = JSON.stringify({
                  "colorTheme": theme === 'dark' ? "dark" : "light",
                  "isTransparent": true,
                  "width": "100%",
                  "height": "100%",
                  "locale": "en",
                  "importanceFilter": "-1,0,1",
                  "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu"
                });
                el.appendChild(script);
              }} />
            </div>


            
            <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-yellow-500 text-[10px] leading-relaxed">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>High impact macroeconomic announcements generate significant slippage and spread widening across FTMO and FundedNext. Adjust risk parameters accordingly.</span>
            </div>
          </div>
        )}

        {/* ── MARKET NEWS ── */}
        {subTab === 'news' && (
          <div className="space-y-6">
            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-4 animate-pulse">
                    <div className="h-40 bg-bg-secondary rounded-lg w-full" />
                    <div className="h-4 bg-bg-secondary rounded w-1/4" />
                    <div className="h-6 bg-bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-bg-secondary rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((art) => (
                  <div
                    key={art.id}
                    className="rounded-xl border border-border-theme bg-bg-card overflow-hidden hover:border-border-hover transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => setSelectedArticle(art)}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="h-44 w-full overflow-hidden relative bg-bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={art.thumbnail} 
                          alt={art.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5 space-y-2.5">
                        <div className="flex justify-between items-center text-[9px] font-bold font-mono uppercase tracking-wider text-text-muted">
                          <span className="text-brand-green bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                            {art.category}
                          </span>
                          <span>{art.time}</span>
                        </div>
                        <h3 className="text-sm font-bold text-text-primary leading-snug group-hover:text-brand-green transition-colors line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                          {art.summary}
                        </p>
                      </div>
                    </div>
                    
                    <div className="px-5 pb-5 pt-3 border-t border-border-theme/40 flex justify-between items-center text-[10px] font-mono text-text-muted">
                      <span>Source: {art.source}</span>
                      <span className="text-brand-green font-bold group-hover:underline">Read Full Article &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MARGIN CALCULATOR ── */}
        {subTab === 'margin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 rounded-xl border border-border-theme bg-bg-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Margin Calculator
                </h3>
                <p className="text-[11px] text-text-secondary mt-1">
                  Compute the exact funds required to open a trade position based on contract sizes and evaluation leverage settings.
                </p>
              </div>

              <form onSubmit={handleCalculateMargin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Asset Pair</label>
                    <select
                      id="margin-pair"
                      value={calcPair}
                      onChange={(e) => setCalcPair(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none transition-all"
                    >
                      <option value="EURUSD">EURUSD (Euro / US Dollar)</option>
                      <option value="GBPUSD">GBPUSD (Pound / US Dollar)</option>
                      <option value="XAUUSD">XAUUSD (Gold / Spot US Dollar)</option>
                      <option value="BTCUSD">BTCUSD (Bitcoin / USD)</option>
                      <option value="US30">US30 (Dow Jones 30 Index)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Account Leverage</label>
                    <select
                      id="margin-leverage"
                      value={calcLeverage}
                      onChange={(e) => setCalcLeverage(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none transition-all"
                    >
                      <option value="100">1:100 (Standard Challenge)</option>
                      <option value="50">1:50 (Funded Live Account)</option>
                      <option value="30">1:30 (Strict Retail Limit)</option>
                      <option value="200">1:200 (Aggressive Phase)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Trade Size (Lots)</label>
                    <input
                      id="margin-lots"
                      type="number"
                      step="0.01"
                      required
                      value={calcLots}
                      onChange={(e) => setCalcLots(e.target.value)}
                      placeholder="e.g. 1.00"
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Market Price</label>
                    <input
                      id="margin-price"
                      type="number"
                      step="0.0001"
                      required
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(e.target.value)}
                      placeholder="e.g. 1.0850"
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  id="margin-submit"
                  type="submit"
                  className="w-full rounded-lg bg-brand-green py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                >
                  Calculate Required Margin
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 rounded-xl border border-border-theme bg-bg-card p-6 min-h-[220px] flex flex-col justify-between items-center text-center space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Contract Size Breakdown</h4>
                <div className="mt-2.5 text-xs text-text-secondary leading-relaxed">
                  {calcPair === 'EURUSD' || calcPair === 'GBPUSD' ? (
                    <span>Forex standard contract size: <strong>100,000 units</strong> per Lot.</span>
                  ) : calcPair === 'XAUUSD' ? (
                    <span>Precious Metals standard contract size: <strong>100 ounces</strong> per Lot.</span>
                  ) : calcPair === 'BTCUSD' ? (
                    <span>Crypto contract size: <strong>1 Coin</strong> per Lot.</span>
                  ) : (
                    <span>Equity Indices contract size: <strong>10 units</strong> per Lot contract.</span>
                  )}
                </div>
              </div>

              <div className="py-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block">Required Margin</span>
                <span className="text-3xl font-black text-brand-green font-mono text-glow">
                  ${calculatedMargin !== null ? calculatedMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </span>
                <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider block">Leverage ratio: 1:{calcLeverage}</span>
              </div>

              <div className="text-[9px] text-text-muted font-mono leading-relaxed bg-bg-secondary p-2.5 rounded-lg border border-border-theme/60 w-full">
                Formula: (Contract Size &times; Lots &times; Market Price) &divide; Leverage
              </div>
            </div>
          </div>
        )}

        {/* ── LOT SIZE CALCULATOR ── */}
        {subTab === 'lotSize' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            <div className="lg:col-span-6 rounded-xl border border-border-theme bg-bg-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Position / Lot Size Calculator
                </h3>
                <p className="text-[11px] text-text-secondary mt-1">
                  Determine the exact lot size to trade based on your account balance, desired risk percentage, and stop loss distance.
                </p>
              </div>

              <form onSubmit={handleCalculateLotSize} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Account Balance (USD)</label>
                    <input
                      id="lot-balance"
                      type="number"
                      required
                      value={lotBalance}
                      onChange={(e) => setLotBalance(e.target.value)}
                      placeholder="e.g. 50000"
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Risk Ratio (%)</label>
                    <input
                      id="lot-risk-pct"
                      type="number"
                      step="0.1"
                      required
                      value={lotRiskPct}
                      onChange={(e) => setLotRiskPct(e.target.value)}
                      placeholder="e.g. 1"
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Asset Pair</label>
                    <select
                      id="lot-pair"
                      value={lotPair}
                      onChange={(e) => setLotPair(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none transition-all"
                    >
                      <option value="EURUSD">EURUSD (Forex)</option>
                      <option value="GBPUSD">GBPUSD (Forex)</option>
                      <option value="USDJPY">USDJPY (Forex)</option>
                      <option value="XAUUSD">XAUUSD (Gold)</option>
                      <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                      <option value="US30">US30 (Dow Jones)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {lotPair === 'XAUUSD' || lotPair === 'BTCUSD' || lotPair === 'US30' ? 'Stop Loss (USD/Points)' : 'Stop Loss (Pips)'}
                    </label>
                    <input
                      id="lot-stop-loss"
                      type="number"
                      step="0.1"
                      required
                      value={lotStopLoss}
                      onChange={(e) => setLotStopLoss(e.target.value)}
                      placeholder="e.g. 20"
                      className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  id="lot-submit"
                  type="submit"
                  className="w-full rounded-lg bg-brand-green py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                >
                  Calculate Position Size
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 rounded-xl border border-border-theme bg-bg-card p-6 min-h-[240px] flex flex-col justify-between items-center text-center space-y-4">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Risk Analysis</h4>
                <div className="mt-2.5 text-xs text-text-secondary leading-relaxed">
                  Trading {lotPair} with a <strong>{lotStopLoss} {lotPair === 'XAUUSD' || lotPair === 'BTCUSD' || lotPair === 'US30' ? 'Points/USD' : 'Pips'}</strong> stop loss and risking <strong>{lotRiskPct}%</strong> of your <strong>${parseFloat(lotBalance).toLocaleString()}</strong> account balance.
                </div>
              </div>

              <div className="py-2 space-y-2">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Position Size</span>
                  <span className="text-3xl font-black text-brand-green font-mono text-glow">
                    {calculatedLots !== null ? calculatedLots.toFixed(2) : '0.00'} Lots
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Amount at Risk</span>
                  <span className="text-lg font-bold text-red-500 font-mono">
                    ${calculatedRiskAmt !== null ? calculatedRiskAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </div>

              <div className="text-[9px] text-text-muted font-mono leading-relaxed bg-bg-secondary p-2.5 rounded-lg border border-border-theme/60 w-full">
                Formula: Risk Amount &divide; (Stop Loss &times; Pip Value per standard lot)
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE CHARTS ── */}
        {subTab === 'chart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border-theme bg-bg-card">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Select Ticker:</span>
                <select
                  id="tv-symbol-select"
                  value={tvSymbol}
                  onChange={(e) => setTvSymbol(e.target.value)}
                  className="rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none transition-all font-mono"
                >
                  <option value="FX:EURUSD">EURUSD (Euro / US Dollar)</option>
                  <option value="OANDA:XAUUSD">XAUUSD (Spot Gold / USD)</option>
                  <option value="FX:GBPUSD">GBPUSD (British Pound / USD)</option>
                  <option value="BINANCE:BTCUSDT">BTCUSDT (Bitcoin Spot Binance)</option>
                  <option value="FOREXCOM:DJI">US30 (Dow Jones 30 Index)</option>
                </select>
              </div>

              <span className="text-[9px] font-mono text-brand-green hidden sm:inline bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                TradingView Interactive Feed Active
              </span>
            </div>

            {/* Chart Widget Frame */}
            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden aspect-[16/9] w-full min-h-[450px] relative">
              <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
            </div>
          </div>
        )}

      </div>

      {/* Full Article Modal */}
      {selectedArticle && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div 
            className="w-full max-w-2xl rounded-2xl border p-6 overflow-hidden relative shadow-2xl space-y-4 animate-scale-in"
            style={{ 
              maxHeight: '90vh', 
              overflowY: 'auto',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Thumbnail */}
            <div className="h-64 w-full overflow-hidden rounded-xl relative bg-bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedArticle.thumbnail} 
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <span className="text-brand-green bg-brand-green/5 border border-brand-green/15 px-2.5 py-1 rounded">
                  {selectedArticle.category}
                </span>
                <span>{selectedArticle.time}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
                {selectedArticle.title}
              </h2>
              <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Source: <span className="font-bold text-text-primary">{selectedArticle.source}</span>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {selectedArticle.summary}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <a 
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center px-4 py-2.5 bg-brand-green text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-green/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
              >
                Read Original on {selectedArticle.source} &rarr;
              </a>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="w-full sm:w-auto text-center px-4 py-2.5 border font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              >
                Close Article
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
