// src/components/LearningHub.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Award, X, Lock, Crown, Clock, TrendingUp, Target, Gem, Send, Eye, ChevronRight } from 'lucide-react';
import { db, CourseModule, Lesson, PremiumStrategy, PremiumAccess } from '@/lib/supabase';

interface QuizQuestion {
  question: string;
  options: { text: string; type: 'scalp' | 'swing' | 'macro' }[];
}

interface LearningHubProps {
  currentUser: { id?: string; username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string; } | null;
  onOpenAuth: () => void;
}

export default function LearningHub({ currentUser, onOpenAuth }: LearningHubProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; moduleTitle: string } | null>(null);

  // Premium Strategies state
  const [hubTab, setHubTab] = useState<'free' | 'premium'>('free');
  const [strategies, setStrategies] = useState<PremiumStrategy[]>([]);
  const [userAccess, setUserAccess] = useState<PremiumAccess | undefined>(undefined);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<PremiumStrategy | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [esewaTransId, setEsewaTransId] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  // Load modules dynamically from mock db
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setModules(db.getAcademyModules());
    setStrategies(db.getPremiumStrategies());
    if (currentUser?.loggedIn) {
      setHasAccess(db.hasVerifiedAccess(currentUser.username));
      setUserAccess(db.getUserAccessStatus(currentUser.username));
    } else {
      setHasAccess(false);
      setUserAccess(undefined);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [currentUser]);

  // Quiz States
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ title: string; desc: string; tip: string } | null>(null);

  const quizQuestions: QuizQuestion[] = [
    {
      question: 'How long do you typically prefer to hold an active trading position?',
      options: [
        { text: 'A few seconds to a couple of minutes', type: 'scalp' },
        { text: 'A few hours, usually closing before the session ends', type: 'swing' },
        { text: 'Multiple days or weeks, aligning with weekly macroeconomic trends', type: 'macro' }
      ]
    },
    {
      question: 'What is your absolute maximum risk per individual trade setup?',
      options: [
        { text: 'Extremely small (0.25% to 0.5% max)', type: 'scalp' },
        { text: 'Moderate (0.5% to 1.0% max)', type: 'swing' },
        { text: 'High (1.0% to 2.0% with wider stop loss)', type: 'macro' }
      ]
    },
    {
      question: 'Which instrument class do you naturally trade or feel most comfortable with?',
      options: [
        { text: 'High volatility indices (US30, NAS100)', type: 'scalp' },
        { text: 'Major commodity assets (XAUUSD/Gold)', type: 'swing' },
        { text: 'Major currency pairs (EURUSD, GBPUSD)', type: 'macro' }
      ]
    }
  ];

  const handleAnswer = (type: 'scalp' | 'swing' | 'macro') => {
    const updatedAnswers = [...answers, type];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate Result
      const counts = updatedAnswers.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let dominantStyle: 'scalp' | 'swing' | 'macro' = 'swing';
      let maxCount = 0;
      for (const key in counts) {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          dominantStyle = key as 'scalp' | 'swing' | 'macro';
        }
      }

      const resultsMap = {
        scalp: {
          title: 'High-Discipline Scalper',
          desc: 'You thrive in fast-paced session openings, capturing quick structural pips under extremely tight drawdown restrictions. Your strength is high reaction speeds.',
          tip: 'Tip: For scalpers, avoid equity-based drawdown firms. FundedNext balance-based model or The 5%ers are highly recommended to prevent premature account locks due to floating positions!'
        },
        swing: {
          title: 'Precision Price Action Swing Trader',
          desc: 'You have high patience, waiting for key liquidity sweeps and session highs/lows before entering. You rely heavily on structural risk-to-reward ratio setups.',
          tip: 'Tip: FTMO standard evaluations are ideal for swing traders. Use a 1:3 minimum risk-to-reward ratio to ensure a single win can clear 30% of your Phase 1 profit target.'
        },
        macro: {
          title: 'Strategic Macro Analyst',
          desc: 'You analyze fundamental policies, interest rates, and higher-timeframe structures. You prefer large, clean trends.',
          tip: 'Tip: Be careful with prop firms that enforce "no weekend holding" rules. Choose a Swing Account type (like FTMO Swing) which permits holding setups over Saturday and Sunday.'
        }
      };

      setQuizResult(resultsMap[dominantStyle]);
    }
  };

  const resetQuiz = () => {
    setQuizActive(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizResult(null);
  };

  const handleSubmitPayment = () => {
    if (!currentUser?.loggedIn || !esewaTransId.trim()) return;
    db.requestPremiumAccess(currentUser.username, esewaTransId.trim());
    setPaymentSubmitted(true);
    setUserAccess(db.getUserAccessStatus(currentUser.username));
  };

  const assetColorMap: Record<string, string> = {
    'XAUUSD': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'NAS100': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'EURUSD': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'GBPUSD': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'US30': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Learning <span className="text-brand-green">Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          PropNepal Academy. Structured guidelines and educational tracks specifically designed to teach traders how to clear evaluations and scale funded accounts.
        </p>
      </div>

      {/* Hub Tab Navigation */}
      <div className="flex border border-border-theme bg-bg-input/45 p-1 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => setHubTab('free')}
          className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            hubTab === 'free'
              ? 'bg-bg-secondary text-text-primary border border-border-theme shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Free Academy
        </button>
        <button
          onClick={() => setHubTab('premium')}
          className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            hubTab === 'premium'
              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-400 border border-yellow-500/20 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          Premium Strategies
        </button>
      </div>

      {/* ═══════════════ FREE ACADEMY TAB ═══════════════ */}
      {hubTab === 'free' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Academy Course Modules */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 border-b border-border-theme pb-3">
                <GraduationCap className="h-5 w-5 text-brand-green" />
                <span>Funded Trader Curriculum</span>
              </h3>

              <div className="space-y-4">
                {modules.map((mod) => {
                  const isSelected = selectedModule === mod.id;
                  
                  return (
                    <div
                      key={mod.id}
                      className={`rounded-xl border transition-all duration-300 p-5 ${
                        isSelected 
                          ? 'border-brand-green/30 bg-bg-input' 
                          : 'border-border-theme bg-bg-card hover:border-border-hover'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                          {mod.level}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">{mod.duration}</span>
                      </div>

                      <h4 className="text-sm font-bold text-text-primary mt-2.5">{mod.title}</h4>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">{mod.desc}</p>

                      <button
                        onClick={() => setSelectedModule(isSelected ? null : mod.id)}
                        className="mt-4 text-[10px] font-bold uppercase tracking-wider text-brand-green hover:underline flex items-center gap-1"
                      >
                        <span>{isSelected ? 'Collapse Lessons' : 'View Course Outline'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>

                      {/* Expanded Lessons list */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-border-theme/60 space-y-2 animate-fade-in">
                          {mod.lessons.map((lesson, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedLesson({ lesson, moduleTitle: mod.title })}
                              className="w-full flex items-center justify-between rounded-lg bg-bg-secondary/40 border border-border-theme/40 p-2.5 text-xs text-text-secondary hover:border-brand-green hover:bg-bg-hover/40 transition-all text-left"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <CheckCircle2 className="h-4 w-4 text-brand-green flex-shrink-0" />
                                <span className="truncate font-medium text-text-primary">{lesson.title}</span>
                              </div>
                              <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider flex-shrink-0 ml-2">Open Lesson &rarr;</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Interactive Personality Quiz */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border-theme bg-bg-card p-6 space-y-4 glow-accent">
                
                {/* Initial Screen */}
                {!quizActive && !quizResult && (
                  <div className="space-y-4 text-center py-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                        Trading Style Evaluator
                      </h3>
                      <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Take this short 3-question profile evaluation to identify your dominant strategy style, risk alignment, and receive localized prop firm scaling tips.
                      </p>
                    </div>
                    <button
                      onClick={() => setQuizActive(true)}
                      className="rounded-lg bg-brand-green px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all glow-accent"
                    >
                      Start Assessment
                    </button>
                  </div>
                )}

                {/* Active Quiz Question */}
                {quizActive && !quizResult && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                      <span>TRADING ASSESSMENT</span>
                      <span>QUESTION {currentQuestionIndex + 1} OF {quizQuestions.length}</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-text-primary leading-snug">
                      {quizQuestions[currentQuestionIndex].question}
                    </h4>

                    <div className="space-y-2 pt-2">
                      {quizQuestions[currentQuestionIndex].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(opt.type)}
                          className="w-full text-left rounded-lg border border-border-theme bg-bg-input/40 p-3 text-xs text-text-secondary hover:border-brand-green hover:text-text-primary hover:bg-bg-hover/40 transition-all"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results Screen */}
                {quizResult && (
                  <div className="space-y-4 animate-fade-in py-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                      <Award className="h-6 w-6" />
                    </div>
                    
                    <div className="text-center space-y-1.5">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Your Dominant Profile</div>
                      <h4 className="text-base font-black text-text-primary uppercase tracking-tight font-sans text-glow">
                        {quizResult.title}
                      </h4>
                    </div>

                    <p className="text-xs text-text-secondary text-center leading-relaxed">
                      {quizResult.desc}
                    </p>

                    <div className="rounded-lg bg-brand-green/5 border border-brand-green/20 p-4 text-xs text-text-secondary leading-relaxed space-y-1 shadow-[0_0_15px_rgba(34,197,94,0.02)]">
                      <div className="font-bold text-brand-green uppercase tracking-wider text-[10px]">PropNepal Strategic Guide:</div>
                      <p>{quizResult.tip}</p>
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={resetQuiz}
                        className="rounded-lg border border-border-theme bg-bg-input hover:border-brand-green px-5 py-2 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-all"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lesson Details Modal */}
          {selectedLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b border-border-theme/40 pb-3 mb-4 flex-shrink-0">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green">
                      {selectedLesson.moduleTitle}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary mt-1">
                      {selectedLesson.lesson.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable Modal Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Media Player/Viewer if media exists */}
                  {selectedLesson.lesson.mediaUrl && (
                    <div className="rounded-xl border border-border-theme overflow-hidden bg-bg-secondary/40 flex items-center justify-center w-full max-h-[300px] mb-4">
                      {selectedLesson.lesson.mediaType === 'video' ? (
                        <video
                          src={selectedLesson.lesson.mediaUrl}
                          className="w-full max-h-[300px] object-contain"
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedLesson.lesson.mediaUrl}
                          alt={selectedLesson.lesson.title}
                          className="w-full max-h-[300px] object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Rich Lesson Content Text */}
                  <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.lesson.content}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border-theme/40 pt-3 mt-4 flex justify-end flex-shrink-0">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="rounded-lg bg-brand-green text-black font-bold uppercase tracking-wider text-[11px] px-5 py-2 hover:bg-brand-green/90 transition-all cursor-pointer"
                  >
                    Close Lesson
                  </button>
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ PREMIUM STRATEGIES TAB ═══════════════ */}
      {hubTab === 'premium' && (
        <div className="space-y-8 animate-fade-in">

          {/* Premium Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 p-8 sm:p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(245,158,11,0.04) 50%, rgba(217,119,6,0.08) 100%)'
            }}
          >
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(234,179,8,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245,158,11,0.3) 0%, transparent 50%)' }} />
            <div className="relative z-10 space-y-4 max-w-xl mx-auto">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/20 mx-auto">
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight">
                Premium <span className="text-yellow-400">Trading Strategies</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Access my personally tested, profitable strategies with detailed entry rules, risk management protocols, and prop firm evaluation tips. Each strategy includes step-by-step breakdown.
              </p>
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Clock className="h-3.5 w-3.5 text-yellow-400" />
                  <span><strong className="text-text-primary">3 Months</strong> Access</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Target className="h-3.5 w-3.5 text-yellow-400" />
                  <span><strong className="text-text-primary">{strategies.length}</strong> Strategies</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-yellow-400" />
                  <span><strong className="text-text-primary">68-76%</strong> Win Rate</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-500/20 rounded-xl px-5 py-2.5 text-yellow-400 font-black text-lg">
                <span>Rs 5,000</span>
                <span className="text-[9px] font-bold text-yellow-400/60 uppercase">/ 3 months</span>
              </div>
            </div>
          </div>

          {/* Access Status Badge */}
          {currentUser?.loggedIn && userAccess && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              userAccess.status === 'verified'
                ? 'border-brand-green/30 bg-brand-green/5'
                : userAccess.status === 'pending'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                userAccess.status === 'verified'
                  ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                  : userAccess.status === 'pending'
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {userAccess.status === 'verified' ? '✅ Verified' : userAccess.status === 'pending' ? '⏳ Pending Verification' : '❌ Rejected'}
              </div>
              <span className="text-xs text-text-secondary">
                {userAccess.status === 'verified'
                  ? 'You have full access to all premium strategies.'
                  : userAccess.status === 'pending'
                    ? 'Your payment is being verified by admin. This usually takes a few hours.'
                    : 'Your payment was rejected. Please contact admin or try again with a valid transaction ID.'}
              </span>
            </div>
          )}

          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {strategies.map((strat) => {
              const isLocked = !hasAccess;
              const colorClass = assetColorMap[strat.asset] || 'text-text-primary bg-bg-secondary border-border-theme';
              
              return (
                <div
                  key={strat.id}
                  className={`relative rounded-xl border transition-all duration-300 overflow-hidden group ${
                    isLocked
                      ? 'border-border-theme bg-bg-card'
                      : 'border-yellow-500/20 bg-bg-card hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/5'
                  }`}
                >
                  {/* Strategy Image */}
                  {strat.imageUrl && (
                    <div className="relative h-36 w-full overflow-hidden bg-bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={strat.imageUrl}
                        alt={strat.title}
                        className={`w-full h-full object-cover transition-all duration-500 ${isLocked ? 'blur-sm scale-105' : 'group-hover:scale-105'}`}
                      />
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                          {strat.isComingSoon ? (
                            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 font-extrabold uppercase tracking-widest text-[9px] shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Coming Soon</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                              <Lock className="h-3.5 w-3.5 text-yellow-400" />
                              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Premium</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Asset & Timeframe Tags */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colorClass}`}>
                        {strat.asset}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted bg-bg-secondary border border-border-theme px-2 py-0.5 rounded">
                        {strat.timeframe}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-text-primary leading-snug">{strat.title}</h4>

                    {/* Preview Text */}
                    <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">
                      {strat.previewText}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <TrendingUp className="h-3 w-3 text-brand-green" />
                        <span className="font-bold text-brand-green">{strat.winRate}</span>
                        <span className="text-text-muted">Win Rate</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <Target className="h-3 w-3 text-purple-400" />
                        <span className="font-bold text-purple-400">{strat.riskReward}</span>
                        <span className="text-text-muted">R:R</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {strat.isComingSoon ? (
                      <button
                        disabled
                        className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-bg-secondary border border-border-theme/40 px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider cursor-not-allowed"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Coming Soon
                      </button>
                    ) : hasAccess ? (
                      <button
                        onClick={() => setSelectedStrategy(strat)}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 px-4 py-2.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider hover:from-yellow-500/20 hover:to-amber-500/20 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Full Strategy
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser?.loggedIn) {
                            onOpenAuth();
                          } else {
                            setShowPaymentModal(true);
                          }
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-bg-secondary border border-border-theme px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:border-yellow-500/30 hover:text-yellow-400 transition-all"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Unlock Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* How It Works Section */}
          {!hasAccess && (
            <div className="rounded-xl border border-border-theme bg-bg-card p-6 space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Gem className="h-4 w-4 text-yellow-400" />
                How to Unlock Premium Strategies
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex gap-3 p-3 rounded-lg border border-border-theme bg-bg-secondary/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 font-black text-sm flex-shrink-0 border border-yellow-400/20">1</div>
                  <div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-sans">Pay via eSewa</div>
                    <div className="text-[9px] text-text-muted mt-0.5">Send Rs 5,000 to our eSewa number</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg border border-border-theme bg-bg-secondary/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 font-black text-sm flex-shrink-0 border border-yellow-400/20">2</div>
                  <div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-sans">Submit Transaction ID</div>
                    <div className="text-[9px] text-text-muted mt-0.5">Enter your eSewa transaction ID here</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg border border-border-theme bg-bg-secondary/40">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 font-black text-sm flex-shrink-0 border border-yellow-400/20">3</div>
                  <div>
                    <div className="text-[10px] font-bold text-text-primary uppercase tracking-wider font-sans">Get Verified</div>
                    <div className="text-[9px] text-text-muted mt-0.5">Admin verifies & unlocks 3-month access</div>
                  </div>
                </div>
              </div>

              {!currentUser?.loggedIn ? (
                <button
                  onClick={onOpenAuth}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold uppercase tracking-wider text-xs py-3 hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Login to Purchase
                </button>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold uppercase tracking-wider text-xs py-3 hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Pay Rs 5,000 via eSewa
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ESEWA PAYMENT MODAL ═══════════════ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            
            {/* Modal Header */}
            <div className="p-6 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
                  <span className="text-lg">💚</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Pay via eSewa</h3>
                  <p className="text-[10px] text-text-muted">Complete payment to unlock premium strategies</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setPaymentSubmitted(false); setEsewaTransId(''); }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!paymentSubmitted ? (
                <>
                  {/* Payment Details */}
                  <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Amount</span>
                      <span className="text-lg font-black text-green-400">Rs 5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-bold text-text-primary">3 Months Access</span>
                    </div>
                    <div className="border-t border-green-500/10 pt-3">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Send to eSewa Number</div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-green-400 font-mono tracking-wider">9861292959</span>
                        <button
                          onClick={() => navigator.clipboard.writeText('9861292959')}
                          className="text-[8px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded uppercase tracking-wider hover:bg-green-400/20 transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <ChevronRight className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Open your eSewa app and send <strong className="text-text-primary">Rs 5,000</strong> to <strong className="text-green-400">9861292959</strong></span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <ChevronRight className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>After successful payment, copy your <strong className="text-text-primary">Transaction ID</strong> from the eSewa receipt</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-text-secondary">
                      <ChevronRight className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Paste the transaction ID below and submit for verification</span>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">eSewa Transaction ID</label>
                    <input
                      type="text"
                      value={esewaTransId}
                      onChange={(e) => setEsewaTransId(e.target.value)}
                      placeholder="e.g. 0007ABC123XYZ"
                      className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 px-3 text-xs text-text-primary focus:border-green-500 focus:outline-none font-mono tracking-wider"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitPayment}
                    disabled={!esewaTransId.trim()}
                    className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold uppercase tracking-wider text-xs py-3 hover:from-green-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit for Verification
                  </button>
                </>
              ) : (
                /* Success Confirmation */
                <div className="text-center space-y-4 py-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-text-primary">Payment Submitted!</h4>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Your eSewa transaction ID has been submitted. The admin will verify your payment and unlock access within a few hours.
                    </p>
                  </div>
                  <div className="text-[10px] text-text-muted bg-bg-secondary border border-border-theme rounded-lg px-3 py-2 font-mono">
                    Transaction ID: <span className="text-text-primary font-bold">{esewaTransId}</span>
                  </div>
                  <button
                    onClick={() => { setShowPaymentModal(false); setPaymentSubmitted(false); setEsewaTransId(''); }}
                    className="rounded-lg border border-border-theme bg-bg-input px-5 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ FULL STRATEGY DETAIL MODAL ═══════════════ */}
      {selectedStrategy && hasAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border-theme/40 p-6 flex-shrink-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${assetColorMap[selectedStrategy.asset] || 'text-text-primary bg-bg-secondary border-border-theme'}`}>
                    {selectedStrategy.asset}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted bg-bg-secondary border border-border-theme px-2 py-0.5 rounded">
                    {selectedStrategy.timeframe}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                    {selectedStrategy.winRate} Win Rate
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded">
                    {selectedStrategy.riskReward} R:R
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary">{selectedStrategy.title}</h3>
                <p className="text-xs text-text-secondary">{selectedStrategy.description}</p>
              </div>
              <button
                onClick={() => setSelectedStrategy(null)}
                className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 ml-4"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Strategy Image */}
              {selectedStrategy.imageUrl && (
                <div className="rounded-xl border border-border-theme overflow-hidden bg-bg-secondary/40 w-full max-h-[250px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedStrategy.imageUrl}
                    alt={selectedStrategy.title}
                    className="w-full max-h-[250px] object-contain"
                  />
                </div>
              )}

              {/* Full Strategy Content */}
              <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/[0.02] p-5">
                <div className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedStrategy.content}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border-theme/40 p-4 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold uppercase tracking-wider text-[11px] px-5 py-2 hover:from-yellow-400 hover:to-amber-400 transition-all"
              >
                Close Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
