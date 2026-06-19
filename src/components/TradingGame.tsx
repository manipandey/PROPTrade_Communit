// src/components/TradingGame.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2, Play, AlertTriangle, Trophy,
  DollarSign, Activity, Brain, BookOpen, Heart, Award,
  ChevronRight, HelpCircle, CheckCircle2,
  XCircle, Flame, ShieldAlert, BookOpenCheck, ArrowLeft
} from 'lucide-react';

/* ─── Custom animations injection ─── */
const customStyles = `
  @keyframes float-pnl {
    0% { transform: translateY(10px); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(-30px); opacity: 0; }
  }
  @keyframes radial-particle {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
  }
  @keyframes shake-view {
    0%, 100% { transform: translate(0, 0); }
    20%, 60% { transform: translate(-5px, 2px); }
    40%, 80% { transform: translate(5px, -2px); }
  }
  .animate-float-pnl {
    animation: float-pnl 1.6s ease-out forwards;
  }
  .animate-radial-particle {
    animation: radial-particle 0.8s ease-out forwards;
  }
  .animate-shake-view {
    animation: shake-view 0.3s ease-in-out;
  }
`;

// Helper data sets

// Asset configurations for Prop Challenge
const propAssetConfig = {
  XAUUSD: { basePrice: 2420.0, pipMultiplier: 100, lotSizeMultiplier: 10, decimalDigits: 2 },
  EURUSD: { basePrice: 1.0840, pipMultiplier: 10000, lotSizeMultiplier: 10, decimalDigits: 4 },
  BTCUSD: { basePrice: 67200.0, pipMultiplier: 1, lotSizeMultiplier: 0.1, decimalDigits: 1 }
};

interface Position {
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  lots: number;
}

interface TradeHistory {
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  status: 'profit' | 'loss';
}

const STARTING_BALANCE = 100000;
const PROFIT_TARGET = 105000;
const DRAWDOWN_LIMIT = 96000;

// SMC Campaign Level Configuration
interface CandleData {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isBullish: boolean;
  label?: string;
}

interface SMCLevel {
  id: number;
  name: string;
  concept: string;
  description: string;
  objective: string;
  targetCandleIndex: number;
  targetZone?: { yMin: number; yMax: number; label: string };
  candles: CandleData[];
  explanation: string;
}

const SMC_CAMPAIGN_LEVELS: SMCLevel[] = [
  {
    id: 1,
    name: 'Fair Value Gap (FVG)',
    concept: 'Price Inefficiency',
    description: 'An FVG is a 3-candle imbalance. It occurs when a strong expansion candle (Candle 2) leaves a gap between the high of Candle 1 and the low of Candle 3. Institutions often return to fill this gap.',
    objective: 'Locate and click on the large expansion candle (Candle 2) that created the FVG.',
    targetCandleIndex: 4,
    targetZone: { yMin: 125, yMax: 155, label: 'FVG Buy Zone' },
    candles: [
      { index: 0, open: 100, high: 110, low: 95, close: 105, isBullish: true },
      { index: 1, open: 105, high: 115, low: 100, close: 110, isBullish: true },
      { index: 2, open: 110, high: 120, low: 108, close: 118, isBullish: true },
      { index: 3, open: 118, high: 125, low: 115, close: 122, isBullish: true, label: 'Candle 1' },
      { index: 4, open: 122, high: 160, low: 121, close: 158, isBullish: true, label: 'Candle 2 (Gap)' },
      { index: 5, open: 158, high: 165, low: 155, close: 162, isBullish: true, label: 'Candle 3' },
      { index: 6, open: 162, high: 168, low: 159, close: 165, isBullish: true }
    ],
    explanation: 'Perfect! Candle 1\'s high (125) does not touch Candle 3\'s low (155). This leaves an unfilled gap (125 - 155). This is the Fair Value Gap. Traders set buy limit orders in this zone, expecting price to fill the gap and continue upward.'
  },
  {
    id: 2,
    name: 'Order Block (OB)',
    concept: 'Institutional Footprint',
    description: 'A Bullish Order Block is the last opposite-colored (bearish) candle before a strong upward displacement that breaks key structure. It represents where major financial players loaded their buy orders.',
    objective: 'Identify and click on the last bearish candle that forms the foundation of the order block.',
    targetCandleIndex: 2,
    targetZone: { yMin: 85, yMax: 102, label: 'Bullish OB Zone' },
    candles: [
      { index: 0, open: 120, high: 122, low: 110, close: 112, isBullish: false },
      { index: 1, open: 112, high: 115, low: 100, close: 102, isBullish: false },
      { index: 2, open: 102, high: 105, low: 90, close: 92, isBullish: false, label: 'Last Sell' },
      { index: 3, open: 92, high: 135, low: 91, close: 130, isBullish: true, label: 'Displacement' },
      { index: 4, open: 130, high: 145, low: 128, close: 142, isBullish: true, label: 'BOS' },
      { index: 5, open: 142, high: 150, low: 138, close: 146, isBullish: true }
    ],
    explanation: 'Awesome job! This last bearish candle (Candle 2) is the Bullish Order Block. When price returns to tap this block, we look to enter LONG positions because institutional buy orders are left sitting at this level.'
  },
  {
    id: 3,
    name: 'Break of Structure (BOS)',
    concept: 'Trend Continuation',
    description: 'A Break of Structure occurs when price breaks and closes beyond a major swing point in the direction of the dominant trend. It confirms that the trend is healthy and continuing.',
    objective: 'Click on the candle that breaks and closes above the previous swing high line.',
    targetCandleIndex: 4,
    candles: [
      { index: 0, open: 100, high: 130, low: 95, close: 125, isBullish: true, label: 'Swing High' },
      { index: 1, open: 125, high: 128, low: 110, close: 112, isBullish: false, label: 'Retrace' },
      { index: 2, open: 112, high: 118, low: 105, close: 108, isBullish: false },
      { index: 3, open: 108, high: 126, low: 106, close: 124, isBullish: true },
      { index: 4, open: 124, high: 142, low: 122, close: 140, isBullish: true, label: 'BOS Close' },
      { index: 5, open: 140, high: 148, low: 135, close: 143, isBullish: true }
    ],
    explanation: 'Correct! Candle 4 breaks out and closes above the Swing High line (130). This is a bullish BOS, indicating the market structure is extending upwards. We only count it as a BOS once a candle body closes above the high, not just a wick poke.'
  },
  {
    id: 4,
    name: 'Change of Character (CHoCH)',
    concept: 'Trend Reversal',
    description: 'CHoCH is the first structural shift signaling a trend reversal. In a bullish market, it occurs when price falls and breaks below the last swing higher low. This indicates the bears are taking control.',
    objective: 'Identify the structural shift candle that breaks below the higher low to initiate the CHoCH.',
    targetCandleIndex: 5,
    candles: [
      { index: 0, open: 100, high: 120, low: 98, close: 118, isBullish: true },
      { index: 1, open: 118, high: 122, low: 112, close: 115, isBullish: false, label: 'Higher Low' },
      { index: 2, open: 115, high: 140, low: 114, close: 136, isBullish: true, label: 'Swing High' },
      { index: 3, open: 136, high: 138, low: 125, close: 128, isBullish: false },
      { index: 4, open: 128, high: 132, low: 120, close: 122, isBullish: false },
      { index: 5, open: 122, high: 124, low: 105, close: 108, isBullish: false, label: 'CHoCH Break' },
      { index: 6, open: 108, high: 110, low: 95, close: 98, isBullish: false }
    ],
    explanation: 'Spot on! The higher low was established at 112 (Candle 1). Candle 5 breaks and closes below 112, completing a bearish CHoCH. This changes the market character from bullish to bearish, urging us to look for sell setups.'
  },
  {
    id: 5,
    name: 'Liquidity Sweep',
    concept: 'Stop Hunting',
    description: 'A Liquidity Sweep is a stop run. Institutions push the price below a previous swing low (equal lows) to trigger sell-stops, aggregate buying liquidity, and instantly reverse the price.',
    objective: 'Click on the candle with the long wick that sweeps liquidity before launching higher.',
    targetCandleIndex: 4,
    candles: [
      { index: 0, open: 120, high: 122, low: 100, close: 102, isBullish: false, label: 'Equal Low 1' },
      { index: 1, open: 102, high: 125, low: 101, close: 122, isBullish: true },
      { index: 2, open: 122, high: 124, low: 100, close: 103, isBullish: false, label: 'Equal Low 2' },
      { index: 3, open: 103, high: 115, low: 102, close: 112, isBullish: true },
      { index: 4, open: 112, high: 115, low: 80, close: 110, isBullish: false, label: 'Sweep Wick' },
      { index: 5, open: 110, high: 145, low: 108, close: 140, isBullish: true, label: 'Reversal' },
      { index: 6, open: 140, high: 152, low: 138, close: 150, isBullish: true }
    ],
    explanation: 'Brilliant! Candle 4 sweeps low to 80, breaking equal lows at 100 to trigger stop losses. It instantly pulls back up and closes at 110, leaving a long lower wick. This is a classic liquidity sweep. Institutions are now loaded for a bullish move!'
  }
];

// Price Action Quiz levels
interface QuizLevel {
  id: number;
  name: string;
  description: string;
  highlightIndex: number;
  candles: { open: number; high: number; low: number; close: number; isBull: boolean; label?: string }[];
  question: string;
  options: string[];
  correctAnswer: string;
  question2: string;
  options2: string[];
  correctAnswer2: string;
}

