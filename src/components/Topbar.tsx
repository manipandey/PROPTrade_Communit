import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, Settings, User, Key, CheckCircle2, Lock, Mail, Calendar, Shield } from 'lucide-react';
import { MarketItem } from '@/app/page';

interface TopbarProps {
  theme?: 'dark' | 'light';
  markets: MarketItem[];
  watchlist: string[];
  currentUser?: { username: string; loggedIn: boolean; avatar: string; isDemo?: boolean; email?: string } | null;
}

const mapToTradingViewSymbol = (sym: string): string => {
  const map: Record<string, string> = {
    'NAS100': 'FOREXCOM:NSXUSD',
    'XAUUSD': 'OANDA:XAUUSD',
    'EURUSD': 'FX_IDC:EURUSD',
    'SPX500': 'FOREXCOM:SPXUSD',
    'US30': 'FOREXCOM:DJI',
    'BTCUSD': 'BITSTAMP:BTCUSD',
    'ETHUSD': 'BITSTAMP:ETHUSD',
    'GBPUSD': 'FX_IDC:GBPUSD',
    'USDJPY': 'FX_IDC:USDJPY',
    'USOIL': 'OANDA:BCOUSD'
  };
  return map[sym] || sym;
};

export default function Topbar({ theme = 'dark', watchlist, currentUser }: TopbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Payout Verified', message: 'Your eSewa payout of Rs. 15,000 has been verified.', icon: 'check' },
    { id: 2, title: 'New Market Alert', message: 'Gold (XAUUSD) reached $2400.', icon: 'bell' }
  ]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widget);

    // Map watchlist symbols to TradingView titles/proNames
    const symbolsConfig = watchlist.map((sym) => {
      const proName = mapToTradingViewSymbol(sym);
      return {
        proName,
        title: sym
      };
    });

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbolsConfig,
      showSymbolLogo: true,
      colorTheme: theme === 'light' ? 'light' : 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });

    containerRef.current.appendChild(script);
  }, [watchlist, theme]);

  return (
    <div
      className="sticky top-0 z-20 flex items-center h-[52px] px-4 gap-3 flex-shrink-0 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Watchlist Tape Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
          Watchlist Tape
        </span>
      </div>

      <span style={{ color: 'var(--border)' }} className="text-[14px] flex-shrink-0 select-none">|</span>

      {/* Live Custom Ticker Tape Container */}
      <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center">
        <div ref={containerRef} className="tradingview-widget-container w-full"></div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search markets or traders..."
            className="t-input pl-8 pr-3 py-1.5 text-xs w-[200px]"
            style={{ fontSize: '12px' }}
          />
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Notifications"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Bell className="h-4 w-4" />
            {currentUser?.loggedIn && notifications.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl animate-fade-in z-50 p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                {notifications.length > 0 && currentUser?.loggedIn && (
                  <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-wider">Clear</button>
                )}
              </div>
              {currentUser?.loggedIn ? (
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="flex gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <div className="mt-0.5">
                          {n.icon === 'check' ? <CheckCircle2 className="h-4 w-4 text-brand-green" /> : <Bell className="h-4 w-4" style={{ color: 'var(--accent)' }} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">{n.title}</div>
                          <div className="text-[10px] text-text-muted mt-0.5">{n.message}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                      No new notifications.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Please log in to view notifications.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Settings"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Settings className="h-4 w-4" />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl animate-fade-in z-50 p-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {currentUser?.loggedIn ? (
                <div className="space-y-1">
                  <button 
                    onClick={() => { setShowProfileModal(true); setShowSettings(false); }}
                    className="flex items-center w-full gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors hover:bg-bg-hover text-text-primary"
                  >
                    <User className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                    Profile
                  </button>
                  <button 
                    onClick={() => { setShowResetModal(true); setShowSettings(false); }}
                    className="flex items-center w-full gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors hover:bg-bg-hover text-text-primary"
                  >
                    <Key className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                    Reset Password
                  </button>
                </div>
              ) : (
                <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Please log in to view settings.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-2xl space-y-6 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/20 text-3xl font-bold text-brand-green border border-brand-green/30 mx-auto">
                {currentUser.avatar}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">
                {currentUser.username}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {currentUser.isDemo ? 'Demo Account' : 'Verified Trader'}
              </p>
            </div>

            <div className="space-y-4 bg-bg-secondary p-4 rounded-xl border border-border-theme">
              <div className="flex items-center gap-3 text-left">
                <Mail className="h-4 w-4 text-text-muted" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Email</div>
                  <div className="text-xs font-semibold text-text-primary">
                    {currentUser.email || `${currentUser.username.toLowerCase()}@example.com`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Calendar className="h-4 w-4 text-text-muted" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Joined</div>
                  <div className="text-xs font-semibold text-text-primary">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Shield className="h-4 w-4 text-brand-green" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Status</div>
                  <div className="text-xs font-semibold text-brand-green">Active</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-4 w-full rounded-lg bg-bg-secondary border border-border-theme py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-bg-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showResetModal && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md animate-fade-in p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-2xl space-y-6 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10 text-brand-green mx-auto">
                <Key className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">
                Reset Password
              </h2>
              <p className="mt-2 text-xs text-text-secondary">
                Enter a new password for your account.
              </p>
            </div>

            {resetMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-brand-green/10 border border-brand-green/30 p-3 text-xs text-brand-green animate-fade-in text-center justify-center font-bold">
                {resetMessage}
              </div>
            )}
            
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">New Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Confirm Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green/50 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowResetModal(false); setResetMessage(''); setNewPassword(''); setConfirmPassword(''); }}
                className="flex-1 rounded-lg bg-bg-secondary border border-border-theme py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newPassword || newPassword !== confirmPassword) {
                    setResetMessage('Passwords do not match or are empty.');
                    return;
                  }
                  import('@/lib/supabase').then(module => {
                    module.db.updatePassword(currentUser.username, newPassword);
                    setResetMessage('Password updated successfully!');
                    setTimeout(() => {
                      setShowResetModal(false);
                      setResetMessage('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }, 1500);
                  });
                }}
                className="flex-1 rounded-lg bg-brand-green py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-brand-green/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
