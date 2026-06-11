// src/components/LearningHub.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Award, X } from 'lucide-react';
import { db, CourseModule, Lesson } from '@/lib/supabase';

interface QuizQuestion {
  question: string;
  options: { text: string; type: 'scalp' | 'swing' | 'macro' }[];
}

export default function LearningHub() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; moduleTitle: string } | null>(null);

  // Load modules dynamically from mock db
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setModules(db.getAcademyModules());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

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
    </div>
  );
}
