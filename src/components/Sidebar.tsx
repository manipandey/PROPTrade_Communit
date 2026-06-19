// src/components/Sidebar.tsx
'use client';

import React from 'react';
import {
  Home, Users, Trophy, BookOpen,
  Shield, GraduationCap, LogIn, LogOut, Sun, Moon, Trash2, Menu, X, LineChart, ShieldCheck, Gamepad2, MessageSquare, Globe
} from 'lucide-react';
import { db } from '@/lib/supabase';

interface SidebarProps {
  currentUser: { id?: string; username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string; } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const NAV_ITEMS = [
  { id: 'home',        label: 'Home',             icon: Home },
  { id: 'journals',    label: 'Trading Journals',  icon: BookOpen },
  { id: 'community',   label: 'Community Feed',    icon: Globe },
  { id: 'communities', label: 'Instrument Groups', icon: MessageSquare },
  { id: 'tools',       label: 'Trading Tools',     icon: LineChart },
  { id: 'game',        label: 'Trading Arcade',    icon: Gamepad2 },
  { id: 'profiles',    label: 'Top Traders',       icon: Users },
  { id: 'payouts',     label: 'Performance Fees',   icon: Trophy },
  { id: 'reviews',     label: 'Prop Firm Reviews', icon: Shield },
  { id: 'academy',     label: 'Learning Hub',      icon: GraduationCap },
  { id: 'admin',       label: 'Admin Panel',       icon: ShieldCheck }
];

export default function Sidebar({
  currentUser, activeTab, setActiveTab, onOpenAuth, onLogout,
  theme, onToggleTheme, mobileOpen, onMobileToggle
}: SidebarProps) {

  const handleNav = (id: string) => {
    setActiveTab(id);
    onMobileToggle(); // close on mobile
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => handleNav('home')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" className="h-9 w-9 object-contain" alt="AlphaJournal Logo" />
          <div>
            <div className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Alpha<span style={{ color: 'var(--accent)' }}>Journal</span>
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Learn, Record, Connect
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(({ id }) => {
          if (id === 'admin') {
            return currentUser?.loggedIn && currentUser.username === 'admin';
          }
          return true;
        }).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNav(id)}
            className={`nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}
          >
            <Icon
              className="h-4 w-4 flex-shrink-0"
              strokeWidth={activeTab === id ? 2.5 : 2}
            />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="nav-item w-full text-left"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 flex-shrink-0 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 flex-shrink-0 text-indigo-500" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User Section */}
        {currentUser?.loggedIn ? (
          <div
            className="rounded-xl p-3 space-y-2.5"
            style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: currentUser.isDemo ? 'rgba(234,179,8,0.1)' : 'var(--accent-light)',
                  color: currentUser.isDemo ? '#ca8a04' : 'var(--accent)',
                  border: `1px solid ${currentUser.isDemo ? 'rgba(234,179,8,0.2)' : 'var(--accent-border)'}`,
                }}
              >
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.username}
                  {currentUser.isDemo && (
                    <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.2)' }}>
                      Demo
                    </span>
                  )}
                </div>
                <div className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {currentUser.isDemo ? 'Demo Profile' : 'Pro Trader'}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {currentUser.isDemo && (
                <button
                  onClick={() => {
                    if (confirm('Delete this demo account? This cannot be undone.')) {
                      db.deleteUserAccount(currentUser.username);
                      onLogout();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{ backgroundColor: 'var(--red-light)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
                  title="Delete Demo Account"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                title="Log Out"
              >
                <LogOut className="h-3 w-3" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary w-full"
            id="sidebar-connect-btn"
          >
            <LogIn className="h-4 w-4" />
            Connect Account
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0 z-30"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          transition: 'background-color 0.2s ease',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" className="h-8 w-8 object-contain" alt="AlphaJournal Logo" />
          <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
            Alpha<span style={{ color: 'var(--accent)' }}>Journal</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </button>
          <button
            onClick={onMobileToggle}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="w-[220px] h-full flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--bg-sidebar)' }}
          >
            {sidebarContent}
          </div>
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={onMobileToggle}
          />
        </div>
      )}
    </>
  );
}
