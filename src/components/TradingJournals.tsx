// src/components/TradingJournals.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PlusCircle, BookOpen, AlertCircle, Trash2, Brain, Star, MessageSquare, Upload, Link, Image as ImageIcon, Lock, Globe, Send, MessageCircle, X, ShieldCheck, CheckSquare, Award, Eye, AlertTriangle, HelpCircle, User } from 'lucide-react';
import { db, JournalEntry, EMOTIONS, SETUP_TYPES, Emotion, SetupType, TradeFeedback, TradingAccount, TradingSession, TRADING_SESSIONS } from '@/lib/supabase';
import { api } from '../lib/api';
import StreakSimulator from '@/components/StreakSimulator';

interface PublicJournalEntry extends JournalEntry {
  avatar: string;
  accountDetails?: {
    propFirm: string;
    type: 'Challenge' | 'Funded';
    size: number;
  };
}

interface TradingJournalsProps {
  currentUser: { id?: string; username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string; } | null;
  onOpenAuth: () => void;
}

export interface AlignmentResult {
  hasPlan: boolean;
  status: 'aligned' | 'violated' | 'no_plan';
  violations: string[];
  matches: string[];
  checklistCount: number;
  checklistComplete: boolean;
  planNotes?: string;
  planBias?: string;
  planMaxRisk?: string;
}

export const checkPlanAlignment = (
  tradeDate: string,
  direction: 'BUY' | 'SELL',
  riskPct: number | undefined,
  username: string
): AlignmentResult => {
  if (typeof window === 'undefined') {
    return {
      hasPlan: false,
      status: 'no_plan',
      violations: [],
      matches: [],
      checklistCount: 0,
      checklistComplete: false,
    };
  }

  const savedPlan = localStorage.getItem(`propnepal_plan_${username}_${tradeDate}`);
  const savedChecklist = localStorage.getItem(`propnepal_checklist_${username}_${tradeDate}`);

  let plan = null;
  if (savedPlan) {
    try {
      plan = JSON.parse(savedPlan);
    } catch {}
  }

  let checklist = null;
  if (savedChecklist) {
    try {
      checklist = JSON.parse(savedChecklist);
    } catch {}
  }

  const defaultItems = [
    { id: 'news' }, { id: 'risk_invalid' }, { id: 'risk_percent' },
    { id: 'psych_fomo' }, { id: 'psych_calm' }, { id: 'rules_fit' }
  ];
  const totalChecklistItems = defaultItems.length;
  const checkedCount = checklist ? defaultItems.filter(item => checklist[item.id]).length : 0;
  const checklistComplete = checkedCount === totalChecklistItems;

  const violations: string[] = [];
  const matches: string[] = [];

  if (!plan || !plan.committed) {
    return {
      hasPlan: false,
      status: 'no_plan',
      violations: ['No Daily Trading Plan was locked for this date.'],
      matches: [],
      checklistCount: checkedCount,
      checklistComplete,
    };
  }

  // 1. Bias match check
  if (plan.bias) {
    if (plan.bias === 'bullish' && direction === 'SELL') {
      violations.push('Traded SELL when Daily Bias was Bullish 🐂');
    } else if (plan.bias === 'bearish' && direction === 'BUY') {
      violations.push('Traded BUY when Daily Bias was Bearish 🐻');
    } else if (plan.bias === 'range') {
      matches.push('Traded Neutral/Range bias 🔄');
    } else {
      matches.push(`Traded in direction of Daily Bias (${plan.bias === 'bullish' ? 'Bullish 🐂' : 'Bearish 🐻'})`);
    }
  }

  // 2. Risk check
  if (riskPct !== undefined && !isNaN(riskPct) && plan.maxRisk) {
    const planRiskVal = parseFloat(plan.maxRisk);
    if (!isNaN(planRiskVal) && riskPct > planRiskVal) {
      violations.push(`Risked ${riskPct}% exceeding Daily Max Risk limit of ${plan.maxRisk} 🛡️`);
    } else {
      matches.push(`Risk kept under Daily Max Risk limit (${riskPct}% / ${plan.maxRisk})`);
    }
  }

  // 3. Checklist check
  if (!checklistComplete) {
    violations.push(`Pre-Trade Checklist incomplete (${checkedCount}/${totalChecklistItems} checked) 🧘`);
  } else {
    matches.push('Completed full Pre-Trade Checklist prior to trading 🧘');
  }

  const status = violations.length === 0 ? 'aligned' : 'violated';

  return {
    hasPlan: true,
    status,
    violations,
    matches,
    checklistCount: checkedCount,
    checklistComplete,
    planNotes: plan.notes,
    planBias: plan.bias,
    planMaxRisk: plan.maxRisk,
  };
};

