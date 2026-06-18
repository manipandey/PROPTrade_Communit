// src/components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
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
      
      const result = db.registerUser(targetEmail, username, password, isDemoAccount);

      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }

      // Auto-login after successful registration
      db.setCurrentUser({
        username,
        email: targetEmail,
        avatar: username.slice(0, 2).toUpperCase(),
        loggedIn: true,
        isDemo: isDemoAccount
      });

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

      const result = db.authenticateUser(email, password);

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
        return;
      }

      // Set current user session
      db.setCurrentUser({
        username: result.username!,
        email,
        avatar: result.avatar!,
        loggedIn: true,
        isDemo: result.isDemo
      });

      setSuccessMessage(`Welcome back, ${result.username}! ✨`);
      setTimeout(() => {
        onAuthSuccess(result.username!);
        onClose();
        resetForm();
      }, 1000);
    }
  };

  const handleQuickLogin = (role: 'FTMO_Champ' | 'GoldHunter' | 'NepaliScalper' | 'admin') => {
    const avatarMap: Record<string, string> = {
      FTMO_Champ: '⚡',
      GoldHunter: '💰',
      NepaliScalper: '🦅',
      admin: '👑'
    };
    
    const isDemo = role !== 'admin';
    const email = role === 'admin' ? 'admin@propnepal.com' : `${role.toLowerCase()}@propnepal.com`;
    const users = db.getRegisteredUsers();
    if (!users.some(u => u.email === email)) {
      db.registerUser(email, role, role === 'admin' ? 'admin123' : 'demo1234', isDemo);
    }
    
    db.setCurrentUser({
      username: role,
      email,
      avatar: avatarMap[role] || '👤',
      loggedIn: true,
      isDemo
    });

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
