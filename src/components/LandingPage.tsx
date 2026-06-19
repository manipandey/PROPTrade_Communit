// src/components/LandingPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Star, Target, CheckCircle2,
  ArrowRight, Zap, ChevronDown, Shield,
  GraduationCap, Map, Wrench, ChevronRight, Smile,
  Frown, Meh, MessageSquare, Users, Globe, Layers,
  PieChart, Calculator, Lightbulb, Award, Sun, Moon
} from 'lucide-react';
import StreakSimulator from '@/components/StreakSimulator';


interface LandingPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onEnterApp: () => void;
}

/* ─── Typewriter ─── */
function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDeleting(false);
      setWordIdx(i => (i + 1) % words.length);
      /* eslint-enable react-hooks/set-state-in-effect */
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ─── Scroll reveal ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

/* ─── Counter ─── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);
  return { count, ref };
}

/* ─── Mock journal entry (interactive demo) ─── */
const DEMO_EMOTIONS = [
  { label: 'Calm',       icon: Smile,  color: '#22c55e', value: 'calm' },
  { label: 'Neutral',    icon: Meh,    color: '#94a3b8', value: 'neutral' },
  { label: 'Anxious',    icon: Frown,  color: '#f59e0b', value: 'anxious' },
];

const DEMO_SETUPS = ['FVG Fill', 'Liquidity Sweep', 'Order Block', 'Supply Zone'];

/* ─── Feature tabs ─── */
const FEATURE_TABS = [
  {
    id: 'journal',
    label: 'Trading Journal',
    icon: BookOpen,
    color: '#22c55e',
    headline: 'Log Every Trade. Spot Every Pattern.',
    body: 'Record entries with emotion tags, session types, screenshots and custom notes. Your data tells the story your chart can\'t.',
    bullets: [
      'Emotion-tagged trade entries (calm, FOMO, revenge)',
      'Session analytics — Asian, London, New York',
      'Photo upload for chart screenshots',
      'Public or private journal with community feedback',
    ],
  },
  {
    id: 'reviews',
    label: 'Prop Firm Reviews',
    icon: Shield,
    color: '#3b82f6',
    headline: 'Choose the Right Firm. First Time.',
    body: 'Unbiased, Nepal-specific reviews of FTMO, FundedNext and The 5%ers — covering drawdown rules, payout channels and local support.',
    bullets: [
      'Balance-based vs equity-based drawdown explained',
      'eSewa & bank transfer payout compatibility',
      'Side-by-side rule comparison table',
      'Community rating from Nepalese traders',
    ],
  },
  {
    id: 'roadmap',
    label: 'Trader Roadmap',
    icon: Map,
    color: '#8b5cf6',
    headline: 'A Clear Path from Zero to Funded.',
    body: 'Follow a structured, stage-based roadmap designed for Nepalese prop traders — from learning basics to scaling a $200K funded account.',
    bullets: [
      '6-stage progression: Foundation → Funded → Scale',
      'Milestone checklists for each evaluation phase',
      'Risk management benchmarks per stage',
      'Community badge system for accountability',
    ],
  },
  {
    id: 'tools',
    label: 'Trading Tools',
    icon: Wrench,
    color: '#ec4899',
    headline: 'Calculate. Protect. Execute.',
    body: 'Built-in calculators and risk tools specifically tuned for prop firm evaluation accounts.',
    bullets: [
      'Position size calculator with lot precision',
      'Drawdown tracker with daily limit warnings',
      'Risk-to-Reward ratio analyzer',
      'Prop firm rule compliance checker',
    ],
  },
  {
    id: 'learning',
    label: 'Learning Hub',
    icon: GraduationCap,
    color: '#f59e0b',
    headline: 'Learn Smart Money. Pass Evaluations.',
    body: 'Structured courses from beginner to advanced — covering SMC, FVG fills, liquidity sweeps and evaluation-specific strategies.',
    bullets: [
      'Free academy: 3 curriculum modules',
      'Trading style quiz to find your strategy fit',
      'Premium strategies via eSewa subscription',
      'Lesson media: charts, videos, annotated examples',
    ],
  },
];

/* ─── Review cards (static, trustworthy feel) ─── */
const REVIEWS = [
  { firm: 'FTMO', rating: 4.8, tag: 'Best Consistency Rules', color: '#22c55e', icon: '🏆' },
  { firm: 'FundedNext', rating: 4.7, tag: 'Best for Nepal eSewa', color: '#3b82f6', icon: '⚡' },
  { firm: 'The 5%ers', rating: 4.6, tag: 'Best Scaling Program', color: '#8b5cf6', icon: '🚀' },
];