export default function TradingJournals({ currentUser, onOpenAuth }: TradingJournalsProps) {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoggingTrade, setIsLoggingTrade] = useState(false);
  const [openAlignmentId, setOpenAlignmentId] = useState<string | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('all');
  const [selectedAccountTypeFilter, setSelectedAccountTypeFilter] = useState<'all' | 'Challenge' | 'Funded'>('all');
  const [isManagingAccounts, setIsManagingAccounts] = useState(false);

  // Validation / feedback states
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState<{ message: string; subMessage?: string } | null>(null);

  // Form state for new account
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'Challenge' | 'Funded'>('Challenge');
  const [newAccFirm, setNewAccFirm] = useState('FTMO');
  const [newAccSize, setNewAccSize] = useState('100000');

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [asset, setAsset] = useState('XAUUSD');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [lots, setLots] = useState('1.00');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('calm');
  const [setup, setSetup] = useState<SetupType>('Other');
  const [session, setSession] = useState<TradingSession>('Asian');
  const [riskPct, setRiskPct] = useState('');
  const [riskReward, setRiskReward] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newsChecked, setNewsChecked] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [riskSet, setRiskSet] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mindsetReady, setMindsetReady] = useState(false);
  const [sentiment, setSentiment] = useState<'Bullish' | 'Bearish' | 'Neutral' | null>(null);

  // Uploader / Visibility / Community Subtab States
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [journalSubTab, setJournalSubTab] = useState<'my' | 'community' | 'ai' | 'streak'>('my');
  const [journalSettings, setJournalSettings] = useState<{ isPublic: boolean }>({ isPublic: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Community view details state
  const [selectedTrade, setSelectedTrade] = useState<(JournalEntry & { avatar: string }) | null>(null);
  const [tradeFeedbacks, setTradeFeedbacks] = useState<TradeFeedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [feedbackError, setFeedbackError] = useState('');

  // AI Coach state
  const [aiChatMessages, setAiChatMessages] = useState<{role: 'user' | 'ai'; text: string}[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');

  // Load user journals dynamically
  useEffect(() => {
    const fetchJournals = async () => {
      setSelectedAccountFilter('all');
      setSelectedAccountTypeFilter('all');
      if (currentUser?.loggedIn && currentUser.id) {
        const liveJournals = await api.getJournals(currentUser.id);
        setJournals(liveJournals);
        
        // Keep these in local storage for now
        setJournalSettings(db.getJournalSettings(currentUser.username));
        const accs = db.getAccounts(currentUser.username);
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
        } else {
          setSelectedAccountId('');
        }
      } else {
        setJournals([]);
        setJournalSettings({ isPublic: false });
        setAccounts([]);
        setSelectedAccountId('');
      }
    };
    fetchJournals();
  }, [currentUser]);

  // Load public feedbacks for selected trade in community
  useEffect(() => {
    if (selectedTrade) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTradeFeedbacks(db.getTradeFeedback(selectedTrade.id));
    }
  }, [selectedTrade]);

  // Handle Drag-and-drop Image Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Image size exceeds 3MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle Visibility Settings
  const handleToggleVisibility = () => {
    if (!currentUser?.loggedIn) return;
    const nextSettings = { isPublic: !journalSettings.isPublic };
    setJournalSettings(nextSettings);
    db.saveJournalSettings(currentUser.username, nextSettings);
  };

  // Handle Trade Deletion
  const handleDeleteTrade = (id: string) => {
    if (!currentUser || !currentUser.loggedIn) return;
    if (!confirm('Are you sure you want to delete this trade entry? This cannot be undone.')) return;
    const updated = journals.filter((j) => j.id !== id);
    setJournals(updated);
    db.saveJournals(currentUser.username, updated);
  };

  // Handle Trade Submission
  const handleLogTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessToast(null);

    if (!currentUser || !currentUser.loggedIn || !currentUser.id) {
      onOpenAuth();
      return;
    }

    const isNoSetup = setup === 'No Setup';

    // Explicit validation feedback instead of silent return
    if (!isNoSetup && !asset.trim()) {
      setFormError('Please enter an Asset/Pair (e.g., XAUUSD).');
      return;
    }
    if (!isNoSetup && (!entryPrice || parseFloat(entryPrice) <= 0)) {
      setFormError('Please enter a valid Entry Price greater than 0.');
      return;
    }
    if (!isNoSetup && (!exitPrice || parseFloat(exitPrice) <= 0)) {
      setFormError('Please enter a valid Exit Price greater than 0.');
      return;
    }
    if (!isNoSetup && (!pnl || isNaN(parseFloat(pnl)))) {
      setFormError('Please enter a valid Net Profit / Loss amount.');
      return;
    }

    const newTrade: JournalEntry = {
      id: `j-${Date.now()}`,
      date,
      asset: isNoSetup ? 'NO SETUP' : asset.toUpperCase(),
      direction: isNoSetup ? 'BUY' : direction,
      lots: isNoSetup ? 0 : (parseFloat(lots) || 0.1),
      entryPrice: isNoSetup ? 0 : (parseFloat(entryPrice) || 0),
      exitPrice: isNoSetup ? 0 : (parseFloat(exitPrice) || 0),
      pnl: isNoSetup ? 0 : (parseFloat(pnl) || 0),
      notes,
      emotion,
      setup,
      author: currentUser.username,
      riskPct: isNoSetup ? undefined : (riskPct ? parseFloat(riskPct) : undefined),
      riskReward: isNoSetup ? undefined : (riskReward ? parseFloat(riskReward) : undefined),
      imageUrl: isNoSetup ? undefined : (imageUrl || undefined),
      accountId: selectedAccountId || undefined,
      session,
      newsChecked: true,
      riskSet: true,
      mindsetReady: true,
      sentiment: isNoSetup ? undefined : (sentiment || undefined)
    };

    // Save to real backend
    await api.saveJournal(currentUser.id, newTrade);

    const updatedJournals = [newTrade, ...journals];
    setJournals(updatedJournals);

    // Compute helpful filter notification if trade is hidden under current view
    let subMessage = undefined;
    if (selectedAccountFilter !== 'all' && selectedAccountId !== selectedAccountFilter) {
      const loggedAcc = accounts.find(a => a.id === selectedAccountId);
      const filteredAcc = accounts.find(a => a.id === selectedAccountFilter);
      const loggedName = loggedAcc ? loggedAcc.name : 'No Account';
      const filteredName = filteredAcc ? filteredAcc.name : 'Selected Account';
      subMessage = `Note: This position was logged to "${loggedName}". However, your active dashboard filter is set to "${filteredName}". Switch the filter dropdown to "All Accounts" or "${loggedName}" to view this entry in the table.`;
    }

    setSuccessToast({
      message: `Position for ${asset.toUpperCase()} logged successfully!`,
      subMessage
    });

    // Auto-dismiss success toast after 8 seconds
    setTimeout(() => {
      setSuccessToast(null);
    }, 8000);

    // Reset Form
    setDate(new Date().toISOString().split('T')[0]);
    setAsset('XAUUSD');
    setDirection('BUY');
    setLots('1.00');
    setEntryPrice('');
    setExitPrice('');
    setPnl('');
    setNotes('');
    setEmotion('calm');
    setSetup('Other');
    setSession('Asian');
    setRiskPct('');
    setRiskReward('');
    setImageUrl('');
    setNewsChecked(false);
    setRiskSet(false);
    setMindsetReady(false);
    setSentiment(null);
    setIsLoggingTrade(false);
  };

  // Helper to calculate P&L automatically based on lots, entry/exit price, and asset multiplier rules
  const calculateEstimatedPnl = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const lotSize = parseFloat(lots) || 0.1;
    if (isNaN(entry) || isNaN(exit)) return;

    const dirMultiplier = direction === 'BUY' ? 1 : -1;
    const cleanAsset = asset.toUpperCase().trim();
    let calculated = 0;

    if (cleanAsset.includes('XAU') || cleanAsset.includes('GOLD')) {
      // Gold: $100 per 1 lot per $1 price move
      calculated = (exit - entry) * dirMultiplier * lotSize * 100;
    } else if (cleanAsset.includes('EUR') || cleanAsset.includes('GBP') || cleanAsset.includes('USD')) {
      // Major Forex: standard lot is 100,000 units
      if (cleanAsset.includes('JPY')) {
        // USDJPY, EURJPY etc: 1 pip = 0.01 JPY, lot size 100k
        calculated = ((exit - entry) * dirMultiplier * lotSize * 100000) / exit;
      } else {
        // EURUSD, GBPUSD: 1 pip = 0.0001, lot size 100k
        calculated = (exit - entry) * dirMultiplier * lotSize * 100000;
      }
    } else if (cleanAsset.includes('NAS') || cleanAsset.includes('SPX') || cleanAsset.includes('US30') || cleanAsset.includes('GER')) {
      // Indices: standard contract sizes
      const mult = cleanAsset.includes('SPX') ? 10 : cleanAsset.includes('NAS') ? 20 : 1;
      calculated = (exit - entry) * dirMultiplier * lotSize * mult;
    } else {
      // Generic fallback
      calculated = (exit - entry) * dirMultiplier * lotSize * 100;
    }

    setPnl(calculated.toFixed(2));
    setFormError('');
  };

  // Submit Feedback / Rating / Question
  const handlePostFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.loggedIn) {
      onOpenAuth();
      return;
    }
    if (!selectedTrade) return;
    if (!newComment.trim() && selectedRating === 0) {
      setFeedbackError('Please select a rating or type a question/comment.');
      return;
    }

    const ratingArg = selectedRating > 0 ? selectedRating : undefined;
    const feedback = db.addTradeFeedback(selectedTrade.id, currentUser.username, newComment.trim(), ratingArg);
    
    setTradeFeedbacks((prev) => [...prev, feedback]);
    setNewComment('');
    setSelectedRating(0);
    setFeedbackError('');
  };

  // Aggregated Stats
  const activeJournals = useMemo(() => {
    return journals.filter(j => {
      const matchAccount = selectedAccountFilter === 'all' || j.accountId === selectedAccountFilter;
      let matchType = true;
      if (selectedAccountTypeFilter !== 'all') {
        const acc = accounts.find(a => a.id === j.accountId);
        matchType = acc?.type === selectedAccountTypeFilter;
      }
      return matchAccount && matchType;
    });
  }, [journals, selectedAccountFilter, selectedAccountTypeFilter, accounts]);

  const stats = useMemo(() => {
    if (activeJournals.length === 0) {
      return { 
        totalTrades: 0, 
        netPnl: 0, 
        winRate: 0, 
        avgWin: 0, 
        avgLoss: 0, 
        profitFactor: 0,
        bestSetup: { name: 'N/A', pnl: 0, winRate: 0 },
        worstSetup: { name: 'N/A', pnl: 0, winRate: 0 },
        toxicEmotion: { name: 'N/A', pnl: 0, winRate: 0 },
        peakEmotion: { name: 'N/A', pnl: 0, winRate: 0 }
      };
    }

    const totalTrades = activeJournals.length;
    const wins = activeJournals.filter((j) => j.pnl > 0);
    const losses = activeJournals.filter((j) => j.pnl <= 0);
    
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const netPnl = activeJournals.reduce((acc, j) => acc + j.pnl, 0);

    const totalWinVal = wins.reduce((acc, j) => acc + j.pnl, 0);
    const totalLossVal = Math.abs(losses.reduce((acc, j) => acc + j.pnl, 0));

    const avgWin = wins.length > 0 ? totalWinVal / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossVal / losses.length : 0;

    const profitFactor = totalLossVal > 0 ? totalWinVal / totalLossVal : totalWinVal > 0 ? 99.9 : 0;

    // Advanced setup & emotion analytics
    const setupStats: Record<string, { pnl: number; wins: number; total: number }> = {};
    const emotionStats: Record<string, { pnl: number; wins: number; total: number }> = {};

    activeJournals.forEach((j) => {
      const s = j.setup || 'Other';
      if (!setupStats[s]) setupStats[s] = { pnl: 0, wins: 0, total: 0 };
      setupStats[s].pnl += j.pnl;
      setupStats[s].total += 1;
      if (j.pnl > 0) setupStats[s].wins += 1;

      const em = j.emotion || 'neutral';
      if (!emotionStats[em]) emotionStats[em] = { pnl: 0, wins: 0, total: 0 };
      emotionStats[em].pnl += j.pnl;
      emotionStats[em].total += 1;
      if (j.pnl > 0) emotionStats[em].wins += 1;
    });

    let bestSetup = { name: 'None', pnl: -999999, winRate: 0 };
    let worstSetup = { name: 'None', pnl: 999999, winRate: 0 };
    let peakEmotion = { name: 'None', pnl: -999999, winRate: 0 };
    let toxicEmotion = { name: 'None', pnl: 999999, winRate: 0 };

    Object.entries(setupStats).forEach(([name, data]) => {
      const wr = Math.round((data.wins / data.total) * 100);
      if (bestSetup.name === 'None' || data.pnl > bestSetup.pnl) {
        bestSetup = { name, pnl: data.pnl, winRate: wr };
      }
      if (worstSetup.name === 'None' || data.pnl < worstSetup.pnl) {
        worstSetup = { name, pnl: data.pnl, winRate: wr };
      }
    });

    Object.entries(emotionStats).forEach(([name, data]) => {
      const wr = Math.round((data.wins / data.total) * 100);
      if (peakEmotion.name === 'None' || data.pnl > peakEmotion.pnl) {
        peakEmotion = { name, pnl: data.pnl, winRate: wr };
      }
      if (toxicEmotion.name === 'None' || data.pnl < toxicEmotion.pnl) {
        toxicEmotion = { name, pnl: data.pnl, winRate: wr };
      }
    });

    // Clean up empty edge cases
    if (bestSetup.pnl === -999999) bestSetup = { name: 'N/A', pnl: 0, winRate: 0 };
    if (worstSetup.pnl === 999999) worstSetup = { name: 'N/A', pnl: 0, winRate: 0 };
    if (peakEmotion.pnl === -999999) peakEmotion = { name: 'N/A', pnl: 0, winRate: 0 };
    if (toxicEmotion.pnl === 999999) toxicEmotion = { name: 'N/A', pnl: 0, winRate: 0 };

    return {
      totalTrades,
      netPnl,
      winRate: Math.round(winRate),
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      bestSetup,
      worstSetup,
      peakEmotion,
      toxicEmotion
    };
  }, [activeJournals]);

  const publicJournals = useMemo(() => db.getAllPublicJournals() as PublicJournalEntry[], []);

  if (!currentUser?.loggedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-border-theme bg-bg-card/85 p-8 text-center space-y-6 glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
            <Lock className="h-8 w-8 text-brand-green" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">Trading Journals Locked</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Signup or login to access the full features of trading journals. Log and track your positions, monitor daily risk conformance parameters, record psychology emotions, and build consistency streaks.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all glow-accent"
          >
            <User className="h-4 w-4" />
            <span>Signup or Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border-theme pb-6">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
            Trading <span className="text-brand-green">Journals</span>
          </h2>
          <p className="text-xs text-text-secondary max-w-xl">
            Cultivate pure discipline. Track setups, analyze win rate patterns, monitor daily drawdown limits, and keep an active record of your trades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center">
          {currentUser?.loggedIn && (
            <div className="flex items-center gap-2 rounded-lg border border-border-theme bg-bg-secondary px-3 py-2 text-xs">
              <span className="text-text-muted font-bold uppercase text-[9px] tracking-wider">Journal visibility:</span>
              <button
                onClick={handleToggleVisibility}
                className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded transition-all select-none uppercase tracking-wider text-[9px] ${
                  journalSettings.isPublic
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                    : 'bg-bg-secondary text-text-secondary border border-border-theme'
                }`}
                title="Toggle journal community visibility"
              >
                {journalSettings.isPublic ? (
                  <>
                    <Globe className="h-3 w-3 text-brand-green" />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-text-muted" />
                    <span>Private</span>
                  </>
                )}
              </button>
            </div>
          )}

          {journalSubTab === 'my' && currentUser?.loggedIn && (
            <div className="flex gap-2 flex-wrap items-center">
              {/* Account Filter */}
              <select
                id="journal-account-filter"
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
                className="rounded-lg border border-border-theme bg-bg-card py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
              >
                <option value="all">All Accounts</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              {/* Account Type Filter */}
              <select
                id="journal-account-type-filter"
                value={selectedAccountTypeFilter}
                onChange={(e) => setSelectedAccountTypeFilter(e.target.value as 'all' | 'Challenge' | 'Funded')}
                className="rounded-lg border border-border-theme bg-bg-card py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="Challenge">Challenge Accounts</option>
                <option value="Funded">Funded Accounts</option>
              </select>

              {/* Manage Accounts Button */}
              <button
                id="journal-manage-accounts-btn"
                onClick={() => setIsManagingAccounts(prev => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                  isManagingAccounts
                    ? 'bg-brand-green/10 border-brand-green/35 text-brand-green font-bold shadow-[0_0_10px_rgba(34,197,94,0.05)]'
                    : 'border-border-theme bg-bg-card text-text-secondary hover:border-brand-green/30 hover:text-text-primary'
                }`}
              >
                <span>Accounts Manager</span>
              </button>

              <button
                onClick={() => {
                  if (currentUser?.loggedIn) {
                    setIsLoggingTrade(!isLoggingTrade);
                    setIsManagingAccounts(false);
                  } else {
                    onOpenAuth();
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  isLoggingTrade
                    ? 'bg-brand-green text-black border border-brand-green shadow-[0_0_25px_rgba(168,85,247,0.7)] scale-[1.03] ring-2 ring-purple-500/40'
                    : 'bg-brand-green text-black hover:bg-brand-green/90 border border-transparent glow-purple'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Log New Trade</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="mx-auto max-w-xl w-full flex items-start gap-3 rounded-xl bg-brand-green/10 border border-brand-green/35 p-4 text-xs text-text-primary animate-fade-in relative shadow-[0_4px_12px_rgba(34,197,94,0.08)] text-left">
          <div className="rounded-full bg-brand-green/20 p-1.5 text-brand-green flex-shrink-0">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-extrabold text-brand-green uppercase tracking-wide text-[9px]">Success</div>
            <div className="font-bold text-text-primary">{successToast.message}</div>
            {successToast.subMessage && <p className="text-text-secondary leading-relaxed mt-1 text-[11px]">{successToast.subMessage}</p>}
          </div>
          <button 
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-text-muted hover:text-text-primary absolute top-3.5 right-3.5 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Subtab Navigation Bar */}
      <div className="flex border border-border-theme bg-bg-input/45 p-1 rounded-xl max-w-2xl mx-auto">
        <button
          onClick={() => setJournalSubTab('my')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            journalSubTab === 'my'
              ? 'bg-bg-secondary text-text-primary border border-border-theme shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          My Journal Logbook
        </button>
        <button
          onClick={() => setJournalSubTab('streak')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all inline-flex items-center justify-center gap-1 ${
            journalSubTab === 'streak'
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-brand-green border border-brand-green/20 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Streak Simulator
        </button>
        <button
          onClick={() => setJournalSubTab('community')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            journalSubTab === 'community'
              ? 'bg-bg-secondary text-text-primary border border-border-theme shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Community Shared Journals
        </button>
        <button
          onClick={() => setJournalSubTab('ai')}
          className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all inline-flex items-center justify-center gap-1 ${
            journalSubTab === 'ai'
              ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-400 border border-purple-500/20 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          AI Coach
        </button>
      </div>

      {/* Subtab Content Orchestration */}
      {journalSubTab === 'my' && (
        <>
          {/* Stats Summary Panel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-xl border border-border-theme bg-bg-card p-4 text-center">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Total Trades</span>
              <span className="text-xl font-black text-text-primary mt-1 block">{stats.totalTrades}</span>
            </div>
            
            <div className="rounded-xl border border-border-theme bg-bg-card p-4 text-center">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Net P&L</span>
              <span className={`text-xl font-black mt-1 block font-mono ${stats.netPnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-border-theme bg-bg-card p-4 text-center">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Win Rate</span>
              <span className="text-xl font-black text-text-primary mt-1 block">{stats.winRate}%</span>
            </div>

            <div className="rounded-xl border border-border-theme bg-bg-card p-4 text-center">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Profit Factor</span>
              <span className="text-xl font-black text-brand-green mt-1 block font-mono">{stats.profitFactor}</span>
            </div>

            <div className="col-span-2 md:col-span-1 rounded-xl border border-border-theme bg-bg-card p-4 text-center">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Avg Win / Loss</span>
              <span className="text-xs font-bold text-text-secondary mt-1.5 block font-mono">
                <span className="text-brand-green">${stats.avgWin}</span>
                <span className="text-text-muted"> / </span>
                <span className="text-red-500">${stats.avgLoss}</span>
              </span>
            </div>
          </div>

          {/* Journal Insights Panel */}
          {journals.length > 0 && (
            <div className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-4 animate-fade-in text-left">
              <div className="flex items-center gap-2 border-b border-border-theme pb-3">
                <Brain className="h-4.5 w-4.5 text-brand-green" />
                <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Journal Performance Insights</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Peak Tactic */}
                <div className="rounded-lg bg-bg-input/40 border border-border-theme p-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Peak Tactic</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide truncate max-w-[120px]" title={stats.bestSetup.name}>
                      {stats.bestSetup.name}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-brand-green">+{stats.bestSetup.winRate}% WR</span>
                  </div>
                  <span className="text-[10px] text-text-muted block font-mono">
                    P&L: <span className={stats.bestSetup.pnl >= 0 ? 'text-brand-green font-bold' : 'text-red-500 font-bold'}>
                      {stats.bestSetup.pnl >= 0 ? '+' : ''}${stats.bestSetup.pnl.toLocaleString()}
                    </span>
                  </span>
                </div>

                {/* Leak Tactic */}
                <div className="rounded-lg bg-bg-input/40 border border-border-theme p-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Leak Tactic</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide truncate max-w-[120px]" title={stats.worstSetup.name}>
                      {stats.worstSetup.name}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-red-500">{stats.worstSetup.winRate}% WR</span>
                  </div>
                  <span className="text-[10px] text-text-muted block font-mono">
                    P&L: <span className={stats.worstSetup.pnl >= 0 ? 'text-brand-green font-bold' : 'text-red-500 font-bold'}>
                      {stats.worstSetup.pnl >= 0 ? '+' : ''}${stats.worstSetup.pnl.toLocaleString()}
                    </span>
                  </span>
                </div>

                {/* Peak Mindset */}
                <div className="rounded-lg bg-bg-input/40 border border-border-theme p-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Peak Mindset</span>
                  <div className="flex items-center justify-between">
                    {(() => {
                      const emObj = EMOTIONS.find(e => e.value === stats.peakEmotion.name);
                      return (
                        <div className="flex items-center gap-1 truncate max-w-[120px]">
                          <span className="text-sm">{emObj?.emoji || '😌'}</span>
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wide truncate">{emObj?.label || stats.peakEmotion.name}</span>
                        </div>
                      );
                    })()}
                    <span className="text-[10px] font-bold font-mono text-brand-green">+{stats.peakEmotion.winRate}% WR</span>
                  </div>
                  <span className="text-[10px] text-text-muted block font-mono">
                    P&L: <span className={stats.peakEmotion.pnl >= 0 ? 'text-brand-green font-bold' : 'text-red-500 font-bold'}>
                      {stats.peakEmotion.pnl >= 0 ? '+' : ''}${stats.peakEmotion.pnl.toLocaleString()}
                    </span>
                  </span>
                </div>

                {/* Leak Mindset */}
                <div className="rounded-lg bg-bg-input/40 border border-border-theme p-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Leak Mindset</span>
                  <div className="flex items-center justify-between">
                    {(() => {
                      const emObj = EMOTIONS.find(e => e.value === stats.toxicEmotion.name);
                      return (
                        <div className="flex items-center gap-1 truncate max-w-[120px]">
                          <span className="text-sm">{emObj?.emoji || '🔥'}</span>
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wide truncate">{emObj?.label || stats.toxicEmotion.name}</span>
                        </div>
                      );
                    })()}
                    <span className="text-[10px] font-bold font-mono text-red-500">{stats.toxicEmotion.winRate}% WR</span>
                  </div>
                  <span className="text-[10px] text-text-muted block font-mono">
                    P&L: <span className={stats.toxicEmotion.pnl >= 0 ? 'text-brand-green font-bold' : 'text-red-500 font-bold'}>
                      {stats.toxicEmotion.pnl >= 0 ? '+' : ''}${stats.toxicEmotion.pnl.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Discipline Badges & Achievements Panel */}
          {currentUser?.loggedIn && (
            <div className="rounded-xl border border-border-theme bg-bg-card p-5 space-y-4 animate-fade-in text-left">
              <div className="flex items-center justify-between border-b border-border-theme pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Star className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-primary">Discipline Badges & Achievements</h3>
                </div>
                <div className="text-[10px] font-bold text-text-muted">
                  Score: <span className="text-brand-green">{db.getUserBadges(currentUser.username).filter(b => b.unlocked).length} / 5 Unlocked</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {db.getUserBadges(currentUser.username).map(badge => (
                  <div
                    key={badge.id}
                    className={`rounded-lg border p-3.5 space-y-2 flex flex-col justify-between transition-all duration-300 ${
                      badge.unlocked
                        ? 'bg-brand-green/5 border-brand-green/20'
                        : 'bg-bg-input/20 border-border-theme opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="text-xs font-black text-text-primary">{badge.name}</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed mt-1">{badge.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border-theme/40">
                      <div className="flex justify-between text-[8px] font-mono font-bold text-text-muted">
                        <span>PROGRESS</span>
                        <span>{badge.progress.current} / {badge.progress.target}</span>
                      </div>
                      <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden border border-border-theme/20">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            badge.unlocked ? 'bg-brand-green' : 'bg-text-muted'
                          }`}
                          style={{ width: `${(badge.progress.current / badge.progress.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounts Management UI Modal */}
          {isManagingAccounts && currentUser?.loggedIn && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl p-6 shadow-2xl space-y-5 glow-accent text-left max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center border-b border-border-theme pb-3" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                    Trading Accounts Manager
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Link challenge credentials and funded accounts to isolate P&L statistics.
                  </p>
                </div>
                <button
                  onClick={() => setIsManagingAccounts(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Current Accounts List */}
                <div className="lg:col-span-7 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Linked Accounts ({accounts.length})</h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {accounts.map(acc => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-bg-secondary"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div>
                          <div className="text-xs font-bold text-text-primary">{acc.name}</div>
                          <div className="text-[9px] font-mono text-text-muted mt-0.5 uppercase">
                            {acc.propFirm} &bull; {acc.type} &bull; ${acc.size.toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove account "${acc.name}"? Historical logs will lose their link but remain in database.`)) {
                              const updated = accounts.filter(a => a.id !== acc.id);
                              setAccounts(updated);
                              db.saveAccounts(currentUser.username, updated);
                              if (selectedAccountId === acc.id) {
                                setSelectedAccountId(updated.length > 0 ? updated[0].id : '');
                              }
                            }
                          }}
                          className="text-text-muted hover:text-red-500 transition-colors p-1"
                          title="Remove Account"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Account Form */}
                <div className="lg:col-span-5 rounded-lg border bg-bg-secondary p-4 space-y-3.5" style={{ borderColor: 'var(--border)' }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Create New Account</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Account Name</label>
                      <input
                        type="text"
                        required
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        placeholder="e.g. My FTMO Funded 100K"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Prop Firm</label>
                        <select
                          value={newAccFirm}
                          onChange={(e) => setNewAccFirm(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                        >
                          <option value="FTMO">FTMO</option>
                          <option value="FundedNext">FundedNext</option>
                          <option value="The 5%ers">The 5%ers</option>
                          <option value="FundedMax">FundedMax</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Account Type</label>
                        <select
                          value={newAccType}
                          onChange={(e) => setNewAccType(e.target.value as 'Challenge' | 'Funded')}
                          className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                        >
                          <option value="Challenge">Challenge</option>
                          <option value="Funded">Funded</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Size of Account (USD)</label>
                      <input
                        type="number"
                        value={newAccSize}
                        onChange={(e) => setNewAccSize(e.target.value)}
                        placeholder="100000"
                        className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newAccName.trim()) return;
                        const newAcc: TradingAccount = {
                          id: `acc-${Date.now()}`,
                          name: newAccName,
                          type: newAccType,
                          propFirm: newAccFirm,
                          size: parseInt(newAccSize)
                        };
                        const updated = [...accounts, newAcc];
                        setAccounts(updated);
                        db.saveAccounts(currentUser.username, updated);
                        setNewAccName('');
                        if (updated.length === 1) setSelectedAccountId(newAcc.id);
                      }}
                      className="w-full rounded-lg bg-brand-green py-2 text-[10px] font-bold uppercase text-black hover:bg-brand-green/90 transition-all"
                    >
                      Save Trading Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Log Trade Form Popup */}
          {isLoggingTrade && currentUser?.loggedIn && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-theme bg-bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-theme pb-4 mb-4">
                  <h3 className="text-lg font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-brand-green" />
                    <span>Log New Trade</span>
                  </h3>
                  <button
                    onClick={() => setIsLoggingTrade(false)}
                    className="p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleLogTradeSubmit} className="space-y-5 text-left">

              {formError && (
                <div className="flex items-start gap-2.5 rounded-lg bg-red-950/50 border border-red-800/60 p-3.5 text-xs text-red-200 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Account</label>
                  <select
                    id="journal-form-account-select"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
                  >
                    {accounts.length === 0 ? (
                      <option value="" disabled className="bg-bg-input text-text-muted">
                        No accounts created (Create one in Accounts Manager)
                      </option>
                    ) : (
                      accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-bg-input text-text-primary">
                          {acc.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Session</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value as TradingSession)}
                    className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
                  >
                    {TRADING_SESSIONS.map((s) => (
                      <option key={s} value={s} className="bg-bg-secondary text-text-secondary">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Setup Tactic</label>
                  <select
                    value={setup}
                    onChange={(e) => setSetup(e.target.value as SetupType)}
                    className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
                  >
                    {SETUP_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-bg-secondary text-text-secondary">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Psychological State</label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value as Emotion)}
                    className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
                  >
                    {EMOTIONS.map((em) => (
                      <option key={em.value} value={em.value} className="bg-bg-secondary text-text-secondary">
                        {em.emoji} {em.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {setup === 'No Setup' ? (
                <div className="rounded-xl border border-dashed border-blue-500/25 bg-blue-500/5 p-5 text-center space-y-1.5">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">No Setup Day Log</div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Recording a No Setup Day. This represents high execution discipline — observing the charts and choosing not to trade. Your record will be saved with $0.00 P&L and 0 lots to preserve your consistency streak.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Asset/Pair</label>
                      <input
                        type="text"
                        required={(setup as string) !== 'No Setup'}
                        value={asset}
                        onChange={(e) => {
                          setAsset(e.target.value);
                          setFormError('');
                        }}
                        placeholder="e.g. XAUUSD"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Direction</label>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value as 'BUY' | 'SELL')}
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
                      >
                        <option value="BUY" className="bg-bg-input text-brand-green font-bold">BUY (Long)</option>
                        <option value="SELL" className="bg-bg-input text-red-500 font-bold">SELL (Short)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Lot Size</label>
                      <input
                        type="text"
                        required={(setup as string) !== 'No Setup'}
                        value={lots}
                        onChange={(e) => setLots(e.target.value)}
                        placeholder="1.00"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Risk %</label>
                      <input
                        type="number"
                        step="any"
                        value={riskPct}
                        onChange={(e) => setRiskPct(e.target.value)}
                        placeholder="e.g. 1.0"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Planned R:R Ratio</label>
                      <input
                        type="number"
                        step="any"
                        value={riskReward}
                        onChange={(e) => setRiskReward(e.target.value)}
                        placeholder="e.g. 3.0"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Entry Price</label>
                      <input
                        type="number"
                        step="any"
                        required={(setup as string) !== 'No Setup'}
                        value={entryPrice}
                        onChange={(e) => {
                          setEntryPrice(e.target.value);
                          setFormError('');
                        }}
                        placeholder="e.g. 2350.50"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Exit Price</label>
                      <input
                        type="number"
                        step="any"
                        required={(setup as string) !== 'No Setup'}
                        value={exitPrice}
                        onChange={(e) => {
                          setExitPrice(e.target.value);
                          setFormError('');
                        }}
                        placeholder="e.g. 2362.80"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Net Profit ($)</label>
                        {entryPrice && exitPrice && (
                          <button
                            type="button"
                            onClick={calculateEstimatedPnl}
                            className="text-[9px] font-extrabold text-brand-green hover:underline cursor-pointer transition-colors uppercase tracking-wider bg-transparent border-0 p-0"
                          >
                            Auto-Calc
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="any"
                        required={(setup as string) !== 'No Setup'}
                        value={pnl}
                        onChange={(e) => {
                          setPnl(e.target.value);
                          setFormError('');
                        }}
                        placeholder="e.g. 1230 or -450"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload / Attachment Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Attach Chart/Screenshot (optional)</span>
                      </label>
                      <div className="flex rounded-md border border-border-theme bg-bg-input p-0.5 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImageMode('upload')}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded transition-all uppercase tracking-wider ${
                            imageMode === 'upload' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Upload className="h-2.5 w-2.5" />
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('url')}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded transition-all uppercase tracking-wider ${
                            imageMode === 'url' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Link className="h-2.5 w-2.5" />
                          URL
                        </button>
                      </div>
                    </div>

                    {imageMode === 'url' && (
                      <input
                        type="text"
                        placeholder="Paste image URL here... (e.g. https://i.imgur.com/chart.png)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                      />
                    )}

                    {imageMode === 'upload' && !imageUrl && (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 px-4 cursor-pointer transition-all duration-200 ${
                          isDragging
                            ? 'border-brand-green bg-brand-green/5 shadow-inner'
                            : 'border-border-theme bg-bg-input/40 hover:border-border-hover hover:bg-bg-input/65'
                        }`}
                      >
                        <div className={`rounded-full p-2 transition-colors ${
                          isDragging ? 'bg-brand-green/10 text-brand-green' : 'bg-bg-secondary text-text-secondary'
                        }`}>
                          <Upload className="h-4 w-4" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-bold text-text-secondary">
                            {isDragging ? 'Drop your screenshot here' : 'Click or Drag trade screenshot here'}
                          </p>
                          <p className="text-[9px] text-text-muted mt-0.5">PNG, JPG up to 3MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    )}

                    {imageUrl && (
                      <div className="relative rounded-xl border border-border-theme bg-bg-input overflow-hidden max-w-sm group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt="Screenshot Preview"
                          className="w-full max-h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 rounded bg-bg/70 border border-border-theme p-1 text-text-secondary hover:text-red-400 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-border-theme/60">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Trade Setup & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your thoughts on today's price action and emotional state..."
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input/30 py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all resize-none"
                />
              </div>

              {currentUser?.loggedIn && (
                (() => {
                  const alignment = checkPlanAlignment(
                    date,
                    direction,
                    riskPct ? parseFloat(riskPct) : undefined,
                    currentUser.username
                  );

                  return (
                    <div className="rounded-xl border border-border-theme bg-bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border-theme pb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                            Pre-Execution Plan Conformance
                          </h4>
                        </div>
                        {alignment.hasPlan && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            alignment.status === 'aligned'
                              ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {alignment.status === 'aligned' ? 'Fully Aligned' : 'Plan Violations'}
                          </span>
                        )}
                      </div>

                      {!alignment.hasPlan ? (
                        <div className="text-xs text-text-muted space-y-1">
                          <p className="font-semibold text-text-secondary">⚠️ No Daily Trading Plan has been committed for {date}.</p>
                          <p className="text-[10px]">Commit to a plan and pre-trade checklist on the Home Dashboard to track discipline scores.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Bias vs Direction</span>
                              <span className={`font-bold ${
                                alignment.violations.some(v => v.includes('Bias')) ? 'text-red-500' : 'text-brand-green'
                              }`}>
                                Bias: {alignment.planBias?.toUpperCase()} &rarr; Direction: {direction}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Risk vs Daily Cap</span>
                              <span className={`font-bold font-mono ${
                                alignment.violations.some(v => v.includes('Risk')) ? 'text-red-500' : 'text-brand-green'
                              }`}>
                                Cap: {alignment.planMaxRisk} &rarr; Trade: {riskPct ? `${riskPct}%` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Pre-Trade Checklist</span>
                              <span className={`font-bold ${alignment.checklistComplete ? 'text-brand-green' : 'text-yellow-500'}`}>
                                {alignment.checklistCount}/6 Items Checked
                              </span>
                            </div>
                          </div>

                          <div className="rounded-lg bg-bg-input p-2.5 space-y-1 border border-border-theme/60">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Locked Daily Guidelines</span>
                            <p className="text-[10px] text-text-secondary leading-relaxed italic line-clamp-3">
                              &ldquo;{alignment.planNotes || 'No custom guidelines entered.'}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}

                      {alignment.hasPlan && alignment.violations.length > 0 && (
                        <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-2.5 text-[11px] text-red-200 space-y-1">
                          <span className="font-extrabold uppercase text-[8px] tracking-wider text-red-400 block">Plan Breaches Identified:</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {alignment.violations.map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-theme/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsLoggingTrade(false)}
                  className="rounded-lg border border-border-theme bg-bg-input/50 px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-green px-5 py-2 text-xs font-bold text-black hover:bg-brand-green/90 uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                >
                  Log Position
                </button>
              </div>
            </form>
            </div>
            </div>
          )}



          {/* Journal History Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-theme pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <BookOpen className="h-5 w-5 text-brand-green" />
                <span>Active Trade Log History</span>
              </h3>

              {currentUser?.loggedIn && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Account:</span>
                    <select
                      id="table-account-filter"
                      value={selectedAccountFilter}
                      onChange={(e) => setSelectedAccountFilter(e.target.value)}
                      className="rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-[11px] text-text-secondary focus:border-brand-green focus:outline-none transition-all cursor-pointer hover:border-brand-green/30"
                    >
                      <option value="all">All Accounts</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-bg-secondary text-text-primary">
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Type:</span>
                    <select
                      id="table-account-type-filter"
                      value={selectedAccountTypeFilter}
                      onChange={(e) => setSelectedAccountTypeFilter(e.target.value as 'all' | 'Challenge' | 'Funded')}
                      className="rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-[11px] text-text-secondary focus:border-brand-green focus:outline-none transition-all cursor-pointer hover:border-brand-green/30"
                    >
                      <option value="all">All Types</option>
                      <option value="Challenge" className="bg-bg-secondary text-text-primary">Challenge</option>
                      <option value="Funded" className="bg-bg-secondary text-text-primary">Funded</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
              {activeJournals.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs italic">
                  No trades logged yet. Click &ldquo;Log New Trade&rdquo; at the top to record your first transaction!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-theme bg-bg-input/40 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4">Setup</th>
                        <th className="py-3 px-4">Session</th>
                        <th className="py-3 px-4 text-center">Type</th>
                        <th className="py-3 px-4 text-center">Lots</th>
                        <th className="py-3 px-4 text-right">Entry / Exit</th>
                        <th className="py-3 px-4 text-center">Risk / RR</th>
                        <th className="py-3 px-4 text-center">Mindset</th>
                        <th className="py-3 px-4 text-center">Discipline</th>
                        <th className="py-3 px-4 text-right">Net P&L</th>
                        <th className="py-3 px-4 max-w-[150px] hidden lg:table-cell">Notes</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-theme/40 font-medium">
                      {activeJournals.map((j) => (
                        <tr key={j.id} className="hover:bg-bg-hover/40 transition-colors">
                          <td className="py-3.5 px-4 text-text-muted font-mono">{j.date}</td>
                          <td className="py-3.5 px-4 text-text-primary font-bold">
                            <div>{j.asset}</div>
                            {(() => {
                              const acc = accounts.find(a => a.id === j.accountId);
                              if (acc) {
                                return (
                                  <div className="text-[8px] uppercase tracking-wider font-semibold text-text-muted mt-0.5">
                                    {acc.propFirm} {acc.type} ${acc.size / 1000}K
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-bg-input/60 border border-border-theme/80 text-[9px] font-bold text-text-secondary px-2 py-0.5 tracking-wide uppercase">
                              {j.setup || 'Other'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-bg-input/60 border border-border-theme/80 text-[9px] font-bold text-text-secondary px-2 py-0.5 tracking-wide uppercase">
                              {j.session || 'Asian'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {j.setup === 'No Setup' ? (
                              <span className="text-text-muted font-bold">—</span>
                            ) : (
                              <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                j.direction === 'BUY' 
                                  ? 'bg-brand-green/10 text-brand-green border border-brand-green/15' 
                                  : 'bg-red-950/20 text-red-500 border border-red-900/15'
                              }`}>
                                {j.direction}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center text-text-secondary font-mono">
                            {j.setup === 'No Setup' ? (
                              <span className="text-text-muted">—</span>
                            ) : (
                              j.lots.toFixed(2)
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-text-secondary font-mono leading-none">
                            {j.setup === 'No Setup' ? (
                              <span className="text-text-muted block text-center">—</span>
                            ) : (
                              <>
                                  <div>{j.entryPrice.toLocaleString()}</div>
                                  <div className="text-[9px] text-text-muted mt-1">{j.exitPrice.toLocaleString()}</div>
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center text-text-secondary font-mono text-xs">
                            {j.riskPct !== undefined ? (
                              <span className="text-text-primary">{j.riskPct}%</span>
                            ) : (
                              <span className="text-text-muted">-</span>
                            )}
                            {j.riskReward !== undefined && (
                              <span className="text-text-muted text-[10px] block mt-0.5">1:{j.riskReward} RR</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {(() => {
                              const emObj = EMOTIONS.find((e) => e.value === j.emotion);
                              return (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${emObj?.color || 'text-text-muted'}`} title={emObj?.label}>
                                  <span>{emObj?.emoji || '😐'}</span>
                                  <span className="text-[9px] uppercase tracking-wider hidden md:inline font-bold">{emObj?.label || 'Neutral'}</span>
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-center relative">
                            {(() => {
                              const alignment = checkPlanAlignment(j.date, j.direction, j.riskPct, j.author);
                              const isDropdownOpen = openAlignmentId === j.id;

                              return (
                                <div className="inline-block relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenAlignmentId(isDropdownOpen ? null : j.id);
                                    }}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                      alignment.status === 'aligned'
                                        ? 'bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green/20'
                                        : alignment.status === 'violated'
                                          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                          : 'bg-bg-secondary text-text-secondary border-border-theme hover:bg-bg-hover'
                                    }`}
                                  >
                                    {alignment.status === 'aligned' ? (
                                      <>
                                        <ShieldCheck className="h-3 w-3 text-brand-green" />
                                        <span>Aligned</span>
                                      </>
                                    ) : alignment.status === 'violated' ? (
                                      <>
                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                        <span>Violated ({alignment.violations.length})</span>
                                      </>
                                    ) : (
                                      <>
                                        <HelpCircle className="h-3 w-3 text-text-muted" />
                                        <span>No Plan</span>
                                      </>
                                    )}
                                  </button>

                                  {isDropdownOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20 cursor-default"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenAlignmentId(null);
                                        }}
                                      />
                                      <div 
                                        className="absolute z-30 right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 top-full mt-2 w-72 bg-bg-card border border-border-theme p-4 rounded-xl shadow-2xl space-y-3 text-left animate-fade-in"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center justify-between border-b border-border-theme/60 pb-2">
                                          <div className="flex items-center gap-1.5">
                                            <Brain className="h-3.5 w-3.5 text-purple-400" />
                                            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Discipline Scorecard</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setOpenAlignmentId(null)}
                                            className="text-text-muted hover:text-text-primary p-0.5"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>

                                        {!alignment.hasPlan ? (
                                          <div className="space-y-1.5 py-1 text-xs">
                                            <p className="font-semibold text-text-secondary">No Daily Plan Locked</p>
                                            <p className="text-[10px] text-text-muted leading-relaxed">
                                              There was no committed daily trading plan or checklist saved in localStorage for this date ({j.date}).
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="space-y-3 text-xs">
                                            {/* Checklist checks */}
                                            <div className="space-y-1">
                                              <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase">
                                                <span>Checklist Complete</span>
                                                <span className={alignment.checklistComplete ? 'text-brand-green' : 'text-yellow-500'}>
                                                  {alignment.checklistCount}/6 Checked
                                                </span>
                                              </div>
                                              <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden border border-border-theme/20">
                                                <div 
                                                  className={`h-full ${alignment.checklistComplete ? 'bg-brand-green' : 'bg-yellow-500'}`} 
                                                  style={{ width: `${(alignment.checklistCount / 6) * 100}%` }}
                                                />
                                              </div>
                                            </div>

                                            {/* Alignment criteria list */}
                                            <div className="space-y-1.5 border-t border-border-theme/40 pt-2">
                                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Conformance Items</span>
                                              
                                              {/* Bias alignment */}
                                              <div className="flex items-start gap-2 text-[11px]">
                                                {alignment.violations.some(v => v.includes('Bias')) ? (
                                                  <span className="text-red-500 flex-shrink-0">❌</span>
                                                ) : (
                                                  <span className="text-brand-green flex-shrink-0">✅</span>
                                                )}
                                                <div>
                                                  <span className="font-bold">Market Bias: </span>
                                                  <span className="text-text-secondary">
                                                    Bias was {alignment.planBias || 'Neutral/Range'}. Logged {j.direction}.
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Risk alignment */}
                                              <div className="flex items-start gap-2 text-[11px]">
                                                {alignment.violations.some(v => v.includes('Risk')) ? (
                                                  <span className="text-red-500 flex-shrink-0">❌</span>
                                                ) : (
                                                  <span className="text-brand-green flex-shrink-0">✅</span>
                                                )}
                                                <div>
                                                  <span className="font-bold">Risk Allocation: </span>
                                                  <span className="text-text-secondary">
                                                    Cap was {alignment.planMaxRisk}. Logged {j.riskPct ? `${j.riskPct}%` : 'N/A'}.
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Checklist alignment */}
                                              <div className="flex items-start gap-2 text-[11px]">
                                                {!alignment.checklistComplete ? (
                                                  <span className="text-red-500 flex-shrink-0">❌</span>
                                                ) : (
                                                  <span className="text-brand-green flex-shrink-0">✅</span>
                                                )}
                                                <div>
                                                  <span className="font-bold">Checklist Clearance: </span>
                                                  <span className="text-text-secondary">
                                                    {!alignment.checklistComplete ? 'Traded before satisfy checklist' : 'Checklist fully cleared'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Guidelines rules */}
                                            <div className="bg-bg-input p-2.5 rounded-lg border border-border-theme/60 space-y-1">
                                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Locked Daily Rules</span>
                                              <p className="text-[10px] text-text-secondary italic leading-relaxed whitespace-pre-wrap">
                                                {alignment.planNotes || 'No custom rules written.'}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black font-mono ${
                            j.setup === 'No Setup' 
                              ? 'text-text-muted' 
                              : j.pnl >= 0 
                                ? 'text-brand-green' 
                                : 'text-red-500'
                          }`}>
                            {j.setup === 'No Setup' ? '—' : `${j.pnl >= 0 ? '+' : ''}$${j.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-3.5 px-4 text-text-secondary max-w-[150px] truncate hidden lg:table-cell" title={j.notes}>
                            {j.notes || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedTrade({ ...j, avatar: currentUser?.avatar || '👤' })}
                                className="text-text-muted hover:text-brand-green transition-colors p-1"
                                title="View Details & Discussion"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrade(j.id)}
                                className="text-text-muted hover:text-red-500 transition-colors p-1"
                                title="Delete Position Entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {journalSubTab === 'community' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border-theme pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Globe className="h-5 w-5 text-brand-green" />
                <span>Community Trade Showroom</span>
              </h3>
              <p className="text-[11px] text-text-muted mt-1">
                Explore real trade entries shared by other prop traders. Ask questions, rate execution, and gain analytical insight.
              </p>
            </div>
          </div>

          {publicJournals.length === 0 ? (
            <div className="rounded-xl border border-border-theme bg-bg-card p-12 text-center text-text-muted text-xs italic">
              No public trading journals are shared yet. Be the first to toggle your journal status to &ldquo;Public&rdquo; in the header!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicJournals.map((j) => {
                const feedbackList = db.getTradeFeedback(j.id);
                const ratings = feedbackList.filter(f => f.rating !== undefined).map(f => f.rating as number);
                const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;

                return (
                  <div
                    key={j.id}
                    className="group flex flex-col justify-between rounded-xl border border-border-theme bg-bg-card hover:border-border-hover transition-all overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* User Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary text-sm font-bold text-text-primary border border-border-theme">
                            {j.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text-primary">{j.author}</span>
                              {(() => {
                                const badges = db.getUserBadges(j.author);
                                const unlocked = badges.filter(b => b.unlocked);
                                return unlocked.map(b => (
                                  <span key={b.id} className="text-[10px]" title={b.name}>
                                    {b.emoji}
                                  </span>
                                ));
                              })()}
                            </div>
                            <span className="text-[9px] text-text-muted block font-mono">{j.date}</span>
                          </div>
                        </div>

                        <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          j.direction === 'BUY' 
                            ? 'bg-brand-green/10 text-brand-green border border-brand-green/15' 
                            : 'bg-red-950/20 text-red-500 border border-red-900/15'
                        }`}>
                          {j.direction} {j.lots.toFixed(2)} Lots
                        </span>
                      </div>

                      {/* Trade Summary */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide flex flex-wrap items-center gap-1.5">
                            {j.asset}
                            <span className="text-[9px] lowercase font-normal rounded bg-bg-input border border-border-theme px-2 py-0.5 text-text-secondary uppercase">
                              {j.setup}
                            </span>
                            <span className="text-[9px] lowercase font-normal rounded bg-bg-input border border-border-theme px-2 py-0.5 text-text-secondary uppercase">
                              {j.session || 'Asian'}
                            </span>
                            {j.accountDetails && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-green bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                                <ShieldCheck className="h-3 w-3 text-brand-green" />
                                {j.accountDetails.propFirm} {j.accountDetails.type}
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-text-muted block mt-1">
                            Entry: {j.entryPrice.toLocaleString()} &middot; Exit: {j.exitPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-black font-mono ${j.pnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                            {j.pnl >= 0 ? '+' : ''}${j.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          {j.riskPct !== undefined && (
                            <span className="text-[9px] text-text-muted block mt-0.5 font-mono">
                              Risked: {j.riskPct}% {j.riskReward !== undefined ? `(1:${j.riskReward} RR)` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Attached Screenshot (if any) */}
                      {j.imageUrl && (
                        <div className="relative overflow-hidden rounded-lg border border-border-theme bg-bg-input max-h-40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={j.imageUrl}
                            alt="Trade Chart"
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Mindset & Notes */}
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 italic bg-bg/20 p-2.5 rounded-lg border border-border-theme">
                        &ldquo;{j.notes || 'No trade description provided.'}&rdquo;
                      </p>
                    </div>

                    {/* Interactions Footer */}
                    <div className="flex items-center justify-between border-t border-border-theme/60 bg-bg-input/20 px-5 py-3">
                      <div className="flex items-center gap-3.5 text-[10px] font-bold text-text-muted">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5 text-text-muted" />
                          {feedbackList.length} Q&A
                        </span>
                        {avgRating && (
                          <span className="flex items-center gap-1 text-yellow-500/90">
                            <Star className="h-3.5 w-3.5 fill-current animate-pulse" />
                            {avgRating} ({ratings.length} Feedback)
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedTrade(j)}
                        className="rounded bg-bg-input border border-border-theme text-[10px] font-bold uppercase tracking-wider text-brand-green hover:bg-brand-green hover:text-black hover:border-brand-green px-3 py-1.5 transition-all"
                      >
                        Details & Q&A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Details & Feedback Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-theme bg-bg-card shadow-2xl glow-accent my-8 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-border-theme px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-secondary text-sm font-bold text-text-primary border border-border-theme">
                  {selectedTrade.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block">{selectedTrade.author}&apos;s Trade</span>
                  <span className="text-[9px] text-text-muted block font-mono">{selectedTrade.date}</span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedTrade(null); setFeedbackError(''); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              {/* Stats parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border-theme bg-bg-input/40 p-2.5 text-center">
                  <span className="text-[9px] text-text-muted uppercase tracking-widest block">Asset</span>
                  <span className="text-sm font-black text-text-primary block mt-0.5">{selectedTrade.asset}</span>
                </div>
                <div className="rounded-lg border border-border-theme bg-bg-input/40 p-2.5 text-center">
                  <span className="text-[9px] text-text-muted uppercase tracking-widest block">Lots</span>
                  <span className="text-sm font-black text-text-primary font-mono block mt-0.5">{selectedTrade.lots.toFixed(2)}</span>
                </div>
                <div className="rounded-lg border border-border-theme bg-bg-input/40 p-2.5 text-center">
                  <span className="text-[9px] text-text-muted uppercase tracking-widest block">Type</span>
                  <span className={`inline-block text-[9px] font-bold uppercase mt-1 px-2.5 py-0.5 rounded ${
                    selectedTrade.direction === 'BUY' 
                      ? 'bg-brand-green/10 text-brand-green border border-brand-green/15' 
                      : 'bg-red-950/20 text-red-500 border border-red-900/15'
                  }`}>
                    {selectedTrade.direction}
                  </span>
                </div>
                <div className="rounded-lg border border-border-theme bg-bg-input/40 p-2.5 text-center">
                  <span className="text-[9px] text-text-muted uppercase tracking-widest block">Net P&L</span>
                  <span className={`text-sm font-black font-mono block mt-0.5 ${selectedTrade.pnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                    {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Advanced info row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-border-theme/80 rounded-xl p-4 bg-bg/20">
                <div>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Setup Tactic</span>
                  <span className="text-xs font-bold text-text-primary block mt-1">{selectedTrade.setup || 'Other'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Trading Session</span>
                  <span className="text-xs font-bold text-text-primary block mt-1">{selectedTrade.session || 'Asian'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Risk Metrics</span>
                  <span className="text-xs font-bold text-text-secondary block mt-1 font-mono">
                    {selectedTrade.riskPct !== undefined ? `${selectedTrade.riskPct}%` : 'N/A'} Risk
                    {selectedTrade.riskReward !== undefined ? ` (1:${selectedTrade.riskReward} RR)` : ''}
                  </span>
                </div>
                <div>
                   <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Trader Mindset</span>
                  {(() => {
                    const emObj = EMOTIONS.find(e => e.value === selectedTrade.emotion);
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1 ${emObj?.color || 'text-text-secondary'}`}>
                        <span>{emObj?.emoji}</span>
                        <span className="uppercase text-[10px] tracking-wider font-extrabold">{emObj?.label}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Large Image (if attached) */}
              {selectedTrade.imageUrl && (
                <div className="rounded-xl border border-border-theme bg-bg-input overflow-hidden shadow-md max-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedTrade.imageUrl}
                    alt="Trade Screenshot Detail"
                    className="w-full h-full object-contain max-h-[300px]"
                  />
                </div>
              )}

              {/* Thesis/Notes */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Trade Thesis Notes</span>
                <div className="rounded-lg bg-bg-input/45 border border-border-theme p-4 text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {selectedTrade.notes || 'No description entered.'}
                </div>
              </div>

              {/* Plan & Checklist Alignment details */}
              {(() => {
                const alignment = checkPlanAlignment(
                  selectedTrade.date,
                  selectedTrade.direction,
                  selectedTrade.riskPct,
                  selectedTrade.author
                );

                return (
                  <div className="rounded-xl border border-border-theme bg-bg-input/20 p-4 space-y-3.5 text-left">
                    <div className="flex items-center justify-between border-b border-border-theme/40 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Brain className="h-4.5 w-4.5 text-purple-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                          Daily Plan & Checklist Alignment
                        </h4>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                        !alignment.hasPlan
                          ? 'bg-bg-secondary text-text-secondary border-border-theme'
                          : alignment.status === 'aligned'
                            ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {!alignment.hasPlan ? 'No Plan Locked' : alignment.status === 'aligned' ? 'Fully Aligned' : 'Violations Detected'}
                      </span>
                    </div>

                    {!alignment.hasPlan ? (
                      <p className="text-[11px] text-text-muted italic leading-relaxed">
                        No Daily Trading Plan or Pre-Trade Checklist was committed by {selectedTrade.author} for this date.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Left Details Checklist */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Market Bias</span>
                              <span className={`font-bold flex items-center gap-1 ${
                                alignment.violations.some(v => v.includes('Bias')) ? 'text-red-500' : 'text-brand-green'
                              }`}>
                                {alignment.violations.some(v => v.includes('Bias')) ? '❌' : '✅'}
                                Plan: {alignment.planBias?.toUpperCase()} &rarr; Trade: {selectedTrade.direction}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Risk Allocation</span>
                              <span className={`font-bold flex items-center gap-1 font-mono ${
                                alignment.violations.some(v => v.includes('Risk')) ? 'text-red-500' : 'text-brand-green'
                              }`}>
                                {alignment.violations.some(v => v.includes('Risk')) ? '❌' : '✅'}
                                Max: {alignment.planMaxRisk} &rarr; Trade: {selectedTrade.riskPct !== undefined ? `${selectedTrade.riskPct}%` : 'N/A'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">Pre-Trade Checklist</span>
                              <span className={`font-bold flex items-center gap-1 ${alignment.checklistComplete ? 'text-brand-green' : 'text-yellow-500'}`}>
                                {alignment.checklistComplete ? '✅' : '⚠️'}
                                {alignment.checklistCount}/6 Checked
                              </span>
                            </div>
                          </div>

                          {/* Right Guidelines */}
                          <div className="rounded-lg bg-bg-input p-3 border border-border-theme/60 space-y-1">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block">Locked Daily Rules</span>
                            <p className="text-[10px] text-text-secondary leading-relaxed italic whitespace-pre-wrap">
                              {alignment.planNotes || 'No custom rules logged.'}
                            </p>
                          </div>
                        </div>

                        {alignment.violations.length > 0 && (
                          <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3 text-[11px] text-red-200 space-y-1.5 text-left">
                            <span className="font-extrabold uppercase text-[8px] tracking-wider text-red-400 block">Identified Breaches:</span>
                            <ul className="list-disc pl-4 space-y-1">
                              {alignment.violations.map((v, i) => (
                                <li key={i}>{v}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Q&A & Feedback list */}
              <div className="space-y-4 border-t border-border-theme/60 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-brand-green" />
                  <span>Discussion Q&A & Reviews ({tradeFeedbacks.length})</span>
                </h4>

                {/* Feedbacks Loop */}
                {tradeFeedbacks.length === 0 ? (
                  <p className="text-[11px] text-text-muted italic">No reviews or questions yet. Ask a question below!</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {tradeFeedbacks.map((fb) => (
                      <div key={fb.id} className="rounded-lg bg-bg/40 border border-border-theme p-3 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-text-primary">{fb.author}</span>
                            {(() => {
                              const badges = db.getUserBadges(fb.author);
                              const unlocked = badges.filter(b => b.unlocked);
                              return unlocked.map(b => (
                                <span key={b.id} className="text-[9px]" title={b.name}>
                                  {b.emoji}
                                </span>
                              ));
                            })()}
                          </div>
                          <span className="text-[9px] text-text-muted font-mono">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {fb.rating && (
                          <div className="flex gap-0.5 text-yellow-500">
                            {Array.from({ length: fb.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-text-secondary">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ask a Question Form */}
                <form onSubmit={handlePostFeedback} className="space-y-3 border-t border-border-theme pt-4">
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rate trade execution (optional):</label>
                    <div className="flex gap-1 text-text-muted">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className={`hover:scale-110 transition-transform ${
                            star <= selectedRating ? 'text-yellow-500' : 'text-text-subtle'
                          }`}
                        >
                          <Star className="h-4.5 w-4.5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Ask a question or provide constructive feedback on this setup..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all resize-none"
                    />
                    <button
                      type="submit"
                      className="absolute bottom-3 right-3 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/25 hover:bg-brand-green hover:text-black hover:border-brand-green p-1.5 transition-all"
                      title="Post Feedback"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {feedbackError && <p className="text-[10px] text-red-500">{feedbackError}</p>}
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-bg-secondary border-t border-border-theme px-6 py-4 flex justify-end">
              <button
                onClick={() => { setSelectedTrade(null); setFeedbackError(''); }}
                className="rounded-lg bg-bg-input border border-border-theme text-text-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-bg-hover transition-all"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── AI INSIGHTS & COACH ── */}
      {journalSubTab === 'ai' && (
        <div className="space-y-6 animate-fade-in">
          {(() => {
            const wins = journals.filter(j => j.pnl > 0);
            const losses = journals.filter(j => j.pnl <= 0);
            const totalTrades = journals.length;
            const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100) : 0;
            const totalPnl = journals.reduce((sum, j) => sum + j.pnl, 0);
            const avgRR = journals.filter(j => j.riskReward).reduce((s, j) => s + (j.riskReward || 0), 0) / (journals.filter(j => j.riskReward).length || 1);

            // Session stats
            const sessionStats = (['Asian', 'London', 'New York'] as const).map(ses => {
              const trades = journals.filter(j => j.session === ses);
              const sesWins = trades.filter(j => j.pnl > 0);
              const wr = trades.length > 0 ? ((sesWins.length / trades.length) * 100) : 0;
              const pnl = trades.reduce((s, j) => s + j.pnl, 0);
              return { session: ses, trades: trades.length, winRate: wr, pnl };
            });

            // Emotion stats
            const emotionStats = (['calm', 'confident', 'anxious', 'fomo', 'revenge', 'frustrated', 'neutral'] as const).map(emo => {
              const trades = journals.filter(j => j.emotion === emo);
              const emoWins = trades.filter(j => j.pnl > 0);
              const wr = trades.length > 0 ? ((emoWins.length / trades.length) * 100) : 0;
              const pnl = trades.reduce((s, j) => s + j.pnl, 0);
              return { emotion: emo, trades: trades.length, winRate: wr, pnl };
            }).filter(e => e.trades > 0);

            // Setup stats
            const setupStats = (['Supply Zone', 'Demand Zone', 'FVG Fill', 'Breakout', 'Breakdown', 'Scalp', 'Trend Follow', 'Mean Reversion', 'News Trade', 'Liquidity Sweep', 'Order Block', 'Other'] as const).map(s => {
              const trades = journals.filter(j => j.setup === s);
              const sWins = trades.filter(j => j.pnl > 0);
              const wr = trades.length > 0 ? ((sWins.length / trades.length) * 100) : 0;
              const pnl = trades.reduce((s2, j) => s2 + j.pnl, 0);
              return { setup: s, trades: trades.length, winRate: wr, pnl };
            }).filter(s => s.trades > 0);

            // AI Recommendations
            const recommendations: string[] = [];
            const bestSession = sessionStats.filter(s => s.trades >= 2).sort((a, b) => b.winRate - a.winRate)[0];
            const worstSession = sessionStats.filter(s => s.trades >= 2).sort((a, b) => a.winRate - b.winRate)[0];
            if (bestSession && bestSession.winRate > 55) recommendations.push(`🎯 Your best session is **${bestSession.session}** with a ${bestSession.winRate.toFixed(0)}% win rate. Consider focusing more trades here.`);
            if (worstSession && worstSession.winRate < 45 && worstSession.trades >= 2) recommendations.push(`⚠️ Your **${worstSession.session}** session has a low ${worstSession.winRate.toFixed(0)}% win rate. Consider reducing position sizes or skipping this session.`);

            const anxiousTrades = emotionStats.find(e => e.emotion === 'anxious');
            const revengeTrading = emotionStats.find(e => e.emotion === 'revenge');
            const fomoTrading = emotionStats.find(e => e.emotion === 'fomo');
            const calmTrading = emotionStats.find(e => e.emotion === 'calm');
            if (anxiousTrades && anxiousTrades.winRate < 40) recommendations.push(`😰 Trading while **anxious** is costing you — only ${anxiousTrades.winRate.toFixed(0)}% win rate. Step away from charts when feeling anxious.`);
            if (revengeTrading && revengeTrading.trades >= 2) recommendations.push(`🔥 You have ${revengeTrading.trades} **revenge trades** with a ${revengeTrading.winRate.toFixed(0)}% win rate. Implement a cooldown rule after losses.`);
            if (fomoTrading && fomoTrading.winRate < 45) recommendations.push(`📉 **FOMO trades** are underperforming at ${fomoTrading.winRate.toFixed(0)}% win rate. Wait for your setup — don't chase.`);
            if (calmTrading && calmTrading.winRate > 60) recommendations.push(`🧘 When **calm**, you achieve a ${calmTrading.winRate.toFixed(0)}% win rate. Your best edge is emotional discipline.`);

            const bestSetup = setupStats.filter(s => s.trades >= 2).sort((a, b) => b.winRate - a.winRate)[0];
            const worstSetup = setupStats.filter(s => s.trades >= 2).sort((a, b) => a.winRate - b.winRate)[0];
            if (bestSetup) recommendations.push(`✅ Your **${bestSetup.setup}** setup has the highest win rate at ${bestSetup.winRate.toFixed(0)}%. This is your edge — trade it more.`);
            if (worstSetup && worstSetup.winRate < 40) recommendations.push(`❌ Consider dropping the **${worstSetup.setup}** setup (${worstSetup.winRate.toFixed(0)}% win rate). It's not aligned with your strengths.`);

            if (avgRR < 1.5 && totalTrades > 2) recommendations.push(`📊 Your average R:R is ${avgRR.toFixed(1)}. Aim for at least 2:1 risk-to-reward for sustainable profitability.`);
            if (totalTrades === 0) recommendations.push(`📝 Start logging trades to unlock personalized AI insights about your trading patterns.`);

            // AI Chat handler
            const handleAiChat = (question: string) => {
              if (!question.trim()) return;
              const userMsg = { role: 'user' as const, text: question };
              let aiResponse = '';
              const q = question.toLowerCase();

              if (q.includes('session') || q.includes('time')) {
                const best = sessionStats.filter(s => s.trades > 0).sort((a, b) => b.winRate - a.winRate)[0];
                aiResponse = best ? `Based on your data, your best session is **${best.session}** with a ${best.winRate.toFixed(0)}% win rate across ${best.trades} trades ($${best.pnl.toFixed(0)} P&L). I'd recommend focusing your activity there.` : 'You need more trade data across different sessions for me to analyze this.';
              } else if (q.includes('emotion') || q.includes('feel') || q.includes('mental') || q.includes('psychology')) {
                const sorted = emotionStats.sort((a, b) => b.winRate - a.winRate);
                if (sorted.length > 0) {
                  aiResponse = `Here's your emotional breakdown:\n${sorted.map(e => `• **${e.emotion}**: ${e.winRate.toFixed(0)}% win rate (${e.trades} trades, $${e.pnl.toFixed(0)})`).join('\n')}\n\nYour best performance comes when trading with a **${sorted[0].emotion}** mindset.`;
                } else {
                  aiResponse = 'Log more trades with emotion tags to get emotional pattern analysis.';
                }
              } else if (q.includes('setup') || q.includes('strategy') || q.includes('pattern')) {
                const sorted = setupStats.sort((a, b) => b.winRate - a.winRate);
                if (sorted.length > 0) {
                  aiResponse = `Your setup analysis:\n${sorted.map(s => `• **${s.setup}**: ${s.winRate.toFixed(0)}% win rate (${s.trades} trades, $${s.pnl.toFixed(0)})`).join('\n')}\n\n**${sorted[0].setup}** is your strongest setup. Consider prioritizing it.`;
                } else {
                  aiResponse = 'Tag your trades with setup types to unlock setup analysis.';
                }
              } else if (q.includes('risk') || q.includes('r:r') || q.includes('reward')) {
                aiResponse = `Your average Risk:Reward ratio is **${avgRR.toFixed(1)}:1**. ${avgRR >= 2 ? 'Great — you\'re maintaining healthy R:R.' : 'Consider aiming for at least 2:1 R:R for better consistency.'} Total P&L: $${totalPnl.toFixed(0)} across ${totalTrades} trades.`;
              } else if (q.includes('overall') || q.includes('summary') || q.includes('performance')) {
                aiResponse = `**Performance Summary:**\n• Total Trades: ${totalTrades}\n• Win Rate: ${winRate.toFixed(1)}%\n• Total P&L: $${totalPnl.toFixed(0)}\n• Avg R:R: ${avgRR.toFixed(1)}:1\n• Wins: ${wins.length} | Losses: ${losses.length}\n\n${winRate > 50 ? 'You\'re above breakeven — focus on consistency.' : 'Your win rate needs improvement. Review your worst setups and sessions.'}`;
              } else {
                aiResponse = `Based on your ${totalTrades} logged trades:\n• Win Rate: ${winRate.toFixed(1)}%\n• Total P&L: $${totalPnl.toFixed(0)}\n\nTry asking me about your **sessions**, **emotions**, **setups**, **risk management**, or **overall performance** for deeper insights.`;
              }

              setAiChatMessages(prev => [...prev, userMsg, { role: 'ai', text: aiResponse }]);
              setAiChatInput('');
            };

            const quickPrompts = [
              'What is my best trading session?',
              'How do my emotions affect my trading?',
              'Which setup works best for me?',
              'Give me my overall performance summary',
              'How is my risk management?'
            ];

            return totalTrades < 3 ? (
              /* Empty / Demo State */
              <div className="text-center py-16 space-y-6">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 mx-auto">
                  <Brain className="h-10 w-10 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-text-primary">AI Trading Coach</h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto">
                    Log at least <span className="text-purple-400 font-bold">3 trades</span> in your journal to unlock personalized AI insights about your trading patterns, emotional triggers, session profitability, and strategy effectiveness.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary space-y-1">
                    <div className="text-purple-400 text-lg">📊</div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Session Analysis</div>
                    <div className="text-[9px] text-text-muted">Discover your most profitable trading sessions</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary space-y-1">
                    <div className="text-purple-400 text-lg">🧠</div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Emotion Patterns</div>
                    <div className="text-[9px] text-text-muted">See how emotions impact your win rate</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary space-y-1">
                    <div className="text-purple-400 text-lg">💬</div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider">AI Chat Coach</div>
                    <div className="text-[9px] text-text-muted">Ask questions about your performance</div>
                  </div>
                </div>
                <p className="text-xs text-text-muted">You currently have <span className="text-purple-400 font-bold">{totalTrades}</span> trade{totalTrades !== 1 ? 's' : ''} logged. Add {3 - totalTrades} more to begin.</p>
              </div>
            ) : (
              /* Full AI Insights Dashboard */
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border-theme pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">AI Trading Coach</h3>
                    <p className="text-[10px] text-text-muted">Analyzing {totalTrades} trades • Win Rate: {winRate.toFixed(1)}% • P&L: ${totalPnl.toFixed(0)}</p>
                  </div>
                </div>

                {/* Stat Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary text-center">
                    <div className="text-lg font-black text-text-primary">{winRate.toFixed(0)}%</div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Win Rate</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary text-center">
                    <div className={`text-lg font-black ${totalPnl >= 0 ? 'text-brand-green' : 'text-red-500'}`}>${totalPnl.toFixed(0)}</div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total P&L</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary text-center">
                    <div className="text-lg font-black text-text-primary">{avgRR.toFixed(1)}</div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Avg R:R</div>
                  </div>
                  <div className="p-3 rounded-xl border border-border-theme bg-bg-secondary text-center">
                    <div className="text-lg font-black text-text-primary">{totalTrades}</div>
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Trades</div>
                  </div>
                </div>

                {/* Session Performance */}
                <div className="t-card p-4 space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">📊 Session Performance</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {sessionStats.map(s => (
                      <div key={s.session} className="p-3 rounded-lg border border-border-theme bg-bg space-y-1">
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{s.session}</div>
                        <div className={`text-base font-black ${s.winRate >= 50 ? 'text-brand-green' : s.trades > 0 ? 'text-red-400' : 'text-text-muted'}`}>
                          {s.trades > 0 ? `${s.winRate.toFixed(0)}%` : '—'}
                        </div>
                        <div className="text-[9px] text-text-muted">{s.trades} trades • ${s.pnl.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emotion Analysis */}
                {emotionStats.length > 0 && (
                  <div className="t-card p-4 space-y-3">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">🧠 Emotion Impact</h4>
                    <div className="space-y-2">
                      {emotionStats.sort((a, b) => b.winRate - a.winRate).map(e => (
                        <div key={e.emotion} className="flex items-center gap-3 p-2 rounded-lg border border-border-theme bg-bg">
                          <div className="text-xs font-bold text-text-primary capitalize w-20">{e.emotion}</div>
                          <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${e.winRate >= 50 ? 'bg-brand-green' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(e.winRate, 100)}%` }}
                            />
                          </div>
                          <div className={`text-xs font-bold w-12 text-right ${e.winRate >= 50 ? 'text-brand-green' : 'text-red-400'}`}>
                            {e.winRate.toFixed(0)}%
                          </div>
                          <div className="text-[9px] text-text-muted w-16 text-right">{e.trades} trades</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Setup Analysis */}
                {setupStats.length > 0 && (
                  <div className="t-card p-4 space-y-3">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">⚙️ Setup Effectiveness</h4>
                    <div className="space-y-2">
                      {setupStats.sort((a, b) => b.winRate - a.winRate).map(s => (
                        <div key={s.setup} className="flex items-center gap-3 p-2 rounded-lg border border-border-theme bg-bg">
                          <div className="text-xs font-bold text-text-primary w-28 truncate">{s.setup}</div>
                          <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${s.winRate >= 50 ? 'bg-purple-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(s.winRate, 100)}%` }}
                            />
                          </div>
                          <div className={`text-xs font-bold w-12 text-right ${s.winRate >= 50 ? 'text-purple-400' : 'text-red-400'}`}>
                            {s.winRate.toFixed(0)}%
                          </div>
                          <div className="text-[9px] text-text-muted w-16 text-right">${s.pnl.toFixed(0)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <div className="t-card p-4 space-y-3 border-l-2 border-purple-500/50">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">💡 AI Recommendations</h4>
                    <div className="space-y-2">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="text-xs text-text-secondary leading-relaxed p-2 rounded-lg bg-bg border border-border-theme">
                          {rec.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-text-primary">{part}</strong> : part)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive AI Coach Chatbox */}
                <div className="t-card p-4 space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-purple-400" />
                    Ask Your AI Coach
                  </h4>

                  {/* Quick Prompts */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAiChat(prompt)}
                        className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 transition-all uppercase tracking-wider"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Chat Messages */}
                  {aiChatMessages.length > 0 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {aiChatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-bg-secondary text-text-secondary border border-border-theme'
                          }`}>
                            {msg.text.split('\n').map((line, li) => (
                              <div key={li}>
                                {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-text-primary">{part}</strong> : part)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAiChat(aiChatInput); }}
                      placeholder="Ask about your trading patterns..."
                      className="t-input flex-1 text-xs py-2 px-3"
                    />
                    <button
                      onClick={() => handleAiChat(aiChatInput)}
                      disabled={!aiChatInput.trim()}
                      className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/20 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {/* ── STREAK SIMULATOR ── */}
      {journalSubTab === 'streak' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex items-center gap-3 border-b border-border-theme pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-brand-green/20">
              <Award className="h-5 w-5 text-brand-green" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Journaling Streak Simulator</h3>
              <p className="text-[10px] text-text-muted">Simulate and analyze your trading consistency, habits, and discipline scores.</p>
            </div>
          </div>
          <StreakSimulator 
            journals={activeJournals} 
            currentUser={currentUser}
            onRefresh={() => {
              if (currentUser?.loggedIn) {
                setJournals(db.getJournals(currentUser.username));
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
