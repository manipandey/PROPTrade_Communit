// src/components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles } from 'lucide-react';
import { db } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (username: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !username)) {
      setError('Please fill in all required fields.');
      return;
    }

    const finalUsername = isSignUp ? username : email.split('@')[0];
    const userAvatar = finalUsername.slice(0, 2).toUpperCase();

    // Save to simulated database
    db.setCurrentUser({
      username: finalUsername,
      email,
      avatar: userAvatar,
      loggedIn: true
    });

    onAuthSuccess(finalUsername);
    onClose();
  };

  const handleQuickLogin = (role: 'FTMO_Champ' | 'GoldHunter' | 'NepaliScalper') => {
    const avatarMap: Record<string, string> = {
      FTMO_Champ: '⚡',
      GoldHunter: '💰',
      NepaliScalper: '🦅'
    };
    
    db.setCurrentUser({
      username: role,
      email: `${role.toLowerCase()}@propnepal.com`,
      avatar: avatarMap[role] || '👤',
      loggedIn: true
    });

    onAuthSuccess(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0f] p-8 shadow-2xl glow-accent">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? 'Join PropNepal' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {isSignUp 
              ? 'Connect with top Nepalese traders & share payouts' 
              : 'Log in to write posts, log journals, and check reviews'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-center text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Username</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. NepalPips"
                  className="w-full rounded-lg border border-zinc-800 bg-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-800 bg-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-black py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-brand-green py-3 text-sm font-bold text-black hover:bg-brand-green/90 transition-all glow-accent"
          >
            {isSignUp ? 'Create Trading Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 border-t border-zinc-800 pt-6">
          <div className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Or test with a demo profile
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('FTMO_Champ')}
              className="rounded-lg border border-zinc-800 bg-black/50 py-2 text-center text-xs text-zinc-300 hover:border-brand-green hover:text-white transition-all"
            >
              ⚡ FTMO Champ
            </button>
            <button
              onClick={() => handleQuickLogin('GoldHunter')}
              className="rounded-lg border border-zinc-800 bg-black/50 py-2 text-center text-xs text-zinc-300 hover:border-brand-green hover:text-white transition-all"
            >
              💰 Gold Hunter
            </button>
            <button
              onClick={() => handleQuickLogin('NepaliScalper')}
              className="rounded-lg border border-zinc-800 bg-black/50 py-2 text-center text-xs text-zinc-300 hover:border-brand-green hover:text-white transition-all"
            >
              🦅 Nepal Scalper
            </button>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-sm text-zinc-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-brand-green hover:underline focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