const QUIZ_LEVELS: QuizLevel[] = [
  {
    id: 1,
    name: 'Hammer Pattern',
    description: 'A hammer candle forms at the bottom of a downtrend, showing that buyers rejected lower prices and pushed back up.',
    highlightIndex: 3,
    candles: [
      { open: 120, high: 122, low: 110, close: 112, isBull: false },
      { open: 112, high: 114, low: 100, close: 101, isBull: false },
      { open: 101, high: 103, low: 90, close: 91, isBull: false },
      { open: 91, high: 96, low: 75, close: 95, isBull: true, label: 'Pattern' },
      { open: 95, high: 110, low: 94, close: 108, isBull: true },
      { open: 108, high: 120, low: 106, close: 118, isBull: true }
    ],
    question: 'Identify the pattern in the highlighted zone:',
    options: ['Shooting Star', 'Hammer', 'Bearish Engulfing', 'Doji'],
    correctAnswer: 'Hammer',
    question2: 'What is the market bias implied by this Hammer pattern?',
    options2: ['Bearish Reversal', 'Bullish Reversal', 'Indecision', 'Trend Continuation'],
    correctAnswer2: 'Bullish Reversal'
  },
  {
    id: 2,
    name: 'Shooting Star',
    description: 'A shooting star is a bearish reversal pattern that forms at the top of an uptrend, showing sellers rejected higher prices.',
    highlightIndex: 3,
    candles: [
      { open: 90, high: 105, low: 88, close: 102, isBull: true },
      { open: 102, high: 115, low: 100, close: 112, isBull: true },
      { open: 112, high: 125, low: 110, close: 122, isBull: true },
      { open: 122, high: 145, low: 120, close: 124, isBull: false, label: 'Star' },
      { open: 124, high: 126, low: 105, close: 108, isBull: false },
      { open: 108, high: 110, low: 95, close: 98, isBull: false }
    ],
    question: 'Identify the pattern in the highlighted zone:',
    options: ['Hammer', 'Doji', 'Shooting Star', 'Morning Star'],
    correctAnswer: 'Shooting Star',
    question2: 'What is the market bias implied by this Shooting Star pattern?',
    options2: ['Bullish Reversal', 'Bearish Reversal', 'Indecision', 'Trend Continuation'],
    correctAnswer2: 'Bearish Reversal'
  },
  {
    id: 3,
    name: 'Bullish Engulfing',
    description: 'A bullish engulfing pattern occurs when a large green candle body completely engulfs the body of the previous small red candle.',
    highlightIndex: 3,
    candles: [
      { open: 110, high: 112, low: 98, close: 100, isBull: false },
      { open: 100, high: 102, low: 90, close: 92, isBull: false },
      { open: 92, high: 96, low: 82, close: 84, isBull: false, label: '1. Red' },
      { open: 83, high: 110, low: 82, close: 108, isBull: true, label: '2. Engulf' },
      { open: 108, high: 118, low: 105, close: 115, isBull: true },
      { open: 115, high: 125, low: 112, close: 122, isBull: true }
    ],
    question: 'Identify the pattern formed by the highlighted pair:',
    options: ['Morning Star', 'Bullish Engulfing', 'Bearish Engulfing', 'Marubozu'],
    correctAnswer: 'Bullish Engulfing',
    question2: 'What does a Bullish Engulfing pattern indicate in a downtrend?',
    options2: ['Strong Bearish Continuation', 'Bullish Reversal', 'Trend Consolidation', 'Sellers take control'],
    correctAnswer2: 'Bullish Reversal'
  },
  {
    id: 4,
    name: 'Doji',
    description: 'A Doji indicates market indecision where the open and close are virtually identical, leaving a thin line for a body.',
    highlightIndex: 3,
    candles: [
      { open: 100, high: 112, low: 98, close: 110, isBull: true },
      { open: 110, high: 115, low: 100, close: 102, isBull: false },
      { open: 102, high: 108, low: 98, close: 106, isBull: true },
      { open: 106, high: 120, low: 92, close: 106.5, isBull: true, label: 'Doji' },
      { open: 106.5, high: 110, low: 90, close: 94, isBull: false },
      { open: 94, high: 100, low: 82, close: 85, isBull: false }
    ],
    question: 'Identify the candlestick pattern in the highlighted zone:',
    options: ['Marubozu', 'Hammer', 'Doji', 'Evening Star'],
    correctAnswer: 'Doji',
    question2: 'What is the primary psychological state of the market during a Doji?',
    options2: ['Strong Bullish Momentum', 'Strong Bearish Momentum', 'Market Indecision / Balance', 'Trend Breakout'],
    correctAnswer2: 'Market Indecision / Balance'
  },
  {
    id: 5,
    name: 'Evening Star',
    description: 'An Evening Star is a three-candle bearish reversal pattern consisting of a large green candle, a small star, and a large red candle.',
    highlightIndex: 2,
    candles: [
      { open: 85, high: 95, low: 82, close: 92, isBull: true },
      { open: 92, high: 115, low: 91, close: 112, isBull: true, label: '1. Bull' },
      { open: 113, high: 122, low: 110, close: 114, isBull: true, label: '2. Star' },
      { open: 112, high: 113, low: 88, close: 90, isBull: false, label: '3. Bear' },
      { open: 90, high: 94, low: 78, close: 80, isBull: false }
    ],
    question: 'Identify the 3-candle pattern highlighted in this trend top:',
    options: ['Morning Star', 'Evening Star', 'Three White Soldiers', 'Bullish Engulfing'],
    correctAnswer: 'Evening Star',
    question2: 'What is the trade execution implication of an Evening Star setup?',
    options2: ['Look for buy entries', 'Look for sell entries / take profits', 'Hold cash / no trade', 'Buy the breakout above star high'],
    correctAnswer2: 'Look for sell entries / take profits'
  }
];

// Scrolling Candlestick Structure for SMC practice
interface ScrollCandle {
  o: number; h: number; l: number; c: number; isBull: boolean;
}

interface BlastParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export default function TradingGame({ theme }: { theme: 'dark' | 'light' }) {
  const [activeMode, setActiveMode] = useState<'dashboard' | 'prop' | 'smc' | 'priceaction'>('dashboard');

  /* ════════════════════════════════════════════════════════════
     1. PROP FIRM simulator states
     ════════════════════════════════════════════════════════════ */
  const [propGameState, setPropGameState] = useState<'welcome' | 'playing' | 'passed' | 'failed'>('welcome');
  const [propBalance, setPropBalance] = useState(STARTING_BALANCE);
  const [propMaxBalance, setPropMaxBalance] = useState(STARTING_BALANCE);
  const [propVerificationHash, setPropVerificationHash] = useState('');
  const [propAsset, setPropAsset] = useState<'XAUUSD' | 'EURUSD' | 'BTCUSD'>('XAUUSD');
  const [propLots, setPropLots] = useState(5.0);
  const [propPosition, setPropPosition] = useState<Position | null>(null);
  const [propHistory, setPropHistory] = useState<TradeHistory[]>([]);
  const [propPriceHistory, setPropPriceHistory] = useState<number[]>([]);
  const [propCurrentPrice, setPropCurrentPrice] = useState(propAssetConfig.XAUUSD.basePrice);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ════════════════════════════════════════════════════════════
     2. SMC game states
     ════════════════════════════════════════════════════════════ */
  const [smcSubMode, setSmcSubMode] = useState<'dashboard' | 'campaign' | 'practice'>('dashboard');
  const [smcCampaignLvlIdx, setSmcCampaignLvlIdx] = useState(0);
  const [smcSelectedCandleIdx, setSmcSelectedCandleIdx] = useState<number | null>(null);
  const [smcCampaignStatus, setSmcCampaignStatus] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
  const [smcCampaignScore, setSmcCampaignScore] = useState(0);

  // SMC Arcade Practice state
  const [smcSimState, setSmcSimState] = useState<'ready' | 'running' | 'success' | 'fail'>('ready');
  const [smcScrollCandles, setSmcScrollCandles] = useState<ScrollCandle[]>([]);
  const [smcPrompt, setSmcPrompt] = useState('Waiting for market footprints...');
  const [smcScore, setSmcScore] = useState(0);
  const [smcXp, setSmcXp] = useState(0);
  const [smcLevel, setSmcLevel] = useState(1);
  const [smcStreak, setSmcStreak] = useState(0);
  const [smcActiveSetup, setSmcActiveSetup] = useState<'BUY_OB' | 'SELL_FVG' | 'NONE'>('NONE');
  const [smcActiveTrade, setSmcActiveTrade] = useState<{ type: 'LONG' | 'SHORT'; entry: number; tp: number; sl: number } | null>(null);
  const [smcCurrentPrice, setSmcCurrentPrice] = useState(100);
  const [smcParticles, setSmcParticles] = useState<BlastParticle[]>([]);
  const [smcFloatTexts, setSmcFloatTexts] = useState<FloatText[]>([]);
  const [smcIsShaking, setSmcIsShaking] = useState(false);

  /* ════════════════════════════════════════════════════════════
     3. PRICE ACTION states
     ════════════════════════════════════════════════════════════ */
  const [paSubMode, setPaSubMode] = useState<'dashboard' | 'guide' | 'quiz'>('dashboard');
  // Interactive Slider Builder States
  const [paBodyHeight, setPaBodyHeight] = useState(30); // slider -70 to 70
  const [paWickUpper, setPaWickUpper] = useState(20);   // 0 to 100
  const [paWickLower, setPaWickLower] = useState(25);   // 0 to 100

  // Price Action Quiz States
  const [paQuizLevelIdx, setPaQuizLevelIdx] = useState(0);
  const [paQuizHearts, setPaQuizHearts] = useState(3);
  const [paQuizState, setPaQuizState] = useState<'unanswered' | 'part1_correct' | 'part1_wrong' | 'part2_correct' | 'part2_wrong' | 'completed'>('unanswered');
  const [paQuizScore, setPaQuizScore] = useState(0);
  const [selectedPaOption, setSelectedPaOption] = useState<string | null>(null);

