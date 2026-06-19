// src/components/HomeDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, BookOpen, AlertTriangle, 
  RotateCcw, ShieldCheck, PenTool,
  Calendar, Zap, Sparkles, Globe, Target, ShieldAlert, Percent, Brain, Coffee
} from 'lucide-react';

interface HomeDashboardProps {
  currentUser: { id?: string; username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string; } | null;
  onOpenJournal: () => void;
  onOpenAuth: () => void;
}

const TRADING_QUOTES = [
  { text: "The goal of a successful trader is to make the best trades. Money is secondary.", author: "Alexander Elder" },
  { text: "Without discipline, a clear strategy is just a wish.", author: "Anonymous" },
  { text: "Don't focus on making money; focus on protecting what you have.", author: "Paul Tudor Jones" },
  { text: "The market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "Losers average losers. Cut your losses and let your winners run.", author: "Paul Tudor Jones" },
  { text: "You don't need to be right all the time. You just need to keep your losses small.", author: "George Soros" },
  { text: "Consistency is not about never making mistakes. It is about never violating your rules.", author: "Mark Douglas" }
];

interface PlanData {
  bias: 'bullish' | 'bearish' | 'range' | '';
  zones: string;
  maxRisk: string;
  notes: string;
  dateString: string;
  committed: boolean;
}

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'news', category: 'Market Context', title: 'Check News', text: 'No high-impact news (CPI, NFP) within 2 hours.', icon: Globe },
  { id: 'rules_fit', category: 'Market Context', title: 'Valid Setup', text: 'Setup matches my trading playbook perfectly.', icon: Target },
  { id: 'risk_invalid', category: 'Risk Management', title: 'Stop Loss Set', text: 'I know exactly where my trade is wrong.', icon: ShieldAlert },
  { id: 'risk_percent', category: 'Risk Management', title: 'Risk Limit', text: 'Risking only 0.5% - 1.0% of my capital.', icon: Percent },
  { id: 'psych_fomo', category: 'Psychology', title: 'No FOMO', text: 'Price is in my zone. I am not chasing.', icon: Brain },
  { id: 'psych_calm', category: 'Psychology', title: 'Calm Mind', text: 'I am calm, focused, and not revenge-trading.', icon: Coffee },
];

