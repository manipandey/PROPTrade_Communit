// src/components/Tools.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Percent, BarChart2, Bell, AlertTriangle } from 'lucide-react';

interface ToolsProps {
  theme: 'dark' | 'light';
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

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', time: '12:15 PM', currency: 'EUR', event: 'French Flash Services PMI', impact: 'Medium', forecast: '49.8', previous: '49.3', actual: '49.1', day: 'today' },
  { id: '2', time: '06:15 PM', currency: 'USD', event: 'Core CPI MoM', impact: 'High', forecast: '0.3%', previous: '0.4%', actual: '0.3%', day: 'today' },
  { id: '3', time: '06:15 PM', currency: 'USD', event: 'CPI YoY', impact: 'High', forecast: '3.4%', previous: '3.5%', actual: '3.4%', day: 'today' },
  { id: '4', time: '08:00 PM', currency: 'USD', event: 'FOMC Economic Projections', impact: 'High', forecast: '-', previous: '-', actual: '-', day: 'today' },
  { id: '5', time: '08:00 PM', currency: 'USD', event: 'FOMC Press Conference', impact: 'High', forecast: '-', previous: '-', actual: '-', day: 'today' },
  { id: '6', time: '09:15 AM', currency: 'AUD', event: 'Employment Change', impact: 'High', forecast: '25.0K', previous: '38.5K', actual: '-', day: 'tomorrow' },
  { id: '7', time: '06:15 PM', currency: 'USD', event: 'Unemployment Claims', impact: 'Medium', forecast: '220K', previous: '215K', actual: '-', day: 'tomorrow' },
  { id: '8', time: '06:15 PM', currency: 'USD', event: 'PPI MoM', impact: 'Medium', forecast: '0.1%', previous: '0.5%', actual: '-', day: 'tomorrow' },
  { id: '9', time: '11:45 AM', currency: 'CHF', event: 'SNB Policy Rate & Statement', impact: 'High', forecast: '1.25%', previous: '1.50%', actual: '-', day: 'week' },
  { id: '10', time: '04:45 PM', currency: 'GBP', event: 'BoE Interest Rate Decision', impact: 'High', forecast: '5.25%', previous: '5.25%', actual: '-', day: 'week' },
];

const NEWS_ARTICLES = [
  {
    id: 'n-1',
    title: 'Federal Reserve Signals Rate Holds as Core CPI Drops to 3.4%',
    summary: 'The FOMC members voted unanimously to maintain target rates while adjusting their inflation forecasts slightly downwards. Analysts suggest rate cuts may begin by September.',
    source: 'MacroNews',
    time: '2 hours ago',
    category: 'Central Banks'
  },
  {
    id: 'n-2',
    title: 'Gold Spot Rebounds to $2,380 as Safe-Haven Flows Intensify',
    summary: 'Geopolitical tensions and continuing purchases by global central banks support precious metals. Retail and institutional buyers scale bids across spot liquidity zones.',
    source: 'BullionWire',
    time: '4 hours ago',
    category: 'Commodities'
  },
  {
    id: 'n-3',
    title: 'NEPSE Index Reclaims 2,050 Level; Bank Stocks Lead Volume Charge',
    summary: 'The Nepalese stock index registers strong volume gains. Local liquidity indicators improve as commercial banks reduce interest rates on deposits.',
    source: 'NepalShare Hub',
    time: '6 hours ago',
    category: 'NEPSE'
  },
  {
    id: 'n-4',
    title: 'FundedNext & FTMO Spreads Tighten Ahead of NY Session Volatility',
    summary: 'Major prop firms report record trading volumes on indices. Scalpers are cautioned regarding slippage spikes during high-impact news times.',
    source: 'PropFirm Intel',
    time: '1 day ago',
    category: 'Prop News'
  }
];