/* ─── Floating particles ─── */
function FloatingParticles() {
  interface Particle {
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    opacity: number;
  }

  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const list = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 5,
      opacity: 0.08 + Math.random() * 0.12,
    }));
    /* eslint-disable react-hooks/set-state-in-effect */
    setParticles(list);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-brand-green"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Interactive Journal Demo ─── */
function JournalDemo() {
  const [emotion, setEmotion] = useState('calm');
  const [setup, setSetup] = useState('FVG Fill');
  const [pnl] = useState('+$342');
  const [note, setNote] = useState('Waited for the London sweep, entered on FVG retest. Clean R:R.');

  const emotionData = DEMO_EMOTIONS.find(e => e.value === emotion)!;
  const EmotionIcon = emotionData.icon;

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-2xl"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
          Trading Journal — New Entry
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Trade info row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Asset', value: 'XAUUSD', mono: true },
            { label: 'Direction', value: 'BUY ↑', color: '#22c55e' },
            { label: 'P&L', value: pnl, color: '#22c55e' },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-3 text-center border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div className={`text-sm font-black ${item.mono ? 'font-mono' : ''}`} style={{ color: item.color || 'var(--text-primary)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Emotion selector */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>How did you feel?</div>
          <div className="flex gap-2">
            {DEMO_EMOTIONS.map(e => {
              const Icon = e.icon;
              const active = emotion === e.value;
              return (
                <button
                  key={e.value}
                  onClick={() => setEmotion(e.value)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-200 border"
                  style={{
                    backgroundColor: active ? `${e.color}18` : 'var(--bg-secondary)',
                    borderColor: active ? `${e.color}50` : 'var(--border)',
                    color: active ? e.color : 'var(--text-secondary)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Setup picker */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Setup Type</div>
          <div className="flex flex-wrap gap-2">
            {DEMO_SETUPS.map(s => (
              <button
                key={s}
                onClick={() => setSetup(s)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 border"
                style={{
                  backgroundColor: setup === s ? 'rgba(22,163,74,0.12)' : 'var(--bg-secondary)',
                  borderColor: setup === s ? 'rgba(22,163,74,0.4)' : 'var(--border)',
                  color: setup === s ? '#22c55e' : 'var(--text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Trade Notes</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg px-3 py-2 text-xs resize-none focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <EmotionIcon className="h-3.5 w-3.5" style={{ color: emotionData.color }} />
            <span style={{ color: emotionData.color }}>{emotionData.label}</span>
            <span>·</span>
            <span>{setup}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#22c55e', border: '1px solid rgba(22,163,74,0.2)' }}>
            <CheckCircle2 className="h-3 w-3" />
            Log Trade
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tools mini-demo ─── */
function ToolsDemo() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [sl, setSl] = useState(15);

  const riskAmt = (balance * riskPct) / 100;
  const lotSize = riskAmt / (sl * 10);

  return (
    <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
          Position Size Calculator
        </span>
      </div>
      <div className="p-5 space-y-5">
        {[
          { label: 'Account Balance ($)', value: balance, setter: setBalance, min: 1000, max: 200000, step: 500 },
          { label: 'Risk Per Trade (%)', value: riskPct, setter: setRiskPct, min: 0.1, max: 3, step: 0.1 },
          { label: 'Stop Loss (pips)', value: sl, setter: setSl, min: 5, max: 100, step: 1 },
        ].map(field => (
          <div key={field.label}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{field.label}</span>
              <span className="text-xs font-black font-mono" style={{ color: 'var(--text-primary)' }}>
                {typeof field.value === 'number' && field.label.includes('%') ? field.value.toFixed(1) : field.value.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={field.min} max={field.max} step={field.step}
              value={field.value}
              onChange={e => field.setter(parseFloat(e.target.value))}
              className="w-full accent-green-500 h-1.5 rounded-full"
            />
          </div>
        ))}

        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'rgba(22,163,74,0.06)', borderColor: 'rgba(22,163,74,0.2)' }}>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Recommended Lot Size</div>
          <div className="text-3xl font-black text-brand-green">{lotSize.toFixed(2)}</div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Risk: <strong style={{ color: '#22c55e' }}>${riskAmt.toFixed(0)}</strong> · SL: {sl} pips
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SMC Candlestick Trainer Game ─── */
const SMC_TASKS = [
  {
    id: 'sweep',
    label: 'Liquidity Sweep',
    instruction: 'Click the Liquidity Sweep: Look for the long lower wick that spiked below previous support to hunt stop-losses before reversing.',
    targetIndex: 1,
    explanation: 'Perfect! That long wick grabbed retail sell-stops resting below the previous low, providing liquidity for institutional buy orders.',
  },
  {
    id: 'ob',
    label: 'Order Block (OB)',
    instruction: 'Click the Order Block (OB): Identify the final bearish down-candle before the explosive upward expansion.',
    targetIndex: 2,
    explanation: 'Spot on! This bearish candle is the Order Block. Banks accumulated buy limits here, creating a high-probability demand zone for retests.',
  },
  {
    id: 'fvg',
    label: 'Fair Value Gap (FVG)',
    instruction: 'Click the Fair Value Gap (FVG): Find the middle candle showing a large displacement/imbalance gap between Candle 1\'s high and Candle 3\'s low.',
    targetIndex: 3,
    explanation: 'Excellent! The imbalance between Candle 2\'s high and Candle 4\'s low forms a Fair Value Gap. Price is highly likely to pull back and fill this gap.',
  },
  {
    id: 'bos',
    label: 'Break of Structure (BOS)',
    instruction: 'Click the Break of Structure (BOS): Find the level where the expansion candle broke above the previous major swing high.',
    targetIndex: 5,
    explanation: 'Awesome! Breaking above the swing high confirms a bullish Break of Structure (BOS), indicating the start of a strong trend.',
  },
];

function SMCTrainer() {
  const [taskIndex, setTaskIndex] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string }>({ isCorrect: null, text: '' });
  const [solved, setSolved] = useState<string[]>([]);

  const currentTask = SMC_TASKS[taskIndex];

  const handleZoneClick = (zone: string) => {
    if (solved.includes(currentTask.id)) return;

    if (zone === currentTask.id) {
      setFeedback({
        isCorrect: true,
        text: currentTask.explanation,
      });
      if (!solved.includes(zone)) {
        setSolved([...solved, zone]);
      }
    } else {
      let hint = "That's not correct. Look closer!";
      if (zone === 'sweep') hint = "That's the Liquidity Sweep wick. Check the description for " + currentTask.label + ".";
      if (zone === 'ob') hint = "That's the Order Block (bearish candle before impulse). Check the description for " + currentTask.label + ".";
      if (zone === 'fvg') hint = "That's the Fair Value Gap imbalance space. Check the description for " + currentTask.label + ".";
      if (zone === 'bos') hint = "That's the Break of Structure level. Check the description for " + currentTask.label + ".";
      setFeedback({
        isCorrect: false,
        text: hint,
      });
    }
  };

  const handleNext = () => {
    setFeedback({ isCorrect: null, text: '' });
    setTaskIndex((prev) => (prev + 1) % SMC_TASKS.length);
  };

  const resetGame = () => {
    setTaskIndex(0);
    setSolved([]);
    setFeedback({ isCorrect: null, text: '' });
  };

  return (
    <div className="rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>
            SMC Pattern Identification Game
          </span>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-green/10 text-brand-green">
          Solved: {solved.length}/{SMC_TASKS.length}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Game instructions */}
        <div className="rounded-xl border p-4 transition-all duration-300"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="text-[9px] font-extrabold uppercase tracking-widest text-brand-green mb-1">
            Current Task
          </div>
          <div className="text-xs font-bold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {currentTask.instruction}
          </div>
        </div>

        {/* SVG CANDLESTICK CHART */}
        <div className="relative rounded-xl border p-3 flex justify-center items-center bg-black/40 overflow-hidden"
          style={{ borderColor: 'var(--border)' }}>
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-[0.03]">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border-b border-r border-white" />
            ))}
          </div>

          <svg viewBox="0 0 440 280" className="w-full h-auto select-none" style={{ maxWidth: '100%' }}>
            {/* Draw BOS Reference Line if solved */}
            {(solved.includes('bos') || taskIndex === 3) && (
              <g>
                <line x1="40" y1="130" x2="350" y2="130" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                <text x="50" y="122" fill="#3b82f6" className="text-[9px] font-bold tracking-widest uppercase">
                  Previous Swing High
                </text>
              </g>
            )}

            {/* FVG Highlight Area if solved */}
            {(solved.includes('fvg') || taskIndex === 2) && (
              <g className="animate-pulse">
                {/* Imbalance is between Candle 2's high (y=210) and Candle 4's low (y=165) */}
                <rect x="180" y="165" width="105" height="45" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" strokeDasharray="2 2" />
                <text x="210" y="190" fill="#f59e0b" className="text-[9px] font-extrabold tracking-widest uppercase">
                  FVG Imbalance
                </text>
              </g>
            )}

            {/* Candle 0: Swing High (Red) */}
            <g>
              <line x1="60" y1="110" x2="60" y2="170" stroke="#ef4444" strokeWidth="1.5" />
              <rect x="51" y="130" width="18" height="30" fill="#ef4444" rx="2" />
            </g>

            {/* Candle 1: Liquidity Sweep Candle (Red, long wick) */}
            <g className="cursor-pointer group" onClick={() => handleZoneClick('sweep')} onMouseEnter={() => setHovered('sweep')} onMouseLeave={() => setHovered(null)}>
              {/* Highlight sweep area */}
              <rect x="95" y="195" width="30" height="75" fill={hovered === 'sweep' || solved.includes('sweep') ? 'rgba(34, 197, 94, 0.06)' : 'transparent'} className="transition-all" />
              <line x1="110" y1="160" x2="110" y2="265" stroke={hovered === 'sweep' || solved.includes('sweep') ? '#22c55e' : '#ef4444'} strokeWidth={hovered === 'sweep' || solved.includes('sweep') ? '3' : '1.5'} className="transition-all" />
              <rect x="101" y="180" width="18" height="30" fill="#ef4444" rx="2" />
              {/* Label */}
              {solved.includes('sweep') && (
                <text x="125" y="255" fill="#22c55e" className="text-[8px] font-bold uppercase">Sweep Wick</text>
              )}
            </g>

            {/* Candle 2: Order Block Candle (Red, Demand Zone) */}
            <g className="cursor-pointer" onClick={() => handleZoneClick('ob')} onMouseEnter={() => setHovered('ob')} onMouseLeave={() => setHovered(null)}>
              {/* Highlight order block area */}
              <rect x="145" y="190" width="30" height="55" fill={hovered === 'ob' || solved.includes('ob') ? 'rgba(34, 197, 94, 0.06)' : 'transparent'} className="transition-all" />
              <line x1="160" y1="195" x2="160" y2="240" stroke={hovered === 'ob' || solved.includes('ob') ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
              <rect x="151" y="210" width="18" height="25" fill="#ef4444" rx="2" stroke={solved.includes('ob') ? '#22c55e' : 'transparent'} strokeWidth="1" />
              {solved.includes('ob') && (
                <text x="120" y="200" fill="#22c55e" className="text-[8px] font-bold uppercase">Order Block</text>
              )}
            </g>

            {/* Candle 3: Large Bullish Expansion 1 (Green) */}
            <g className="cursor-pointer" onClick={() => handleZoneClick('fvg')} onMouseEnter={() => setHovered('fvg')} onMouseLeave={() => setHovered(null)}>
              {/* Highlight FVG candle */}
              <rect x="195" y="150" width="30" height="70" fill={hovered === 'fvg' || solved.includes('fvg') ? 'rgba(245, 158, 11, 0.06)' : 'transparent'} className="transition-all" />
              <line x1="210" y1="150" x2="210" y2="225" stroke="#22c55e" strokeWidth="1.5" />
              <rect x="201" y="160" width="18" height="55" fill="#22c55e" rx="2" />
            </g>

            {/* Candle 4: Bullish Expansion 2 (Green) */}
            <g>
              <line x1="260" y1="95" x2="260" y2="170" stroke="#22c55e" strokeWidth="1.5" />
              <rect x="251" y="110" width="18" height="52" fill="#22c55e" rx="2" />
            </g>

            {/* Candle 5: BOS Candle (Green) */}
            <g className="cursor-pointer" onClick={() => handleZoneClick('bos')} onMouseEnter={() => setHovered('bos')} onMouseLeave={() => setHovered(null)}>
              {/* Highlight BOS area */}
              <rect x="295" y="55" width="30" height="70" fill={hovered === 'bos' || solved.includes('bos') ? 'rgba(59, 130, 246, 0.06)' : 'transparent'} className="transition-all" />
              <line x1="310" y1="60" x2="310" y2="120" stroke={hovered === 'bos' || solved.includes('bos') ? '#3b82f6' : '#22c55e'} strokeWidth="1.5" />
              <rect x="301" y="70" width="18" height="42" fill="#22c55e" rx="2" stroke={solved.includes('bos') ? '#3b82f6' : 'transparent'} strokeWidth="1" />
              {solved.includes('bos') && (
                <text x="325" y="65" fill="#3b82f6" className="text-[8px] font-bold uppercase">BOS LEVEL</text>
              )}
            </g>

            {/* Candle 6: Retest/Consolidation (Red) */}
            <g>
              <line x1="360" y1="80" x2="360" y2="135" stroke="#ef4444" strokeWidth="1.5" />
              <rect x="351" y="90" width="18" height="30" fill="#ef4444" rx="2" />
            </g>
          </svg>
        </div>

        {/* Feedback Area */}
        {feedback.isCorrect !== null && (
          <div className="rounded-xl border p-4 transition-all duration-300"
            style={{
              backgroundColor: feedback.isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
              borderColor: feedback.isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'
            }}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-red-500/30 flex items-center justify-center text-[9px] font-bold text-red-500 bg-red-500/10">!</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: feedback.isCorrect ? '#22c55e' : '#ef4444' }}>
                  {feedback.isCorrect ? 'Correct Answer!' : 'Incorrect Identification'}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feedback.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3">
          {solved.length === SMC_TASKS.length ? (
            <button onClick={resetGame}
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              Restart Game 🔄
            </button>
          ) : (
            <>
              {feedback.isCorrect && (
                <button onClick={handleNext}
                  className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-white"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.2)' }}>
                  Next Pattern Task →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



/* ════════════════════════════════════════ MAIN ════════════════════════════════════════ */
export default function LandingPage({ theme, onToggleTheme, onOpenAuth, onEnterApp }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'journal' | 'tools' | 'smc'>('journal');

  const typewriter = useTypewriter([
    'Trading Journal.',
    'Process & Consistency.',
    'Strict Discipline.',
    'Continuous Learning.',
    'Risk Management.',
  ], 70, 2200);

  const [feat1Ref, feat1Visible] = useReveal();
  const [feat2Ref, feat2Visible] = useReveal();
  const [feat3Ref, feat3Visible] = useReveal();
  const [featStreakRef, featStreakVisible] = useReveal();
  const [ctaRevealRef, ctaRevealVisible] = useReveal(0.2);

  const traders = useCountUp(1450, 1800);
  const journals = useCountUp(8200, 2000);
  const modules  = useCountUp(12, 1200);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 80);
  }, []);

  useEffect(() => {
    const el = document.getElementById('lp-scroll');
    const handler = (e: Event) => setScrolled((e.target as HTMLElement).scrollTop > 60);
    el?.addEventListener('scroll', handler);
    return () => el?.removeEventListener('scroll', handler);
  }, []);

  const ActiveFeature = FEATURE_TABS[activeTab];
  const FeatureIcon = ActiveFeature.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── custom keyframes ── */}
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(-28px) translateX(10px); }
        }
        @keyframes hero-glow {
          0%,100% { opacity:.25; transform:scale(1); }
          50%      { opacity:.15; transform:scale(1.08); }
        }
        @keyframes slide-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fade-scale {
          from { opacity:0; transform:scale(0.96); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes blink-cursor {
          0%,100% { opacity:1; }
          50%      { opacity:0; }
        }
        .cursor { animation: blink-cursor .7s step-end infinite; }
        .slide-up { animation: slide-up .6s ease forwards; }
        .fade-scale { animation: fade-scale .5s ease forwards; }
        input[type=range]::-webkit-slider-thumb { cursor:pointer; }
      `}</style>

      {/* ════ NAVBAR ════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          padding: scrolled ? '10px 0' : '18px 0',
          backgroundColor: scrolled ? 'rgba(10,10,11,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" className="h-9 w-9 object-contain" alt="propNPL Logo" />
            <div>
              <span className="text-sm font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Prop<span className="text-brand-green">Nepal</span>
              </span>
              <div className="text-[8px] font-bold uppercase tracking-[.18em] -mt-0.5" style={{ color: 'var(--text-muted)' }}>Learn, Record, Connect</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {['Journal', 'Reviews', 'Roadmap', 'Tools'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="transition-colors hover:text-brand-green">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400 hover:scale-110 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400 hover:scale-110 transition-transform" />
              )}
            </button>
            <button onClick={onOpenAuth}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              Sign In
            </button>
            <button onClick={onOpenAuth}
              className="text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:scale-[1.04]"
              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 4px 16px rgba(22,163,74,.25)' }}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ════ SCROLLABLE BODY ════ */}
      <div id="lp-scroll" className="flex-1 overflow-y-auto">

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          <FloatingParticles />

          {/* background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(22,163,74,.35) 0%,transparent 70%)', animation: 'hero-glow 7s ease-in-out infinite' }} />
            {/* grid */}
            <div className="absolute inset-0 opacity-[.035]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
          </div>

          {/* content */}
          <div className={`relative z-10 max-w-3xl mx-auto text-center space-y-8 transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{ backgroundColor: 'rgba(22,163,74,.08)', borderColor: 'rgba(22,163,74,.22)', color: '#22c55e' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Discipline, Consistency & Scientific Journaling
            </div>

            {/* Headline + typewriter */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Your Edge Starts With<br />
              <span className="text-brand-green">
                {typewriter}
                <span className="cursor" style={{ color: '#22c55e' }}>|</span>
              </span>
            </h1>

            <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Master your psychology, track execution variables, and analyze win rates. Learn the rules, record your setups, and connect to global trading markets with elite precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={onOpenAuth}
                className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.04]"
                style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 8px 30px rgba(22,163,74,.35)' }}>
                <Zap className="h-4 w-4" />
                Start Journaling — It&apos;s Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={onEnterApp}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl border text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{ borderColor: 'var(--border-hover)', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,.02)' }}>
                <Globe className="h-4 w-4" />
                Explore as Guest
              </button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {['100% Process Focus', 'Interactive Planner', 'Risk Size Precision', 'Habit Streaks Tracker'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: 'var(--text-muted)' }}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-green" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scroll</span>
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          </div>
        </section>

        {/* ══════════════════ STATS ROW ══════════════════ */}
        <section className="py-16 px-6 border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { countObj: traders, label: 'Active Traders', suffix: '+', icon: Users, color: '#22c55e' },
              { countObj: journals, label: 'Journal Entries Logged', suffix: '+', icon: BookOpen, color: '#3b82f6' },
              { countObj: modules,  label: 'Learning Modules', suffix: '', icon: GraduationCap, color: '#f59e0b' },
            ].map(({ countObj, label, suffix, icon: Icon, color }) => (
              <div key={label} ref={countObj.ref} className="space-y-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mx-auto mb-2"
                  style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {countObj.count.toLocaleString()}{suffix}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════ INTERACTIVE FEATURE TABS ══════════════════ */}
        <section id="journal" className="py-28 px-6">
          <div ref={feat1Ref}
            className={`max-w-6xl mx-auto transition-all duration-700 ${feat1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>

            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <Layers className="h-3 w-3 text-brand-green" />
                Platform Features
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Built Around <span className="text-brand-green">Your Growth</span>
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Every tool, every module — designed to help you trust the process and stay consistent.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* Left: Tab list */}
              <div className="space-y-2">
                {FEATURE_TABS.map((tab, i) => {
                  const Icon = tab.icon;
                  const active = i === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(i)}
                      className="w-full text-left rounded-2xl border p-5 transition-all duration-300 group"
                      style={{
                        backgroundColor: active ? `${tab.color}0d` : 'var(--bg-card)',
                        borderColor: active ? `${tab.color}40` : 'var(--border)',
                        transform: active ? 'translateX(4px)' : 'translateX(0)',
                        boxShadow: active ? `0 4px 24px ${tab.color}15` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 transition-all"
                          style={{ backgroundColor: active ? `${tab.color}18` : 'var(--bg-secondary)', border: `1px solid ${active ? tab.color + '30' : 'var(--border)'}` }}>
                          <Icon className="h-5 w-5 transition-all" style={{ color: active ? tab.color : 'var(--text-muted)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold transition-colors"
                            style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {tab.label}
                          </div>
                          {active && (
                            <div className="text-[11px] mt-0.5 line-clamp-1 slide-up" style={{ color: 'var(--text-muted)' }}>
                              {tab.headline}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 transition-all"
                          style={{ color: active ? tab.color : 'var(--text-subtle)', transform: active ? 'rotate(90deg)' : 'none' }} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Feature detail */}
              <div key={activeTab} className="fade-scale space-y-5">
                <div className="rounded-2xl border p-7 space-y-5"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: `${ActiveFeature.color}25`, boxShadow: `0 8px 40px ${ActiveFeature.color}10` }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${ActiveFeature.color}15`, border: `1px solid ${ActiveFeature.color}30` }}>
                      <FeatureIcon className="h-6 w-6" style={{ color: ActiveFeature.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: ActiveFeature.color }}>
                        {ActiveFeature.label}
                      </div>
                      <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                        {ActiveFeature.headline}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {ActiveFeature.body}
                  </p>

                  <div className="space-y-2.5 pt-1">
                    {ActiveFeature.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="h-5 w-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${ActiveFeature.color}15` }}>
                          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: ActiveFeature.color }} />
                        </div>
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{b}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={onOpenAuth}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: `${ActiveFeature.color}15`, border: `1px solid ${ActiveFeature.color}30`, color: ActiveFeature.color }}>
                    Explore {ActiveFeature.label} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ INTERACTIVE DEMO SECTION ══════════════════ */}
        <section id="tools" className="py-28 px-6 relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg,transparent 0%,rgba(22,163,74,.025) 50%,transparent 100%)' }} />
          <div ref={feat2Ref}
            className={`max-w-6xl mx-auto transition-all duration-700 ${feat2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>

            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <Lightbulb className="h-3 w-3 text-amber-400" />
                Live Preview
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Try It <span className="text-brand-green">Right Now</span>
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                These are real components from the platform. Interact with them before you even register.
              </p>
            </div>

            {/* Demo tab switcher */}
            <div className="flex border rounded-xl p-1 max-w-sm mx-auto mb-10"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              {[
                { id: 'journal', label: 'Journal Entry', icon: BookOpen },
                { id: 'tools',   label: 'Lot Calculator', icon: Calculator },
                { id: 'smc',     label: 'SMC Trainer', icon: GraduationCap },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeDemo === tab.id;
                return (
                  <button key={tab.id}
                    onClick={() => setActiveDemo(tab.id as 'journal' | 'tools' | 'smc')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200"
                    style={{
                      backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                      borderColor: active ? 'var(--border)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: active ? '1px solid var(--border)' : '1px solid transparent',
                    }}>
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="max-w-xl mx-auto">
              {activeDemo === 'journal' ? <JournalDemo /> : activeDemo === 'tools' ? <ToolsDemo /> : <SMCTrainer />}
            </div>

            <p className="text-center text-[11px] mt-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
              ↑ This is a live preview. <button onClick={onOpenAuth} className="text-brand-green underline underline-offset-2">Register free</button> to unlock the full experience.
            </p>
          </div>
        </section>

        {/* ══════════════════ REVIEWS SECTION ══════════════════ */}
        <section id="reviews" className="py-28 px-6">
          <div ref={feat3Ref}
            className={`max-w-5xl mx-auto transition-all duration-700 ${feat3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>

            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <Shield className="h-3 w-3 text-blue-400" />
                Prop Firm Reviews
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Choose the Right <span className="text-brand-green">Prop Firm</span>
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                No guesswork. Unbiased community reviews tuned for Nepal — covering drawdown types, eSewa payouts and evaluation rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {REVIEWS.map((r, i) => (
                <div key={r.firm}
                  className="rounded-2xl border p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    transitionDelay: `${i * 80}ms`,
                    boxShadow: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${r.color}40`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{r.icon}</div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(r.rating) ? 'fill-amber-400 text-amber-400' : 'text-border-theme'}`} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{r.firm}</h3>
                    <div className="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: `${r.color}12`, color: r.color }}>
                      {r.tag}
                    </div>
                  </div>

                  <div className="text-3xl font-black" style={{ color: r.color }}>{r.rating}</div>

                  <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Community-verified rating from Nepalese funded traders
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison highlight */}
            <div className="rounded-2xl border p-6 grid grid-cols-1 sm:grid-cols-3 gap-6"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {[
                { icon: PieChart, label: 'Drawdown Types', desc: 'Balance-based vs equity-based — explained in plain language', color: '#22c55e' },
                { icon: MessageSquare, label: 'Nepal Payouts', desc: 'Which firms support direct eSewa & bank transfers in NPR', color: '#3b82f6' },
                { icon: Award, label: 'Rule Clarity', desc: 'No-news rules, consistency checks, overnight holding policies', color: '#f59e0b' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                      <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════ ROADMAP SECTION ══════════════════ */}
        <section id="roadmap" className="py-28 px-6 relative border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg)' }}>
                <Map className="h-3 w-3 text-violet-400" />
                Trader Roadmap
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                From Zero to <span className="text-brand-green">Funded</span> — Step by Step
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                A community-built progression path with milestones, checklists, and accountability at every stage.
              </p>
            </div>

            {/* Roadmap steps */}
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px hidden sm:block" style={{ backgroundColor: 'var(--border)' }} />

              <div className="space-y-8">
                {[
                  { num: '01', title: 'Understand the Game', body: 'Learn prop firm rules, challenge structures, and what consistency really means before risking a single dollar.', color: '#22c55e', badge: 'Foundation' },
                  { num: '02', title: 'Build Your Edge', body: 'Study SMC concepts, backtest your strategy, and define your personal risk parameters. Use our Learning Hub for structured guidance.', color: '#3b82f6', badge: 'Education' },
                  { num: '03', title: 'Journal Every Session', body: 'Log trades daily. Tag your emotions. Upload screenshots. The data you collect now will reveal patterns you can\'t see in the moment.', color: '#8b5cf6', badge: 'Discipline' },
                  { num: '04', title: 'Pass Your Evaluation', body: 'Apply your reviewed strategy. Use our tools to calculate position sizes and track daily drawdown in real time.', color: '#f59e0b', badge: 'Challenge' },
                  { num: '05', title: 'Scale & Stay Funded', body: 'Maintain consistency on your funded account, share your progress with the community, and mentor newer traders.', color: '#ec4899', badge: 'Funded' },
                ].map((step, i) => (
                  <div key={step.num} className="flex gap-6 items-start group"
                    style={{ transitionDelay: `${i * 100}ms` }}>
                    {/* dot */}
                    <div className="relative flex-shrink-0">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${step.color}12`, border: `2px solid ${step.color}30`, color: step.color }}>
                        {step.num}
                      </div>
                    </div>
                    {/* content */}
                    <div className="flex-1 pt-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${step.color}12`, color: step.color }}>{step.badge}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ STREAK SIMULATOR SECTION ══════════════════ */}
        <section id="streak-simulator" className="py-28 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <div ref={featStreakRef}
            className={`max-w-5xl mx-auto transition-all duration-700 ${featStreakVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <Zap className="h-3 w-3 text-brand-green" />
                The Power of Consistency
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Simulate Your <span className="text-brand-green">Journaling Streak</span>
              </h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Consistent traders manage drawdown better and pass evaluations faster. Interactive simulator below — click empty days to log trades and build your discipline score.
              </p>
            </div>

            <StreakSimulator />
          </div>
        </section>

        {/* ══════════════════ FINAL CTA ══════════════════ */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(22,163,74,.25) 0%,transparent 70%)', animation: 'hero-glow 8s ease-in-out infinite' }} />
          </div>

          <div ref={ctaRevealRef}
            className={`max-w-2xl mx-auto text-center space-y-7 relative z-10 transition-all duration-700 ${ctaRevealVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold"
              style={{ backgroundColor: 'rgba(22,163,74,.08)', borderColor: 'rgba(22,163,74,.22)', color: '#22c55e' }}>
              <Target className="h-3.5 w-3.5" />
              Start Your Journey Today
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Trust the Process.<br />
              <span className="text-brand-green">The Numbers Follow.</span>
            </h2>

            <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Journaling, learning, reviewing — these are the habits that separate consistently funded traders from everyone else. propNPL gives you the tools to build those habits.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={onOpenAuth}
                className="group flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.04]"
                style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 8px 40px rgba(22,163,74,.35)' }}>
                <BookOpen className="h-5 w-5" />
                Create Free Account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={onEnterApp}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                Browse without account →
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer className="border-t py-10 px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.svg" className="h-7 w-7 object-contain" alt="propNPL Logo" />
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Prop<span className="text-brand-green">Nepal</span>
              </span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              © 2026 propNPL. Learn, Record, Connect.
            </div>
            <div className="flex items-center gap-5 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {['Journal', 'Reviews', 'Roadmap', 'Tools', 'Academy'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`}
                  className="transition-colors hover:text-brand-green">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