export default function HomeDashboard({ currentUser, onOpenJournal, onOpenAuth }: HomeDashboardProps) {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<PlanData>({
    bias: '',
    zones: '',
    maxRisk: '1.0%',
    notes: '',
    dateString: '',
    committed: false
  });
  const [todayDateString, setTodayDateString] = useState(() => new Date().toISOString().split('T')[0]);
  const usernameKey = currentUser?.username || 'guest';

  // Keep todayDateString updated in real time (e.g. overnight or waking from sleep)
  useEffect(() => {
    const checkDate = () => {
      if (typeof window === 'undefined') return;
      const currentDate = new Date().toISOString().split('T')[0];
      if (currentDate !== todayDateString) {
        setTodayDateString(currentDate);
      }
    };
    
    // Check when window gets focused/resumed from sleep
    window.addEventListener('focus', checkDate);
    // Periodically check every 10 seconds
    const interval = setInterval(checkDate, 10000);
    
    return () => {
      window.removeEventListener('focus', checkDate);
      clearInterval(interval);
    };
  }, [todayDateString]);

  // Load quote and state on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    // Select quote of the day based on day of month
    const day = new Date().getDate();
    setQuote(TRADING_QUOTES[day % TRADING_QUOTES.length]);

    // Load checklist
    const savedChecklist = localStorage.getItem(`propnepal_checklist_${usernameKey}_${todayDateString}`);
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch {
        setChecklist({});
      }
    } else {
      setChecklist({});
    }

    // Load daily plan
    const savedPlan = localStorage.getItem(`propnepal_plan_${usernameKey}_${todayDateString}`);
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch {
        // Fallback
        setPlan({
          bias: '',
          zones: '',
          maxRisk: '1.0%',
          notes: '',
          dateString: todayDateString,
          committed: false
        });
      }
    } else {
      setPlan({
        bias: '',
        zones: '',
        maxRisk: '1.0%',
        notes: '',
        dateString: todayDateString,
        committed: false
      });
    }
  }, [usernameKey, todayDateString]);

  // Handle checklist toggles
  const handleToggleChecklist = (id: string) => {
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    localStorage.setItem(`propnepal_checklist_${usernameKey}_${todayDateString}`, JSON.stringify(next));
  };

  const handleResetChecklist = () => {
    if (confirm('Reset checklist items?')) {
      setChecklist({});
      localStorage.removeItem(`propnepal_checklist_${usernameKey}_${todayDateString}`);
    }
  };

  // Handle plan commits
  const handleCommitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.loggedIn) {
      onOpenAuth();
      return;
    }
    const updatedPlan = { ...plan, committed: true, dateString: todayDateString };
    setPlan(updatedPlan);
    localStorage.setItem(`propnepal_plan_${usernameKey}_${todayDateString}`, JSON.stringify(updatedPlan));
  };

  const handleEditPlan = () => {
    const updatedPlan = { ...plan, committed: false };
    setPlan(updatedPlan);
    localStorage.setItem(`propnepal_plan_${usernameKey}_${todayDateString}`, JSON.stringify(updatedPlan));
  };

  // Checklist counts
  const totalItems = DEFAULT_CHECKLIST_ITEMS.length;
  const checkedItemsCount = DEFAULT_CHECKLIST_ITEMS.filter(item => checklist[item.id]).length;
  const progressPercent = Math.round((checkedItemsCount / totalItems) * 100);
  const checklistComplete = checkedItemsCount === totalItems;

  // Time based greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      
      {/* ── Welcome & Greeting Header ── */}
      <div 
        className="rounded-2xl p-6 relative overflow-hidden border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Background gradient blur */}
        <div 
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-green" />
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                {formattedDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              {getGreeting()},{' '}
              <span className="text-brand-green">
                {currentUser?.loggedIn ? currentUser.username : 'Disciplined Trader'}
              </span>
            </h1>
            <p className="text-xs max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Welcome to your workspace. True edge lies not in predicting market direction, but in consistency, emotional control, and strict risk adherence.
            </p>
          </div>

          <div className="flex-shrink-0 bg-bg-secondary border border-border-theme p-3 rounded-xl flex items-center gap-3 max-w-xs text-left">
            <div className="bg-brand-green-light p-2.5 rounded-lg text-brand-green">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[9px] font-black text-text-muted uppercase tracking-wider">Today&apos;s Focus Code</div>
              <div className="text-xs font-bold text-text-primary">Discipline & Consistency</div>
              <div className="text-[9px] text-text-secondary">Commit to your checklist before trading.</div>
            </div>
          </div>
        </div>

        {/* Motivational quote footer */}
        {quote.text && (
          <div className="border-t border-border-theme/40 mt-4 pt-3 text-left">
            <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-[10px] font-bold mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
              &mdash; {quote.author}
            </p>
          </div>
        )}
      </div>

      {/* ── Main Planner / execution Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Pre-Trade Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="t-card p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border-theme pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-1">
                <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Pre-Trade Checklist
                </h2>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Verify boundary criteria. Run these checks prior to pressing execution.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-black text-brand-green">{progressPercent}%</div>
                  <div className="text-[8px] text-text-muted font-bold uppercase tracking-widest">{checkedItemsCount}/{totalItems} Checked</div>
                </div>
                {checkedItemsCount > 0 && (
                  <button 
                    onClick={handleResetChecklist}
                    className="p-1.5 rounded bg-bg-secondary border border-border-theme text-text-muted hover:text-text-primary hover:border-border-hover transition-all"
                    title="Reset Checklist"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Checklist progress bar */}
            <div className="w-full bg-bg-secondary h-2 rounded-full overflow-hidden border border-border-theme/40">
              <div 
                className="h-full bg-brand-green transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items by category */}
            <div className="space-y-4 pt-2">
              {['Market Context', 'Risk Management', 'Psychology'].map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-border-theme/30 pb-1">
                    {category}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DEFAULT_CHECKLIST_ITEMS.filter(i => i.category === category).map((item) => {
                      const isChecked = !!checklist[item.id];
                      return (
                        <div 
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            isChecked 
                              ? 'bg-brand-green/10 border-brand-green/30 text-text-primary shadow-sm shadow-brand-green/5' 
                              : 'bg-bg-secondary border-border-theme/40 text-text-secondary hover:border-border-hover hover:bg-bg-hover'
                          }`}
                        >
                          {/* Checkbox / Status Indicator */}
                          <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md border transition-colors ${
                            isChecked ? 'bg-brand-green border-brand-green text-black' : 'bg-bg-input border-border-theme text-transparent'
                          }`}>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                          
                          {/* Icon & Text Content */}
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <item.icon className={`h-3.5 w-3.5 ${isChecked ? 'text-brand-green' : 'text-text-muted'}`} />
                              <span className={`text-xs font-black tracking-wide ${isChecked ? 'text-brand-green' : 'text-text-primary'}`}>
                                {item.title}
                              </span>
                            </div>
                            <span className="text-[10px] leading-snug opacity-80">{item.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Verification approval banner */}
            {checklistComplete ? (
              <div className="rounded-xl border p-4 bg-brand-green-light/20 border-brand-green/35 text-center space-y-2 animate-pulse glow-green">
                <div className="inline-flex items-center gap-1 text-[10px] font-black text-brand-green uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  Boundary Cleared
                </div>
                <p className="text-xs text-text-primary font-bold">
                  All checks satisfied. Execute trade strictly following your strategy. Manage the risk.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-theme bg-bg-secondary/40 p-4 text-center text-text-muted space-y-1">
                <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-text-muted">
                  <AlertTriangle className="h-3.5 w-3.5 text-text-muted" />
                  Pending Execution Clearance
                </div>
                <p className="text-[11px]">
                  Complete all {totalItems - checkedItemsCount} remaining checks above to clear execution parameters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Daily Trading Plan & Log CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Trading Contract / Plan */}
          <div className="t-card p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border-theme pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-1">
                <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Daily Trading Plan
                </h2>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  Your rules for today. Written in stone.
                </p>
              </div>
              {plan.committed && (
                <span className="live-badge font-bold uppercase tracking-wider">
                  Plan Locked
                </span>
              )}
            </div>

            {plan.committed ? (
              /* COMMITTED VIEW (Contract Presentation) */
              <div className="space-y-4">
                <div className="rounded-xl bg-bg-secondary border border-border-theme p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-green-light opacity-10 pointer-events-none blur-xl" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Market Bias</span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      plan.bias === 'bullish' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' :
                      plan.bias === 'bearish' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-bg-hover text-text-secondary border border-border-theme'
                    }`}>
                      {plan.bias || 'Neutral'}
                    </span>
                  </div>

                  {/* Focus execution zones removed */}

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Daily Risk Boundary</span>
                    <span className="text-xs font-bold font-mono text-red-500">{plan.maxRisk} of Account</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Rules & Action Guidelines</span>
                    <p className="text-xs font-medium text-text-secondary leading-relaxed bg-bg-input/60 p-2 rounded-lg border border-border-theme/35 whitespace-pre-wrap">
                      {plan.notes || 'No custom rules documented for today.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleEditPlan}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-theme bg-bg-card hover:bg-bg-hover py-2 text-xs font-bold text-text-secondary uppercase tracking-wider transition-all"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    Modify Contract
                  </button>
                </div>
              </div>
            ) : (
              /* INPUT FORM */
              <form onSubmit={handleCommitPlan} className="space-y-4">
                {/* Bias selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Daily Market Bias</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'bullish', label: 'Bullish 🐂', color: 'border-brand-green/20 text-brand-green', activeBg: 'rgba(22,163,74,0.12)', activeBorder: 'rgba(22,163,74,0.5)' },
                      { id: 'bearish', label: 'Bearish 🐻', color: 'border-red-500/20 text-red-500', activeBg: 'rgba(239,68,68,0.12)', activeBorder: 'rgba(239,68,68,0.5)' },
                      { id: 'range',   label: 'Neutral 🔄', color: 'border-border-theme text-text-secondary', activeBg: 'var(--bg-hover)', activeBorder: 'var(--border-hover)' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPlan(p => ({ ...p, bias: b.id as PlanData['bias'] }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all duration-200 select-none ${
                          plan.bias === b.id 
                            ? 'scale-[1.03]' 
                            : 'bg-bg-secondary opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: plan.bias === b.id ? b.activeBg : 'var(--bg-secondary)',
                          borderColor: plan.bias === b.id ? b.activeBorder : 'var(--border)',
                          color: plan.bias === b.id ? undefined : 'var(--text-secondary)'
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Support/Resistance zones input removed */}

                {/* Max risk limit */}
                <div className="space-y-1.5">
                  <label htmlFor="plan-risk" className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Max Risk / Loss Cap</label>
                  <select
                    id="plan-risk"
                    value={plan.maxRisk}
                    onChange={e => setPlan(p => ({ ...p, maxRisk: e.target.value }))}
                    className="t-input w-full py-2 px-3 text-xs"
                  >
                    <option value="0.25%">0.25% Account Risk</option>
                    <option value="0.5%">0.50% Account Risk</option>
                    <option value="1.0%">1.00% Account Risk</option>
                    <option value="1.5%">1.50% Account Risk</option>
                    <option value="2.0%">2.00% Account Risk</option>
                  </select>
                </div>

                {/* Execution rules */}
                <div className="space-y-1.5">
                  <label htmlFor="plan-rules" className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Specific Rule Guidelines</label>
                  <textarea
                    id="plan-rules"
                    rows={3}
                    placeholder="e.g. Max 2 trades today. Stop trading if down 1.0%. Do not trade CPI news release window. Keep stops tight."
                    value={plan.notes}
                    onChange={e => setPlan(p => ({ ...p, notes: e.target.value }))}
                    className="t-input w-full py-2 px-3 text-xs resize-none"
                    required
                  />
                </div>

                {/* Commit button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-green hover:bg-brand-green/90 py-2.5 text-xs font-black text-black uppercase tracking-wider transition-all glow-accent"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Commit to Contract
                </button>
              </form>
            )}
          </div>

          {/* Quick Journal Logger CTA Card */}
          <div 
            className="rounded-2xl p-5 relative overflow-hidden border text-left flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-purple-500/10 pointer-events-none blur-2xl" />
            
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <BookOpen className="h-3 w-3" />
                Journal Logbook
              </div>
              <h3 className="text-sm font-black text-text-primary">Record Executions</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Log entries with session tags, emotion wicks, and chart attachments. Cultivate data patterns that feed back into your playbook.
              </p>
            </div>

            <button
              onClick={currentUser?.loggedIn ? onOpenJournal : onOpenAuth}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-400 transition-all hover:scale-[1.02]"
            >
              <Zap className="h-3.5 w-3.5" />
              Start Trading Journal →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
