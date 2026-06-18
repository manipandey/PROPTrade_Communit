// src/components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
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
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Inline validation helpers
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setIsDemoAccount(false);
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // 1. Common Validation: Password check
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp) {
      // ── SIGN UP FLOW ──
      if (!username) {
        setError('Please enter a username.');
        return;
      }
      if (!isValidUsername(username)) {
        setError('Username must be 3–20 characters, using only letters, numbers, and underscores.');
        return;
      }

      if (!isDemoAccount) {
        if (!email) {
          setError('Please enter an email address.');
          return;
        }
        if (!isValidEmail(email)) {
          setError('Please enter a valid email address.');
          return;
        }
      }

      const targetEmail = isDemoAccount ? `demo_${username.toLowerCase()}_${Date.now()}@propnepal.com` : email;
      
      const result = await api.register(targetEmail, username, password, isDemoAccount);

      if (!result.success) {
        setError(result.message || 'Registration failed. Please try again.');
        return;
      }

      setSuccessMessage(`Account ${username} created successfully! 🎉`);
      setTimeout(() => {
        onAuthSuccess(username);
        onClose();
        resetForm();
      }, 1000);

    } else {
      // ── LOGIN FLOW ──
      if (!email) {
        setError('Please enter your email.');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      const result = await api.login(email, password);

      if (!result.success) {
        setError(result.message || 'Login failed. Please try again.');
        return;
      }

      setSuccessMessage(`Welcome back, ${result.user?.username}! ✨`);
      setTimeout(() => {
        onAuthSuccess(result.user?.username || email);
        onClose();
        resetForm();
      }, 1000);
    }
  };

  const handleQuickLogin = async (role: 'FTMO_Champ' | 'GoldHunter' | 'NepaliScalper' | 'admin') => {
    const avatarMap: Record<string, string> = {
      FTMO_Champ: '⚡',
      GoldHunter: '💰',
      NepaliScalper: '🦅',
      admin: '👑'
    };
    
    const isDemo = role !== 'admin';
    const emailToUse = role === 'admin' ? 'admin@propnepal.com' : `${role.toLowerCase()}@propnepal.com`;
    
    // Attempt login
    const res = await api.login(emailToUse, role === 'admin' ? 'admin123' : 'demo1234');
    if (!res.success) {
      // If fails, try to register them
      await api.register(emailToUse, role, role === 'admin' ? 'admin123' : 'demo1234', isDemo);
      await api.login(emailToUse, role === 'admin' ? 'admin123' : 'demo1234');
    }

    setSuccessMessage(role === 'admin' ? 'Logged in as Admin! 👑' : `Logged in as demo trader ${role}!`);
    setTimeout(() => {
      onAuthSuccess(role);
      onClose();
      resetForm();
    }, 800);
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setIsDemoAccount(false);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl p-8 shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        
        {/* Close Button */}
        <button
          onClick={() => { onClose(); resetForm(); }}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Overlay */}
        {successMessage && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-fade-in" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="rounded-full p-4 mb-4" style={{ backgroundColor: 'var(--accent-light)' }}>
              <CheckCircle className="h-10 w-10" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-lg font-bold text-center px-4" style={{ color: 'var(--text-primary)' }}>{successMessage}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Redirecting you in...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isSignUp ? 'Join PropNepal' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isSignUp 
              ? 'Connect with top Nepalese traders & share payouts' 
              : 'Log in to write posts, log journals, and check reviews'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-200 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Username</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: 'var(--text-muted)' }}>
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. NepalPips"
                  className="t-input w-full py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>
          )}

          {(!isSignUp || !isDemoAccount) && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email Address</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: 'var(--text-muted)' }}>
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="t-input w-full py-2.5 pl-10 pr-4 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: 'var(--text-muted)' }}>
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="t-input w-full py-2.5 pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-text-primary transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary mt-2 w-full py-3 text-sm"
          >
            {isSignUp ? (isDemoAccount ? 'Create Demo Profile' : 'Create Trading Account') : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 mb-5 flex items-center justify-center">
          <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }}></div>
          <span className="px-3 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Or continue with</span>
          <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }}></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => api.loginWithOAuth('google')}
            className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => api.loginWithOAuth('github')}
            className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>



        {/* Footer Toggle */}
        <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={switchMode}
            className="font-bold hover:underline focus:outline-none"
            style={{ color: 'var(--accent)' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