export default function Tools({ theme }: ToolsProps) {
  const [subTab, setSubTab] = useState<'calendar' | 'news' | 'margin' | 'chart'>('calendar');

  // Calendar States
  const [calFilterDay, setCalFilterDay] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [calFilterImpact, setCalFilterImpact] = useState<'all' | 'high'>('all');

  // Margin Calculator States
  const [calcPair, setCalcPair] = useState('EURUSD');
  const [calcLeverage, setCalcLeverage] = useState('100');
  const [calcLots, setCalcLots] = useState('1.0');
  const [calcPrice, setCalcPrice] = useState('1.0850');
  const [calculatedMargin, setCalculatedMargin] = useState<number | null>(null);

  // TradingView Symbol State
  const [tvSymbol, setTvSymbol] = useState('FX:EURUSD');

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

  // Filter Calendar Events
  const filteredEvents = INITIAL_EVENTS.filter(e => {
    const dayMatch = calFilterDay === 'all' || e.day === calFilterDay;
    const impactMatch = calFilterImpact === 'all' || e.impact === 'High';
    return dayMatch && impactMatch;
  });

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
            {/* Calendar Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border-theme bg-bg-card">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Show Date:</span>
                {(['all', 'today', 'tomorrow', 'week'] as const).map((day) => (
                  <button
                    key={day}
                    id={`cal-filter-day-${day}`}
                    onClick={() => setCalFilterDay(day)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md border transition-all ${
                      calFilterDay === day
                        ? 'bg-brand-green/15 border-brand-green/45 text-brand-green'
                        : 'border-border-theme bg-bg-secondary text-text-muted hover:border-border-hover'
                    }`}
                  >
                    {day === 'week' ? 'Later This Week' : day}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Impact:</span>
                <button
                  id="cal-filter-impact"
                  onClick={() => setCalFilterImpact(prev => prev === 'all' ? 'high' : 'all')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md border transition-all flex items-center gap-1.5 ${
                    calFilterImpact === 'high'
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                      : 'border-border-theme bg-bg-secondary text-text-muted hover:border-border-hover'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>High Impact Only</span>
                </button>
              </div>
            </div>

            {/* Calendar List */}
            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-theme bg-bg-input/40 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4 text-center">Cur.</th>
                      <th className="py-3 px-4">Event Description</th>
                      <th className="py-3 px-4 text-center">Impact</th>
                      <th className="py-3 px-4 text-right">Forecast</th>
                      <th className="py-3 px-4 text-right">Previous</th>
                      <th className="py-3 px-4 text-right">Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme/40">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((e) => {
                        const impactColors = {
                          High: 'bg-red-500/10 border-red-500/30 text-red-500',
                          Medium: 'bg-orange-500/10 border-orange-500/30 text-orange-500',
                          Low: 'bg-bg-input border-border-theme text-text-muted',
                        };

                        return (
                          <tr key={e.id} className="hover:bg-bg-hover/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-text-secondary">{e.time}</td>
                            <td className="py-3 px-4 text-center font-bold text-text-primary font-mono">{e.currency}</td>
                            <td className="py-3 px-4 font-bold text-text-primary">{e.event}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-[8px] font-bold uppercase rounded border ${impactColors[e.impact]}`}>
                                {e.impact}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-text-secondary">{e.forecast}</td>
                            <td className="py-3 px-4 text-right font-mono text-text-secondary">{e.previous}</td>
                            <td className={`py-3 px-4 text-right font-mono font-bold ${
                              e.actual === '-' 
                                ? 'text-text-muted' 
                                : parseFloat(e.actual) < parseFloat(e.forecast) 
                                  ? 'text-red-500' 
                                  : 'text-brand-green'
                            }`}>
                              {e.actual}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-text-muted font-medium">
                          No economic releases match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-yellow-500 text-[10px] leading-relaxed">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>High impact macroeconomic announcements generate significant slippage and spread widening across FTMO and FundedNext. Adjust risk parameters accordingly.</span>
            </div>
          </div>
        )}

        {/* ── MARKET NEWS ── */}
        {subTab === 'news' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NEWS_ARTICLES.map((art) => (
              <div
                key={art.id}
                className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-3 hover:border-border-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold font-mono uppercase tracking-wider text-text-muted">
                    <span className="text-brand-green bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span>{art.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                
                <div className="border-t border-border-theme/40 pt-3 flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Source: {art.source}</span>
                  <span className="text-brand-green hover:underline cursor-pointer">Read Full Article &rarr;</span>
                </div>
              </div>
            ))}
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
              <iframe
                id="tradingview-widget-iframe"
                key={`${tvSymbol}-${theme}`}
                title="TradingView Live Terminal Chart"
                src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvSymbol)}&interval=D&theme=${theme === 'light' ? 'light' : 'dark'}&style=1&timezone=Etc%2FUTC&locale=en`}
                className="absolute inset-0 w-full h-full border-none"
                allowFullScreen
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