  const triggerBlastParticles = (x: number, y: number, color: string) => {
    const fresh = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      dx: (Math.random() - 0.5) * 5,
      dy: (Math.random() - 0.5) * 5,
      size: 4 + Math.random() * 4,
      color
    }));
    setSmcParticles(fresh);
  };

  const triggerFloatText = (x: number, y: number, text: string, color: string) => {
    const fresh = { id: Date.now(), x, y, text, color };
    setSmcFloatTexts(prev => [...prev, fresh]);
    setTimeout(() => {
      setSmcFloatTexts(prev => prev.filter(t => t.id !== fresh.id));
    }, 2000);
  };

  /* ════════════════════════════════════════════════════════════
     PROP FIRM simulator ticking effect
     ════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (activeMode !== 'prop' || propGameState !== 'playing') return;

    const config = propAssetConfig[propAsset];
    const initialHistory = Array.from({ length: 40 }, (_, i) => {
      const offset = (Math.sin(i / 3) + Math.cos(i / 5)) * (config.basePrice * 0.002);
      return config.basePrice + offset;
    });

    /* eslint-disable react-hooks/set-state-in-effect */
    setPropPriceHistory(initialHistory);
    setPropCurrentPrice(initialHistory[initialHistory.length - 1]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const propTick = setInterval(() => {
      setPropPriceHistory((prev) => {
        const last = prev[prev.length - 1];
        const changePercent = (Math.random() - 0.492) * 0.0016; // Slight upward drift
        const nextPrice = last * (1 + changePercent);
        setPropCurrentPrice(nextPrice);
        return [...prev.slice(1), nextPrice];
      });
    }, 500);

    return () => clearInterval(propTick);
  }, [activeMode, propGameState, propAsset]);

  // unrealized check
  const getPropUnrealizedPnL = (): number => {
    if (!propPosition) return 0;
    const config = propAssetConfig[propAsset];
    const priceDiff = propCurrentPrice - propPosition.entryPrice;
    let pnl = priceDiff * config.pipMultiplier * config.lotSizeMultiplier * propPosition.lots;
    if (propPosition.type === 'SHORT') pnl = -pnl;
    return Math.round(pnl);
  };

  const propUnrealized = getPropUnrealizedPnL();
  const propEquity = propBalance + propUnrealized;

  useEffect(() => {
    if (activeMode !== 'prop' || propGameState !== 'playing') return;

    /* eslint-disable react-hooks/set-state-in-effect */
    if (propEquity >= PROFIT_TARGET) {
      if (propPosition) {
        setPropBalance(propEquity);
        setPropHistory(prev => [
          {
            type: propPosition.type,
            entryPrice: propPosition.entryPrice,
            exitPrice: propCurrentPrice,
            pnl: getPropUnrealizedPnL(),
            status: 'profit'
          },
          ...prev
        ]);
        setPropPosition(null);
      } else {
        setPropBalance(propEquity);
      }
      setPropGameState('passed');
      // Set hash on state transition securely
      setPropVerificationHash(Math.random().toString(16).substring(2, 14).toUpperCase());
    } else if (propEquity <= DRAWDOWN_LIMIT) {
      if (propPosition) {
        setPropBalance(propEquity);
        setPropHistory(prev => [
          {
            type: propPosition.type,
            entryPrice: propPosition.entryPrice,
            exitPrice: propCurrentPrice,
            pnl: getPropUnrealizedPnL(),
            status: 'loss'
          },
          ...prev
        ]);
        setPropPosition(null);
      } else {
        setPropBalance(propEquity);
      }
      setPropGameState('failed');
    }

    if (propEquity > propMaxBalance) {
      setPropMaxBalance(propEquity);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propCurrentPrice, propBalance, propEquity, propGameState, activeMode]);

  // Draw Canvas for Prop Simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || propPriceHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const minVal = Math.min(...propPriceHistory) * 0.9996;
    const maxVal = Math.max(...propPriceHistory) * 1.0004;
    const range = maxVal - minVal;

    // Grid lines
    ctx.strokeStyle = theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Candlesticks
    const candleWidth = (width / propPriceHistory.length) * 0.7;
    const spacing = (width / propPriceHistory.length);
    
    propPriceHistory.forEach((price, idx) => {
      if (idx === 0) return;
      const prevPrice = propPriceHistory[idx - 1];
      
      // Pseudo candle generation for a smooth ticker chart
      const open = prevPrice;
      const close = price;
      // Add a slight wick to make it look like a real candle
      const volatility = Math.abs(close - open) * 0.5 + (range * 0.05);
      const high = Math.max(open, close) + (Math.sin(idx) * volatility * 0.5 + volatility * 0.5);
      const low = Math.min(open, close) - (Math.cos(idx) * volatility * 0.5 + volatility * 0.5);

      const x = spacing * idx;
      
      const openY = height - ((open - minVal) / range) * height;
      const closeY = height - ((close - minVal) / range) * height;
      const highY = height - ((high - minVal) / range) * height;
      const lowY = height - ((low - minVal) / range) * height;

      const isBull = close >= open;
      const color = isBull ? '#22c55e' : '#ef4444';

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw Body
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(openY - closeY), 2);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });

    // Draw active position line
    if (propPosition) {
      const entryY = height - ((propPosition.entryPrice - minVal) / range) * height;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = propPosition.type === 'LONG' ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(width, entryY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge
      ctx.fillStyle = propPosition.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
      ctx.fillRect(5, entryY - 18, 90, 16);
      ctx.strokeStyle = propPosition.type === 'LONG' ? '#22c55e' : '#ef4444';
      ctx.strokeRect(5, entryY - 18, 90, 16);
      ctx.fillStyle = propPosition.type === 'LONG' ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`ENTRY: ${propPosition.entryPrice.toFixed(propAssetConfig[propAsset].decimalDigits)}`, 8, entryY - 7);
    }

    // Price circle
    const headX = width;
    const headY = height - ((propCurrentPrice - minVal) / range) * height;
    ctx.beginPath();
    ctx.arc(headX - 4, headY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX - 4, headY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.fill();
  }, [propPriceHistory, propCurrentPrice, propPosition, theme, propAsset]);

  const handleOpenPropPos = (type: 'LONG' | 'SHORT') => {
    if (propPosition) return;
    setPropPosition({
      type,
      entryPrice: propCurrentPrice,
      lots: propLots
    });
  };

  const handleClosePropPos = () => {
    if (!propPosition) return;
    const finalPnL = getPropUnrealizedPnL();
    setPropBalance(prev => prev + finalPnL);
    setPropHistory(prev => [
      {
        type: propPosition.type,
        entryPrice: propPosition.entryPrice,
        exitPrice: propCurrentPrice,
        pnl: finalPnL,
        status: finalPnL >= 0 ? 'profit' : 'loss'
      },
      ...prev
    ]);
    setPropPosition(null);
  };

  const handleResetPropGame = () => {
    setPropBalance(STARTING_BALANCE);
    setPropMaxBalance(STARTING_BALANCE);
    setPropPosition(null);
    setPropHistory([]);
    setPropGameState('playing');
  };

  /* ════════════════════════════════════════════════════════════
     SMC ARCADE PRACTICE runner effect
     ════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (activeMode !== 'smc' || smcSubMode !== 'practice' || smcSimState !== 'running') return;

    // Start coordinates
    const initialSeries = [
      { o: 100, h: 105, l: 98, c: 102, isBull: true },
      { o: 102, h: 108, l: 101, c: 106, isBull: true },
      { o: 106, h: 110, l: 95, c: 97, isBull: false }
    ];

    /* eslint-disable react-hooks/set-state-in-effect */
    setSmcScrollCandles(initialSeries);
    setSmcCurrentPrice(97);
    const setupType = Math.random() > 0.5 ? 'BUY_OB' : 'SELL_FVG';
    setSmcActiveSetup(setupType);
    if (setupType === 'BUY_OB') {
      setSmcPrompt('ALERT: Order Block building below! Wait for price to drop and test $95, then tap BUY LONG!');
    } else {
      setSmcPrompt('ALERT: Imbalance gap left at $120. Wait for price to rally and test $120, then tap SELL SHORT!');
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    let tick = 0;
    const runTimer = setInterval(() => {
      tick++;
      setSmcScrollCandles(prev => {
        const oPrice = prev[prev.length - 1].c;
        let nextCandle: ScrollCandle;

        if (setupType === 'BUY_OB') {
          if (tick === 1) nextCandle = { o: oPrice, h: oPrice + 8, l: oPrice - 3, c: oPrice + 5, isBull: true };
          else if (tick === 2) nextCandle = { o: oPrice, h: oPrice + 3, l: oPrice - 10, c: oPrice - 8, isBull: false };
          else if (tick === 3) nextCandle = { o: oPrice, h: oPrice + 1, l: 94.5, c: 95.5, isBull: false }; // TAP POINT!
          else if (tick === 4) nextCandle = { o: oPrice, h: oPrice + 22, l: oPrice - 1, c: oPrice + 20, isBull: true }; // Target breakout
          else nextCandle = { o: oPrice, h: oPrice + 10, l: oPrice - 4, c: oPrice + 8, isBull: true };
        } else {
          if (tick === 1) nextCandle = { o: oPrice, h: oPrice + 2, l: oPrice - 12, c: oPrice - 9, isBull: false };
          else if (tick === 2) nextCandle = { o: oPrice, h: oPrice + 14, l: oPrice - 2, c: oPrice + 10, isBull: true };
          else if (tick === 3) nextCandle = { o: oPrice, h: 120.5, l: oPrice - 1, c: 119.5, isBull: true }; // TAP POINT!
          else if (tick === 4) nextCandle = { o: oPrice, h: oPrice + 1, l: oPrice - 25, c: oPrice - 22, isBull: false }; // Crash dump
          else nextCandle = { o: oPrice, h: oPrice + 2, l: oPrice - 10, c: oPrice - 8, isBull: false };
        }

        setSmcCurrentPrice(nextCandle.c);

        // Limit count to 10
        const updated = [...prev, nextCandle];
        if (updated.length > 10) updated.shift();
        return updated;
      });
    }, 1500);

    return () => clearInterval(runTimer);
  }, [activeMode, smcSubMode, smcSimState]);

  // Live PnL check during active trade
  useEffect(() => {
    if (!smcActiveTrade || smcSimState !== 'running') return;

    // Monitor TP / SL hits
    const latestCandle = smcScrollCandles[smcScrollCandles.length - 1];
    if (!latestCandle) return;

    const high = latestCandle.h;
    const low = latestCandle.l;

    /* eslint-disable react-hooks/set-state-in-effect */
    if (smcActiveTrade.type === 'LONG') {
      if (high >= smcActiveTrade.tp) {
        // TP Hit!
        triggerBlastParticles(340, 100, '#22c55e');
        triggerFloatText(340, 90, '+$1,500 TP HIT! 🚀', '#22c55e');
        setSmcScore(p => p + 150);
        setSmcXp(x => {
          const next = x + 100;
          if (next >= 500) {
            setSmcLevel(l => l + 1);
            triggerFloatText(250, 40, 'LEVEL UP! 🌟', '#eab308');
            return next - 500;
          }
          return next;
        });
        setSmcStreak(s => s + 1);
        setSmcActiveTrade(null);
        setSmcSimState('success');
        setSmcPrompt('EXCELLENT TRADING! You entered long right inside the Order Block.');
      } else if (low <= smcActiveTrade.sl) {
        // SL Hit
        setSmcIsShaking(true);
        setTimeout(() => setSmcIsShaking(false), 400);
        triggerBlastParticles(340, 160, '#ef4444');
        triggerFloatText(340, 150, '-$500 STOPPED! 💥', '#ef4444');
        setSmcStreak(0);
        setSmcActiveTrade(null);
        setSmcSimState('fail');
        setSmcPrompt('STOP LOSS TRIGGERED. Ensure you wait for the exact retest touch before executing.');
      }
    } else {
      // Short
      if (low <= smcActiveTrade.tp) {
        // TP Hit
        triggerBlastParticles(340, 160, '#22c55e');
        triggerFloatText(340, 170, '+$1,500 TP HIT! 🚀', '#22c55e');
        setSmcScore(p => p + 150);
        setSmcXp(x => {
          const next = x + 100;
          if (next >= 500) {
            setSmcLevel(l => l + 1);
            triggerFloatText(250, 40, 'LEVEL UP! 🌟', '#eab308');
            return next - 500;
          }
          return next;
        });
        setSmcStreak(s => s + 1);
        setSmcActiveTrade(null);
        setSmcSimState('success');
        setSmcPrompt('EXCELLENT SHORT! Captured the full bearish imbalance gap fill.');
      } else if (high >= smcActiveTrade.sl) {
        // SL Hit
        setSmcIsShaking(true);
        setTimeout(() => setSmcIsShaking(false), 400);
        triggerBlastParticles(340, 80, '#ef4444');
        triggerFloatText(340, 70, '-$500 STOPPED! 💥', '#ef4444');
        setSmcStreak(0);
        setSmcActiveTrade(null);
        setSmcSimState('fail');
        setSmcPrompt('STOPPED OUT. Price expanded higher beyond the FVG ceiling.');
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [smcCurrentPrice, smcActiveTrade, smcScrollCandles, smcSimState]);

  // Particle updates loop
  useEffect(() => {
    if (smcParticles.length === 0 && smcFloatTexts.length === 0) return;
    const animationFrame = requestAnimationFrame(() => {
      setSmcParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.dx,
        y: p.y + p.dy,
        size: Math.max(0, p.size - 0.1)
      })).filter(p => p.size > 0));
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [smcParticles, smcFloatTexts]);


  const handleExecuteSmcTrade = (type: 'LONG' | 'SHORT') => {
    if (smcSimState !== 'running' || smcActiveTrade) return;

    let targetTp = 0;
    let targetSl = 0;

    if (type === 'LONG') {
      targetTp = smcCurrentPrice + 15;
      targetSl = smcCurrentPrice - 10;
    } else {
      targetTp = smcCurrentPrice - 15;
      targetSl = smcCurrentPrice + 10;
    }

    setSmcActiveTrade({
      type,
      entry: smcCurrentPrice,
      tp: targetTp,
      sl: targetSl
    });
    setSmcPrompt('Trade Active! Monitoring target boundaries...');
  };

  const startNextSmcSimulation = () => {
    setSmcActiveTrade(null);
    setSmcSimState('running');
  };

  const renderSmcPracticeCandle = (c: ScrollCandle, idx: number) => {
    const scale = (val: number) => 220 - (val - 75) * 3;
    const x = idx * 42 + 40;

    const openY = scale(c.o);
    const closeY = scale(c.c);
    const highY = scale(c.h);
    const lowY = scale(c.l);

    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(openY - closeY), 3);
    const color = c.isBull ? '#22c55e' : '#ef4444';

    return (
      <g key={idx} className="transition-all duration-300">
        <line x1={x + 10} y1={highY} x2={x + 10} y2={lowY} stroke={color} strokeWidth="2" />
        <rect x={x} y={bodyY} width="20" height={bodyHeight} fill={color} rx="1" />
      </g>
    );
  };

  /* ════════════════════════════════════════════════════════════
     PRICE ACTION SLIDER BUILDER Logic
     ════════════════════════════════════════════════════════════ */
  const analyzeCustomCandle = () => {
    const upperRatio = paWickUpper;
    const lowerRatio = paWickLower;
    const absBody = Math.abs(paBodyHeight);

    const total = upperRatio + lowerRatio + absBody;
    if (total === 0) return { name: 'Flat Ticker', imp: 'Indecision', desc: 'No transaction activity registered.' };

    const bodyPct = absBody / total;
    const isBull = paBodyHeight >= 0;

    // Doji check
    if (absBody <= 4 || bodyPct < 0.1) {
      if (upperRatio < 5 && lowerRatio > 20) {
        return {
          name: 'Dragonfly Doji',
          imp: 'Bullish Reversal Rejection',
          desc: 'High seller displacement rejected. Heavy buying support absorbed all sell pressure at the session lows.'
        };
      }
      if (lowerRatio < 5 && upperRatio > 20) {
        return {
          name: 'Gravestone Doji',
          imp: 'Bearish Reversal Rejection',
          desc: 'High buyer expansion rejected. Aggressive sellers took back control at the highs.'
        };
      }
      return {
        name: 'Classic Doji',
        imp: 'Neutral / Complete Indecision',
        desc: 'Buyers and sellers are in perfect balance. Watch for structural breaks to dictate next direction.'
      };
    }

    // Hammer check
    if (isBull && upperRatio < absBody * 0.35 && lowerRatio >= absBody * 2) {
      return {
        name: 'Bullish Hammer Pinbar',
        imp: 'Strong Bullish Reversal',
        desc: 'Sellers tried to push lower, but buyers strongly rejected the lows, closing bullishly near the high.'
      };
    }

    // Shooting Star check
    if (!isBull && lowerRatio < absBody * 0.35 && upperRatio >= absBody * 2) {
      return {
        name: 'Shooting Star Pinbar',
        imp: 'Strong Bearish Reversal',
        desc: 'Buyers pushed price up, but sellers aggressively rejected higher values, driving price to close near session lows.'
      };
    }

    // Marubozu
    if (bodyPct > 0.82) {
      return {
        name: isBull ? 'Bullish Marubozu' : 'Bearish Marubozu',
        imp: isBull ? 'Bullish Continuation' : 'Bearish Continuation',
        desc: 'Total control. Price opened at one extreme and closed at the other, showing zero opposite pressure.'
      };
    }

    // Spinning Top
    if (upperRatio > absBody && lowerRatio > absBody) {
      return {
        name: 'Spinning Top',
        imp: 'Indecision / Reversal Warning',
        desc: 'Significant struggle between bulls and bears. Neither side could secure a decisive close.'
      };
    }

    return {
      name: isBull ? 'Standard Bullish Candle' : 'Standard Bearish Candle',
      imp: isBull ? 'Bullish Trend Continuation' : 'Bearish Trend Continuation',
      desc: 'Standard price movement conforming to the dominant buying or selling trend.'
    };
  };

  const candleAnalysis = analyzeCustomCandle();

  /* ════════════════════════════════════════════════════════════
     PRICE ACTION QUIZ Logic
     ════════════════════════════════════════════════════════════ */
  const currentQuizLevel = QUIZ_LEVELS[paQuizLevelIdx];

  const handleQuizAnswer = (option: string) => {
    if (paQuizState !== 'unanswered' && paQuizState !== 'part1_wrong') return;
    setSelectedPaOption(option);

    if (option === currentQuizLevel.correctAnswer) {
      setPaQuizState('part1_correct');
      setPaQuizScore(s => s + 50);
    } else {
      setPaQuizState('part1_wrong');
      setPaQuizHearts(h => Math.max(0, h - 1));
    }
  };

  const handleQuizAnswerPart2 = (option: string) => {
    if (paQuizState !== 'part1_correct' && paQuizState !== 'part2_wrong') return;
    setSelectedPaOption(option);

    if (option === currentQuizLevel.correctAnswer2) {
      setPaQuizState('part2_correct');
      setPaQuizScore(s => s + 50);
    } else {
      setPaQuizState('part2_wrong');
      setPaQuizHearts(h => Math.max(0, h - 1));
    }
  };

  const handleNextQuizLevel = () => {
    setSelectedPaOption(null);
    setPaQuizState('unanswered');
    if (paQuizLevelIdx < QUIZ_LEVELS.length - 1) {
      setPaQuizLevelIdx(p => p + 1);
    } else {
      setPaQuizState('completed');
    }
  };

  const restartPaQuiz = () => {
    setPaQuizHearts(3);
    setPaQuizLevelIdx(0);
    setPaQuizScore(0);
    setSelectedPaOption(null);
    setPaQuizState('unanswered');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <style>{customStyles}</style>

      {/* ── MODE 1: DASHBOARD SELECTOR ── */}
      {activeMode === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Info */}
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
              Trading <span className="text-brand-green">Arcade</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Step into the interactive simulator arena. Master SMC layouts, learn candlestick triggers, and conquer prop evaluations.
            </p>
          </div>

          {/* Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card A: Prop Speed challenge */}
            <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-md transition-all hover:scale-[1.02] group">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black uppercase text-text-primary">Prop Speed Challenge</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fast-paced paper trading. Run standard risk rules ($96k daily drawdown boundary) to hit a $105k target. Earn verification certificates.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveMode('prop');
                  setPropGameState('welcome');
                }}
                className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
              >
                Launch Simulator
              </button>
            </div>

            {/* Card B: SMC Chart Detective */}
            <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-md transition-all hover:scale-[1.02] group">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black uppercase text-text-primary">SMC Chart Detective</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Identify Order Blocks, Fair Value Gaps, BOS, and sweeps. Includes conceptual campaign checks and a revamped speed-scrolling execution runner.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveMode('smc');
                  setSmcSubMode('dashboard');
                }}
                className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
              >
                Enter SMC Arcade
              </button>
            </div>

            {/* Card C: Price Action Mastery */}
            <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-md transition-all hover:scale-[1.02] group">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black uppercase text-text-primary">Price Action Mastery</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Learn wicks and candle shapes interactively using our slider builder tool, then test your bias identification inside a multi-level pattern quiz.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveMode('priceaction');
                  setPaSubMode('dashboard');
                }}
                className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
              >
                Master Price Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: PROP SPEED CHALLENGE ── */}
      {activeMode === 'prop' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-border-theme">
            <button
              onClick={() => setActiveMode('dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Arcade Dashboard</span>
            </button>
            <div className="text-[10px] font-black uppercase text-brand-green tracking-widest bg-brand-green/10 px-2.5 py-0.5 rounded border border-brand-green/20">
              PROP SIMULATOR
            </div>
          </div>

          <div className="bg-bg-card border border-border-theme rounded-2xl overflow-hidden shadow-xl relative min-h-[500px] flex flex-col justify-between">
            {propGameState === 'welcome' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center animate-fade-in my-auto">
                <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-2xl">
                  <Gamepad2 className="h-12 w-12 text-brand-green animate-bounce" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-black uppercase text-text-primary">Evaluation Challenge Simulator</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Test your execution timing and lot management. Reach the target equity of **$105,000** without dropping below the drawdown boundary of **$96,000**.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border border-border-theme bg-bg-input/40 rounded-xl p-4 w-full max-w-sm text-center">
                  <div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Start Account</span>
                    <span className="text-xs font-black text-text-primary mt-0.5 block">$100k</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Target Profit</span>
                    <span className="text-xs font-black text-brand-green mt-0.5 block">+$5k ($105k)</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Max Drawdown</span>
                    <span className="text-xs font-black text-red-500 mt-0.5 block">-$4k ($96k)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Select Asset</label>
                    <select
                      value={propAsset}
                      onChange={(e) => setPropAsset(e.target.value as 'XAUUSD' | 'EURUSD' | 'BTCUSD')}
                      className="w-full px-3 py-2 text-xs bg-bg-input font-bold rounded-lg border border-border-theme focus:outline-none"
                    >
                      <option value="XAUUSD">Gold Spot (XAUUSD)</option>
                      <option value="EURUSD">EUR/USD Forex</option>
                      <option value="BTCUSD">Bitcoin Spot (BTCUSD)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setPropGameState('playing')}
                  className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  START SIMULATOR
                </button>
              </div>
            )}

            {propGameState === 'playing' && (
              <div className="flex-1 flex flex-col justify-between">
                {/* HUD */}
                <div className="border-b border-border-theme bg-bg-secondary/40 p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Account Equity</div>
                    <div className="text-base font-black text-text-primary flex items-center gap-1.5 mt-0.5">
                      <DollarSign className="h-4 w-4 text-brand-green" />
                      <span>{propEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Balance / Target</div>
                    <div className="text-xs font-bold text-text-secondary mt-1 flex items-center gap-1.5">
                      <span className="font-mono">${propBalance.toLocaleString()}</span>
                      <span className="text-text-muted">/</span>
                      <span className="text-brand-green font-mono">${PROFIT_TARGET.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Drawdown Margin Left</div>
                    <div className="text-xs font-bold text-red-500 mt-1 font-mono">
                      ${Math.max(0, propEquity - DRAWDOWN_LIMIT).toLocaleString()} left
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Drawdown Risk Gauge</div>
                    <div className="h-2 w-full bg-bg-input border border-border-theme rounded-full overflow-hidden mt-1.5 flex">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-300"
                        style={{ width: `${Math.min(((STARTING_BALANCE - propEquity) / (STARTING_BALANCE - DRAWDOWN_LIMIT)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="relative flex-1 bg-black/10 min-h-[250px] border-b border-border-theme flex items-center justify-center">
                  <canvas ref={canvasRef} className="w-full h-full min-h-[250px] absolute inset-0" />
                  
                  <div className="absolute right-4 top-4 bg-black/60 backdrop-blur-md border border-border-theme px-3 py-1.5 rounded-lg text-right pointer-events-none select-none">
                    <div className="text-[8px] font-black uppercase text-text-muted font-mono">{propAsset} Price</div>
                    <div className="text-sm font-black text-brand-green font-mono mt-0.5">
                      ${propCurrentPrice.toFixed(propAssetConfig[propAsset].decimalDigits)}
                    </div>
                  </div>

                  {((STARTING_BALANCE - propEquity) / (STARTING_BALANCE - DRAWDOWN_LIMIT) * 100) >= 70 && (
                    <div className="absolute inset-x-0 bottom-4 mx-auto max-w-xs bg-red-950/80 border border-red-500/50 rounded-xl px-4 py-2 flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-pulse justify-center shadow-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <span>CRITICAL DRAWDOWN WARNING!</span>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-4 sm:p-5 bg-bg-secondary/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto text-left">
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-text-muted mb-1">Asset</label>
                      <div className="bg-bg-input border border-border-theme rounded-xl px-3 py-1.5 text-xs font-black text-text-primary">
                        {propAsset}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-text-muted mb-1">Lot Sizing</label>
                      <div className="flex items-center border border-border-theme bg-bg-input rounded-xl overflow-hidden">
                        <button 
                          onClick={() => setPropLots(prev => Math.max(1.0, prev - 1.0))}
                          disabled={!!propPosition}
                          className="px-3 py-1.5 hover:bg-bg-hover text-xs font-black transition-colors disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-text-primary">
                          {propLots.toFixed(1)}
                        </span>
                        <button 
                          onClick={() => setPropLots(prev => Math.min(25.0, prev + 1.0))}
                          disabled={!!propPosition}
                          className="px-3 py-1.5 hover:bg-bg-hover text-xs font-black transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {propPosition && (
                      <div className="bg-bg-input border border-border-theme rounded-xl px-4 py-1.5 flex items-center gap-4 text-left">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-text-muted block">Position</span>
                          <span className={`text-[10px] font-black uppercase ${propPosition.type === 'LONG' ? 'text-brand-green' : 'text-red-500'}`}>
                            {propPosition.type}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-text-muted block">Lots</span>
                          <span className="text-[10px] font-mono font-black text-text-secondary">
                            {propPosition.lots.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-text-muted block">Floating P&L</span>
                          <span className={`text-[10px] font-mono font-black ${propUnrealized >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                            {propUnrealized >= 0 ? '+' : ''}${propUnrealized.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    {propPosition ? (
                      <button
                        onClick={handleClosePropPos}
                        className="w-full md:w-auto bg-yellow-600 text-black border border-yellow-600 hover:bg-transparent hover:text-yellow-600 px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                      >
                        CLOSE POSITION
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenPropPos('LONG')}
                          className="flex-1 md:flex-none bg-green-950/20 border border-green-500/40 text-green-400 hover:bg-green-500 hover:text-black px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                        >
                          BUY LONG
                        </button>
                        <button
                          onClick={() => handleOpenPropPos('SHORT')}
                          className="flex-1 md:flex-none bg-red-950/20 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                        >
                          SELL SHORT
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {propHistory.length > 0 && (
                  <div className="p-4 border-t border-border-theme bg-bg-secondary/15 text-left">
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-wider block mb-2">Recent Challenge Trades</span>
                    <div className="flex gap-4 overflow-x-auto">
                      {propHistory.slice(0, 3).map((h, idx) => (
                        <div key={idx} className="bg-bg-input border border-border-theme px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                          <span className={h.type === 'LONG' ? 'text-brand-green' : 'text-red-500'}>{h.type}</span>
                          <span className="text-text-muted">|</span>
                          <span className={h.pnl >= 0 ? 'text-brand-green' : 'text-red-500'}>{h.pnl >= 0 ? '+' : ''}${h.pnl.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PROP PASSED / FAILED overlays */}
            {propGameState === 'passed' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in my-auto">
                <div className="p-4 bg-brand-green/15 border border-brand-green/30 rounded-full animate-pulse text-brand-green">
                  <Trophy className="h-14 w-14" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase text-brand-green">Verification Passed!</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Amazing! You successfully reached **${propBalance.toLocaleString()}** while maintaining complete compliance with all evaluation parameters.
                  </p>
                </div>

                {/* Printable certificate */}
                <div className="w-full max-w-md border-2 border-dashed border-brand-green/30 bg-bg-secondary/40 rounded-2xl p-6 space-y-4 text-center select-all">
                  <span className="text-[8px] font-black uppercase text-brand-green tracking-widest block">propNPL Funded Certificate</span>
                  <h4 className="text-base font-bold text-text-primary">TRADER EVALUATION PASS</h4>
                  <div className="text-xs text-text-secondary font-mono">
                    VERIFICATION KEY: <span className="text-text-primary font-bold">{propVerificationHash}</span>
                  </div>
                  <div className="text-[10px] text-text-muted leading-relaxed">
                    This verification key serves as a verified proof of completion for Nepal prop firm evaluation challenge simulations.
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleResetPropGame} className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-6 py-2.5 rounded-xl text-xs font-black transition-all">
                    Restart Simulator
                  </button>
                  <button onClick={() => setActiveMode('dashboard')} className="bg-bg-input border border-border-theme hover:border-border-hover px-6 py-2.5 rounded-xl text-xs font-black transition-all">
                    Exit Mode
                  </button>
                </div>
              </div>
            )}

            {propGameState === 'failed' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 animate-fade-in my-auto">
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-full text-red-500">
                  <AlertTriangle className="h-14 w-14 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase text-red-500">Evaluation Failed</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Drawdown violation. Your equity dropped to **${propBalance.toLocaleString()}**, breaching the absolute limit floor of **$96,000**.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleResetPropGame} className="bg-red-500 text-white border border-red-500 hover:bg-transparent hover:text-red-500 px-6 py-2.5 rounded-xl text-xs font-black transition-all">
                    Reset Challenge
                  </button>
                  <button onClick={() => setActiveMode('dashboard')} className="bg-bg-input border border-border-theme hover:border-border-hover px-6 py-2.5 rounded-xl text-xs font-black transition-all">
                    Exit Mode
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── MODE 3: SMC GAME MODULE ── */}
      {activeMode === 'smc' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-border-theme">
            <button
              onClick={() => setActiveMode('dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Arcade Dashboard</span>
            </button>
            <div className="text-[10px] font-black uppercase text-brand-green tracking-widest bg-brand-green/10 px-2.5 py-0.5 rounded border border-brand-green/20">
              SMC GAME CENTER
            </div>
          </div>

          {smcSubMode === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green">
                    <BookOpenCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black uppercase text-text-primary">1. SMC Concept Campaign</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Learn the 5 key structural footprints of Smart Money. Click wicks, gaps, and order blocks on real-time SVG diagrams. Correct answers earn campaign points.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSmcSubMode('campaign');
                    setSmcCampaignStatus('unanswered');
                    setSmcSelectedCandleIdx(null);
                  }}
                  className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                >
                  Start Campaign
                </button>
              </div>

              <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green animate-pulse">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black uppercase text-text-primary">2. Scrolling Speed Practice</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    A scrolling timeline with live setup alerts! Execute BUY / SELL on retests of glowing green order blocks or filling red gaps. Features floating target lines and particle hits.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSmcSubMode('practice');
                    setSmcSimState('ready');
                    setSmcActiveTrade(null);
                  }}
                  className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                >
                  Enter Practice Arena
                </button>
              </div>
            </div>
          )}

          {/* SMC CAMPAIGN COMPONENT */}
          {smcSubMode === 'campaign' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
              {/* Left Details */}
              <div className="lg:col-span-5 bg-bg-card border border-border-theme rounded-2xl p-5 sm:p-6 space-y-5">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded">
                      {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].concept}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-text-muted">
                      Level {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].id} of {SMC_CAMPAIGN_LEVELS.length}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-text-primary mt-2">
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mt-2">
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].description}
                  </p>
                </div>

                <div className="border border-border-theme bg-bg-input/40 rounded-xl p-4 space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-brand-green" />
                    <span>Your Objective</span>
                  </h4>
                  <p className="text-xs text-text-secondary font-semibold">
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].objective}
                  </p>
                </div>

                {smcCampaignStatus === 'correct' && (
                  <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-green-400 text-xs font-black uppercase">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      <span>Correct! +100 Points</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].explanation}
                    </p>
                    <button
                      onClick={() => {
                        setSmcSelectedCandleIdx(null);
                        setSmcCampaignStatus('unanswered');
                        if (smcCampaignLvlIdx < SMC_CAMPAIGN_LEVELS.length - 1) {
                          setSmcCampaignLvlIdx(p => p + 1);
                        } else {
                          setSmcCampaignLvlIdx(0);
                        }
                      }}
                      className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
                    >
                      <span>{smcCampaignLvlIdx === SMC_CAMPAIGN_LEVELS.length - 1 ? 'Finish Campaign' : 'Next Concept'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {smcCampaignStatus === 'wrong' && (
                  <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase">
                      <XCircle className="h-4.5 w-4.5" />
                      <span>Incorrect Choice</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      That is not the correct structure candle. Review the definition block, compare candle heights and coordinates, and select again.
                    </p>
                    <button
                      onClick={() => {
                        setSmcSelectedCandleIdx(null);
                        setSmcCampaignStatus('unanswered');
                      }}
                      className="w-full border border-border-theme bg-bg-secondary text-text-primary hover:border-border-hover py-2 rounded-lg text-xs font-black transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSmcSubMode('dashboard')}
                  className="w-full py-2 border border-border-theme hover:border-border-hover text-text-muted text-xs font-bold rounded-lg transition-colors"
                >
                  Return to SMC Menu
                </button>
              </div>

              {/* Right Interactive SVGs */}
              <div className="lg:col-span-7 bg-bg-card border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
                <div className="flex justify-between items-center pb-2 border-b border-border-theme/40 mb-4 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Interactive Candidate Box</span>
                  <div className="text-xs font-bold text-text-primary">
                    SCORE: <span className="text-brand-green font-mono">{smcCampaignScore}</span>
                  </div>
                </div>

                <div className="relative border border-border-theme bg-bg-secondary/20 rounded-xl p-4 flex items-center justify-center min-h-[260px]">
                  <svg className="w-full min-h-[250px] overflow-visible" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid meet">
                    {/* Reference Lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeDasharray="3,3" />
                    <line x1="0" y1="220" x2="500" y2="220" stroke="var(--border)" strokeDasharray="3,3" />

                    {/* Structure limits */}
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].id === 3 && (
                      <g>
                        <line x1="30" y1="50" x2="350" y2="50" stroke="#ca8a04" strokeDasharray="3,3" strokeWidth="1.5" />
                        <text x="50" y="45" fill="#ca8a04" className="text-[8px] font-mono font-bold uppercase">SWING HIGH LEVEL</text>
                      </g>
                    )}
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].id === 4 && (
                      <g>
                        <line x1="90" y1="140" x2="400" y2="140" stroke="#ca8a04" strokeDasharray="3,3" strokeWidth="1.5" />
                        <text x="100" y="135" fill="#ca8a04" className="text-[8px] font-mono font-bold uppercase">HIGHER LOW FLOOR</text>
                      </g>
                    )}

                    {/* Target highlight */}
                    {smcCampaignStatus === 'correct' && SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone && (
                      <g className="animate-fade-in">
                        <rect
                          x="230"
                          y={SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone.yMin}
                          width="165"
                          height={Math.abs(SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone.yMax - SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone.yMin)}
                          fill="url(#smc-zone-grad)"
                          stroke="#22c55e"
                          strokeWidth="1.2"
                          strokeDasharray="4,4"
                        />
                        <text
                          x="235"
                          y={SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone.yMin + 15}
                          fill="#22c55e"
                          className="text-[9px] font-bold font-mono uppercase tracking-wider"
                        >
                          {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetZone.label}
                        </text>
                      </g>
                    )}

                    {/* Render level candles */}
                    {SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].candles.map(c => {
                      const isTarget = SMC_CAMPAIGN_LEVELS[smcCampaignLvlIdx].targetCandleIndex === c.index;
                      const isSelected = smcSelectedCandleIdx === c.index;
                      const x = c.index * 60 + 40;
                      const scale = (val: number) => 220 - (val - 75) * 2;

                      const openY = scale(c.open);
                      const closeY = scale(c.close);
                      const highY = scale(c.high);
                      const lowY = scale(c.low);

                      const rectY = Math.min(openY, closeY);
                      const rectH = Math.max(Math.abs(openY - closeY), 3);
                      const color = c.isBullish ? '#22c55e' : '#ef4444';

                      return (
                        <g
                          key={c.index}
                          className="cursor-pointer group select-none"
                          onClick={() => {
                            if (smcCampaignStatus !== 'unanswered') return;
                            setSmcSelectedCandleIdx(c.index);
                            if (isTarget) {
                              setSmcCampaignStatus('correct');
                              setSmcCampaignScore(prev => prev + 100);
                            } else {
                              setSmcCampaignStatus('wrong');
                            }
                          }}
                        >
                          <line x1={x + 15} y1={highY} x2={x + 15} y2={lowY} stroke={color} strokeWidth="2.2" className="group-hover:stroke-[3.5] transition-all" />
                          <rect
                            x={x}
                            y={rectY}
                            width="30"
                            height={rectH}
                            fill={isSelected ? '#eab308' : color}
                            stroke={isSelected ? '#eab308' : isTarget && smcCampaignStatus === 'correct' ? '#22c55e' : color}
                            strokeWidth="1.5"
                            className="group-hover:fill-brand-green group-hover:stroke-brand-green hover:scale-y-[1.02] transition-transform duration-100 rounded shadow-md"
                          />
                          {c.label && (
                            <text x={x + 15} y={highY - 10} textAnchor="middle" fill="var(--text-muted)" className="text-[9px] font-mono font-bold uppercase">
                              {c.label}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="smc-zone-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.14)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0.01)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="text-[10px] text-text-muted text-center mt-3">
                  *Inspect and click on the candle that qualifies as the setup trigger candle.
                </div>
              </div>
            </div>
          )}

          {/* SMC SCROLLING PRACTICE CENTER */}
          {smcSubMode === 'practice' && (
            <div className={`bg-bg-card border border-border-theme rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[460px] ${smcIsShaking ? 'animate-shake-view' : ''}`}>
              {/* Practice HUD */}
              <div className="border-b border-border-theme bg-bg-secondary/40 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-left select-none">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-yellow-600/10 border border-yellow-600/30 text-yellow-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Score: {smcScore}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-brand-green/10 border border-brand-green/30 text-brand-green px-3 py-1 rounded-full text-xs font-black uppercase">
                      <Flame className="h-3.5 w-3.5" />
                      <span>Streak: {smcStreak}</span>
                    </div>
                    <div className="text-xs font-black text-text-primary">
                      RANK: <span className="text-brand-green font-mono">Lvl {smcLevel}</span> (XP: {smcXp}/500)
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed mt-0.5">
                    Click BUY/SELL when the scrolling candle price taps the highlighted green/red zones.
                  </p>
                </div>

                <div className="flex gap-2">
                  {smcSimState === 'ready' && (
                    <button
                      onClick={startNextSmcSimulation}
                      className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      START TIMELINE
                    </button>
                  )}
                  {(smcSimState === 'success' || smcSimState === 'fail') && (
                    <button
                      onClick={startNextSmcSimulation}
                      className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-5 py-2.5 rounded-xl text-xs font-black transition-all"
                    >
                      Load Next Run
                    </button>
                  )}
                </div>
              </div>

              {/* Ticker status notification */}
              <div className="bg-bg-input/60 px-5 py-3 border-b border-border-theme text-left">
                <span className="text-[9px] font-black uppercase text-brand-green tracking-widest block">Live Analyzer Stream</span>
                <p className="text-xs font-extrabold text-text-secondary mt-0.5">{smcPrompt}</p>
              </div>

              {/* Simulated visual timeline */}
              <div className="flex-1 bg-black/10 p-5 flex items-center justify-center min-h-[240px] relative overflow-hidden select-none">
                {smcSimState === 'ready' ? (
                  <div className="text-center space-y-2">
                    <Activity className="h-10 w-10 text-brand-green mx-auto animate-pulse" />
                    <p className="text-xs text-text-muted">Click Start to launch scrolling interactive candlesticks.</p>
                  </div>
                ) : (
                  <svg className="w-full max-h-[220px] overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                    {/* Background boundary grids */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border)" strokeDasharray="3,3" />
                    <line x1="0" y1="180" x2="500" y2="180" stroke="var(--border)" strokeDasharray="3,3" />

                    {/* active Order block or FVG setups highlight */}
                    {smcActiveSetup === 'BUY_OB' && (
                      <g className="animate-pulse">
                        <rect x="0" y="150" width="500" height="25" fill="rgba(34,197,94,0.07)" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#22c55e" strokeDasharray="3,3" strokeWidth="1" />
                        <line x1="0" y1="175" x2="500" y2="175" stroke="#22c55e" strokeDasharray="3,3" strokeWidth="1" />
                        <text x="15" y="165" fill="#22c55e" className="text-[8px] font-mono font-bold">BULLISH ORDER BLOCK TEST ($95)</text>
                      </g>
                    )}

                    {smcActiveSetup === 'SELL_FVG' && (
                      <g className="animate-pulse">
                        <rect x="0" y="70" width="500" height="25" fill="rgba(239,68,68,0.07)" />
                        <line x1="0" y1="70" x2="500" y2="70" stroke="#ef4444" strokeDasharray="3,3" strokeWidth="1" />
                        <line x1="0" y1="95" x2="500" y2="95" stroke="#ef4444" strokeDasharray="3,3" strokeWidth="1" />
                        <text x="15" y="85" fill="#ef4444" className="text-[8px] font-mono font-bold">BEARISH FVG IMBALANCE FILL ($120)</text>
                      </g>
                    )}

                    {/* Active Trade Targets Lines */}
                    {smcActiveTrade && (
                      <g>
                        {/* Entry */}
                        <line x1="0" y1={220 - (smcActiveTrade.entry - 75) * 3} x2="500" y2={220 - (smcActiveTrade.entry - 75) * 3} stroke="#3b82f6" strokeDasharray="4,4" strokeWidth="1.5" />
                        <text x="400" y={220 - (smcActiveTrade.entry - 75) * 3 - 4} fill="#3b82f6" className="text-[8px] font-bold font-mono">ENTRY</text>

                        {/* TP */}
                        <line x1="0" y1={220 - (smcActiveTrade.tp - 75) * 3} x2="500" y2={220 - (smcActiveTrade.tp - 75) * 3} stroke="#22c55e" strokeDasharray="2,2" strokeWidth="1.5" />
                        <text x="400" y={220 - (smcActiveTrade.tp - 75) * 3 - 4} fill="#22c55e" className="text-[8px] font-bold font-mono">TARGET PROFIT</text>

                        {/* SL */}
                        <line x1="0" y1={220 - (smcActiveTrade.sl - 75) * 3} x2="500" y2={220 - (smcActiveTrade.sl - 75) * 3} stroke="#ef4444" strokeDasharray="2,2" strokeWidth="1.5" />
                        <text x="400" y={220 - (smcActiveTrade.sl - 75) * 3 - 4} fill="#ef4444" className="text-[8px] font-bold font-mono">STOP LOSS</text>
                      </g>
                    )}

                    {/* Render scroll series */}
                    {smcScrollCandles.map((c, idx) => renderSmcPracticeCandle(c, idx))}

                    {/* Floating PnL badge */}
                    {smcActiveTrade && (
                      <g className="animate-pulse">
                        <rect
                          x="380"
                          y={220 - (smcCurrentPrice - 75) * 3 - 24}
                          width="50"
                          height="16"
                          rx="4"
                          fill={smcActiveTrade.type === 'LONG' ? (smcCurrentPrice >= smcActiveTrade.entry ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)') : (smcCurrentPrice <= smcActiveTrade.entry ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)')}
                        />
                        <text
                          x="405"
                          y={220 - (smcCurrentPrice - 75) * 3 - 12}
                          textAnchor="middle"
                          fill="#ffffff"
                          className="text-[8px] font-mono font-bold"
                        >
                          {smcActiveTrade.type === 'LONG'
                            ? (smcCurrentPrice >= smcActiveTrade.entry ? '+$600' : '-$350')
                            : (smcCurrentPrice <= smcActiveTrade.entry ? '+$600' : '-$350')}
                        </text>
                      </g>
                    )}

                    {/* Explosion Particles */}
                    {smcParticles.map(p => (
                      <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r={p.size}
                        fill={p.color}
                        className="animate-radial-particle"
                        style={{
                          // Set dx/dy variables for CSS transition
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          '--dx': `${p.dx * 12}px`,
                          '--dy': `${p.dy * 12}px`
                        }}
                      />
                    ))}

                    {/* Floating Text overlay */}
                    {smcFloatTexts.map(t => (
                      <text
                        key={t.id}
                        x={t.x}
                        y={t.y}
                        fill={t.color}
                        className="text-xs font-black uppercase font-sans animate-float-pnl"
                        textAnchor="middle"
                      >
                        {t.text}
                      </text>
                    ))}
                  </svg>
                )}
              </div>

              {/* Execution panel */}
              {smcSimState === 'running' && (
                <div className="p-4 border-t border-border-theme bg-bg-secondary/35 flex gap-4 justify-center">
                  <button
                    onClick={() => handleExecuteSmcTrade('LONG')}
                    disabled={!!smcActiveTrade}
                    className="bg-green-950/20 border border-green-500/50 hover:bg-green-500 hover:text-black text-green-400 disabled:opacity-40 px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                  >
                    BUY LONG (OB RETEST)
                  </button>
                  <button
                    onClick={() => handleExecuteSmcTrade('SHORT')}
                    disabled={!!smcActiveTrade}
                    className="bg-red-950/20 border border-red-500/50 hover:bg-red-500 hover:text-black text-red-400 disabled:opacity-40 px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                  >
                    SELL SHORT (FVG FILL)
                  </button>
                </div>
              )}

              {/* Reset to menu footer */}
              <div className="p-3 border-t border-border-theme text-center bg-bg-secondary/20">
                <button
                  onClick={() => setSmcSubMode('dashboard')}
                  className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                >
                  Return to SMC Select Menu
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── MODE 4: PRICE ACTION MASTERY MODULE ── */}
      {activeMode === 'priceaction' && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-border-theme">
            <button
              onClick={() => setActiveMode('dashboard')}
              className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Arcade Dashboard</span>
            </button>
            <div className="text-[10px] font-black uppercase text-brand-green tracking-widest bg-brand-green/10 px-2.5 py-0.5 rounded border border-brand-green/20">
              PRICE ACTION LABS
            </div>
          </div>

          {/* PA Dashboard Sub Menu Selector */}
          {paSubMode === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
              <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black uppercase text-text-primary">1. Interactive Candle Builder</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Tweak wicks and body height sliders in real time. Watch how the candle shape changes and automatically triggers the correct pattern classification.
                  </p>
                </div>
                <button
                  onClick={() => setPaSubMode('guide')}
                  className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                >
                  Enter Builder Lab
                </button>
              </div>

              <div className="bg-bg-card border border-border-theme hover:border-brand-green/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black uppercase text-text-primary">2. Pattern Identification Quiz</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Identify highlighted candles and market biases in a multi-level quiz. You have 3 hearts/lives before game-over. Score high combos!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPaSubMode('quiz');
                    restartPaQuiz();
                  }}
                  className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* INTERACTIVE CANDLESTICK ENCYCLOPEDIA & BUILDER */}
          {paSubMode === 'guide' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
              {/* Left sliders controls */}
              <div className="lg:col-span-6 bg-bg-card border border-border-theme rounded-2xl p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-text-primary">Interactive Candle Simulator</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Slide body height, upper wick size, and lower wick size parameters to construct custom candlestick patterns.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-text-secondary mb-1">
                      <span>Body Size & Bias (Bearish ➔ Bullish)</span>
                      <span className="font-mono text-brand-green">{paBodyHeight}</span>
                    </div>
                    <input 
                      type="range" min="-70" max="70" value={paBodyHeight}
                      onChange={(e) => setPaBodyHeight(parseInt(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-bg-secondary h-2.5 rounded-lg border border-border-theme appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-text-secondary mb-1">
                      <span>Upper Wick (High Shadow)</span>
                      <span className="font-mono text-brand-green">{paWickUpper}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={paWickUpper}
                      onChange={(e) => setPaWickUpper(parseInt(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-bg-secondary h-2.5 rounded-lg border border-border-theme appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-text-secondary mb-1">
                      <span>Lower Wick (Low Shadow)</span>
                      <span className="font-mono text-brand-green">{paWickLower}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={paWickLower}
                      onChange={(e) => setPaWickLower(parseInt(e.target.value))}
                      className="w-full accent-green-500 cursor-ew-resize bg-bg-secondary h-2.5 rounded-lg border border-border-theme appearance-none"
                    />
                  </div>
                </div>

                {/* Classification HUD */}
                <div className="border border-border-theme bg-bg-secondary/40 rounded-2xl p-4 space-y-2 text-left">
                  <div>
                    <span className="text-[9px] font-black uppercase text-brand-green tracking-widest block">Detected Pattern</span>
                    <span className="text-base font-black text-text-primary block mt-0.5">{candleAnalysis.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-widest block">Market Bias Implication</span>
                    <span className={`text-xs font-black uppercase block mt-0.5 ${candleAnalysis.imp.includes('Bullish') ? 'text-brand-green' : candleAnalysis.imp.includes('Bearish') ? 'text-red-500' : 'text-yellow-600'}`}>
                      {candleAnalysis.imp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-text-muted tracking-widest block">Market Psychology</span>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1 font-semibold">
                      {candleAnalysis.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPaSubMode('dashboard')}
                  className="w-full py-2.5 border border-border-theme hover:border-border-hover text-xs font-bold text-text-muted rounded-xl transition-colors"
                >
                  Exit to Price Action Menu
                </button>
              </div>

              {/* Right Candle Renderer */}
              <div className="lg:col-span-6 bg-bg-card border border-border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center min-h-[360px]">
                <span className="text-[10px] font-black uppercase text-text-muted mb-4 self-start">Visual Live Preview</span>

                <div className="relative border border-border-theme bg-bg-secondary/20 rounded-xl p-4 flex items-center justify-center w-full max-w-sm min-h-[260px]">
                  <svg className="w-full max-w-[200px] min-h-[250px] overflow-visible" viewBox="0 0 180 300" preserveAspectRatio="xMidYMid meet">
                    {/* SVG coordinate drawing */}
                    {(() => {
                      const centerY = 150;
                      const openY = centerY;
                      const closeY = centerY - paBodyHeight;
                      const highY = Math.min(openY, closeY) - paWickUpper;
                      const lowY = Math.max(openY, closeY) + paWickLower;

                      const rectY = Math.min(openY, closeY);
                      const rectHeight = Math.max(Math.abs(openY - closeY), 2.5);
                      const isBull = paBodyHeight >= 0;
                      const color = isBull ? '#22c55e' : '#ef4444';

                      return (
                        <g>
                          {/* Wick line */}
                          <line x1="90" y1={highY} x2="90" y2={lowY} stroke={color} strokeWidth="3" />
                          {/* Body */}
                          <rect x="70" y={rectY} width="40" height={rectHeight} fill={color} stroke={color} strokeWidth="1" rx="2" />
                          
                          {/* Labels */}
                          <text x="145" y={highY + 3} textAnchor="start" fill="var(--text-muted)" className="text-[8px] font-mono font-bold">HIGH ({Math.round(300 - highY)})</text>
                          <text x="145" y={rectY + 3} textAnchor="start" fill="var(--text-muted)" className="text-[8px] font-mono font-bold">{isBull ? 'CLOSE' : 'OPEN'} ({Math.round(300 - rectY)})</text>
                          <text x="145" y={rectY + rectHeight + 3} textAnchor="start" fill="var(--text-muted)" className="text-[8px] font-mono font-bold">{isBull ? 'OPEN' : 'CLOSE'} ({Math.round(300 - (rectY + rectHeight))})</text>
                          <text x="145" y={lowY + 3} textAnchor="start" fill="var(--text-muted)" className="text-[8px] font-mono font-bold">LOW ({Math.round(300 - lowY)})</text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* VISUAL CANDLESTICK QUIZ */}
          {paSubMode === 'quiz' && (
            <div className="bg-bg-card border border-border-theme rounded-2xl overflow-hidden shadow-xl min-h-[480px] flex flex-col justify-between animate-fade-in text-left">
              {paQuizState !== 'completed' && paQuizHearts > 0 ? (
                <div className="flex-1 flex flex-col justify-between">
                  {/* HUD */}
                  <div className="border-b border-border-theme bg-bg-secondary/40 p-4 sm:p-5 flex justify-between items-center select-none">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded">
                        Level {currentQuizLevel.id} of {QUIZ_LEVELS.length}
                      </span>
                      <h3 className="text-base font-black text-text-primary mt-1">Quiz Score: <span className="font-mono text-brand-green">{paQuizScore}</span></h3>
                    </div>

                    {/* Hearts health layout */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <Heart
                          key={idx}
                          className={`h-5 w-5 ${idx < paQuizHearts ? 'text-red-500 fill-current' : 'text-text-muted opacity-30'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* SVG Quiz Chart Preview */}
                  <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-b border-border-theme">
                    {/* SVG Drawing */}
                    <div className="border border-border-theme bg-bg-secondary/20 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                      <svg className="w-full min-h-[200px] overflow-visible animate-fade-in" viewBox="0 0 420 200" preserveAspectRatio="xMidYMid meet">
                        {/* Reference lines */}
                        <line x1="0" y1="20" x2="420" y2="20" stroke="var(--border)" strokeDasharray="3,3" />
                        <line x1="0" y1="100" x2="420" y2="100" stroke="var(--border)" strokeDasharray="3,3" />
                        <line x1="0" y1="180" x2="420" y2="180" stroke="var(--border)" strokeDasharray="3,3" />

                        {/* Quiz Bounding Highlight Box */}
                        <rect
                          x={currentQuizLevel.highlightIndex * 58 + 25}
                          y="15"
                          width={currentQuizLevel.correctAnswer.includes('Engulfing') || currentQuizLevel.correctAnswer.includes('Star') && currentQuizLevel.id === 5 ? "110" : "55"}
                          height="170"
                          fill="rgba(234,179,8,0.06)"
                          stroke="#eab308"
                          strokeDasharray="4,4"
                          strokeWidth="1.5"
                          className="animate-pulse"
                        />

                        {/* Draw candles */}
                        {currentQuizLevel.candles.map((c, idx) => {
                          const x = idx * 58 + 35;
                          const scale = (val: number) => 180 - (val - 70) * 1.6;

                          const openY = scale(c.open);
                          const closeY = scale(c.close);
                          const highY = scale(c.high);
                          const lowY = scale(c.low);

                          const bodyY = Math.min(openY, closeY);
                          const bodyHeight = Math.max(Math.abs(openY - closeY), 3);
                          const color = c.isBull ? '#22c55e' : '#ef4444';

                          return (
                            <g key={idx}>
                              <line x1={x + 12} y1={highY} x2={x + 12} y2={lowY} stroke={color} strokeWidth="2.2" />
                              <rect x={x} y={bodyY} width="24" height={bodyHeight} fill={color} stroke={color} strokeWidth="1" rx="1" />
                              {c.label && (
                                <text x={x + 12} y={highY - 8} textAnchor="middle" fill="var(--text-muted)" className="text-[8px] font-mono font-bold uppercase">
                                  {c.label}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Question option box */}
                    <div className="space-y-4 text-left">
                      {/* Part 1: Identify Pattern Name */}
                      {(paQuizState === 'unanswered' || paQuizState === 'part1_wrong') && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-text-primary tracking-wide">
                            {currentQuizLevel.question}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentQuizLevel.options.map(opt => {
                              const isSelected = selectedPaOption === opt;
                              const isWrong = paQuizState === 'part1_wrong' && isSelected;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleQuizAnswer(opt)}
                                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] border ${
                                    isWrong
                                      ? 'bg-red-950/20 border-red-500/50 text-red-500'
                                      : isSelected 
                                        ? 'bg-bg-input border-brand-green text-brand-green' 
                                        : 'bg-bg-input border-border-theme text-text-secondary hover:border-brand-green/40'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          
                          {paQuizState === 'part1_wrong' && (
                            <div className="text-[10px] font-bold text-red-400 mt-2 flex items-center gap-1.5 animate-fade-in">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Incorrect! Click another option to try again. Think about the wicks and body height limits.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Part 2: Bias implication */}
                      {(paQuizState === 'part1_correct' || paQuizState === 'part2_wrong') && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-black uppercase mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Part 1 Correct: {currentQuizLevel.correctAnswer}</span>
                          </div>
                          <h4 className="text-xs font-black uppercase text-text-primary tracking-wide">
                            {currentQuizLevel.question2}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentQuizLevel.options2.map(opt => {
                              const isSelected = selectedPaOption === opt;
                              const isWrong = paQuizState === 'part2_wrong' && isSelected;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleQuizAnswerPart2(opt)}
                                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] border ${
                                    isWrong
                                      ? 'bg-red-950/20 border-red-500/50 text-red-500'
                                      : isSelected 
                                        ? 'bg-bg-input border-brand-green text-brand-green' 
                                        : 'bg-bg-input border-border-theme text-text-secondary hover:border-brand-green/40'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {paQuizState === 'part2_wrong' && (
                            <div className="text-[10px] font-bold text-red-400 mt-2 flex items-center gap-1.5 animate-fade-in">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Incorrect! Click another option. Consider if this pattern represents buyers stepping in at support or sellers taking back the high.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Part 2 Correct / Complete Level feedback */}
                      {paQuizState === 'part2_correct' && (
                        <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4 space-y-3 animate-fade-in">
                          <div className="flex items-center gap-2 text-green-400 text-xs font-black uppercase">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                            <span>Level Complete! +50 Points</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {currentQuizLevel.description}
                          </p>
                          <button
                            onClick={handleNextQuizLevel}
                            className="w-full bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
                          >
                            <span>Continue to Level {paQuizLevelIdx + 2}</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* QUIZ END / FAILED SUMMARY SCREEN */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 my-auto">
                  {paQuizHearts <= 0 ? (
                    <>
                      <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-full text-red-500 animate-bounce">
                        <ShieldAlert className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase text-red-500 font-sans">Game Over</h3>
                        <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                          You ran out of lives! Review our Candle Builder Lab to practice body heights and wick rejections.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-brand-green/15 border border-brand-green/30 rounded-full text-brand-green animate-pulse">
                        <Award className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase text-brand-green font-sans font-black">PA Quiz Conquered!</h3>
                        <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                          Fantastic! You successfully completed all {QUIZ_LEVELS.length} levels and scored **{paQuizScore}** price action points.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <button onClick={restartPaQuiz} className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider">
                      Restart Quiz
                    </button>
                    <button onClick={() => setPaSubMode('dashboard')} className="bg-bg-input border border-border-theme hover:border-border-hover px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider">
                      Exit to Menu
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Footer exit */}
              <div className="p-3 border-t border-border-theme text-center bg-bg-secondary/20 select-none">
                <button
                  onClick={() => setPaSubMode('dashboard')}
                  className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                >
                  Return to Price Action Select Menu
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
