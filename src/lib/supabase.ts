// src/lib/supabase.ts
// Standard Supabase client shell with full high-fidelity reactive LocalStorage fallback

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  upvotes: number;
  comments: Comment[];
  createdAt: string;
  userVoted?: 'up' | 'down' | null;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface TraderProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  propFirms: string[];
  balance: string;
  winRate: string;
  profitSplit: string;
  status: 'Active' | 'Under Review' | 'Resetting';
  equityCurve: number[];
  bio: string;
}

export interface Payout {
  id: string;
  trader: string;
  amount: number;
  propFirm: string;
  date: string;
  hash: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  dailyDrawdown: string;
  maxDrawdown: string;
  profitTarget: string;
  refundFee: string;
  localSupport: string;
  pros: string[];
  cons: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  notes: string;
}

// Initial Mock Data
const initialPosts: Post[] = [
  {
    id: 'post-1',
    title: 'How to handle daily drawdown limits on FTMO? Sharing my risk management framework',
    content: 'Many traders fail not because of their strategy, but because they violate the 5% daily drawdown rule. Here is my exact protocol: 1) Stop trading for the day after a 1.5% loss. 2) Never risk more than 0.5% per trade. 3) Avoid high-impact news times entirely. What is your daily cap?',
    author: 'PrabeshFX',
    category: 'FTMO',
    tags: ['RiskManagement', 'FTMO', 'Drawdown'],
    upvotes: 38,
    comments: [
      { id: 'c-1', author: 'SandhyaScalps', content: 'Preach! The 1.5% daily stop is the only thing keeping my account alive this month.', createdAt: '2026-05-20T14:30:00Z' },
      { id: 'c-2', author: 'RohanPips', content: 'Great post. News trading on FTMO is a recipe for slippage disasters.', createdAt: '2026-05-20T16:15:00Z' }
    ],
    createdAt: '2026-05-20T12:00:00Z'
  },
  {
    id: 'post-2',
    title: 'NEPSE Index Analysis: Potential double bottom forming around 1980 levels?',
    content: 'Looking at the daily chart of NEPSE, we are seeing a clean rejection near the 1980 region with divergence on the MACD. If we can get a strong bullish closure above 2030 this week, it might signal a nice swing trade opportunity in commercial banks. Thoughts?',
    author: 'KathmanduBull',
    category: 'Local Market',
    tags: ['NEPSE', 'TechnicalAnalysis', 'StocksNP'],
    upvotes: 24,
    comments: [
      { id: 'c-3', author: 'GoldDiggerNP', content: 'Banks look undervalued but liquidity in the local market is still tight. Proceed with caution.', createdAt: '2026-05-21T02:00:00Z' }
    ],
    createdAt: '2026-05-21T01:10:00Z'
  },
  {
    id: 'post-3',
    title: '🚀 Got my first payout approved on FundedNext! $1,240 payout split processed via eSewa!',
    content: 'Stoked to share that my 80/20 split payout from FundedNext was processed today! I requested it yesterday and it arrived directly via eSewa in NRS. Big shoutout to this community for keeping me motivated during the evaluation phase! Keep pushing guys, it is real.',
    author: 'BishalFX',
    category: 'Payouts',
    tags: ['FundedNext', 'PayoutShowcase', 'eSewa'],
    upvotes: 56,
    comments: [
      { id: 'c-4', author: 'PrabeshFX', content: 'Congratulations bro! Well deserved. What pair did you trade during the payout cycle?', createdAt: '2026-05-21T04:20:00Z' },
      { id: 'c-5', author: 'BishalFX', content: 'Mainly XAUUSD buy scaling. Gold has been trending beautifully!', createdAt: '2026-05-21T04:35:00Z' }
    ],
    createdAt: '2026-05-21T03:05:00Z'
  },
  {
    id: 'post-4',
    title: 'Disciplined journaling: Why logging every single trade changed my win-rate from 44% to 58%',
    content: 'For 6 months I traded blind. I would open positions on impulses and close them in panic. Once I forced myself to write down entry reasons, exit details, and take snapshots in my journal, my patterns of revenge trading became glaringly obvious. Start journaling today!',
    author: 'SandhyaScalps',
    category: 'Trading Journals',
    tags: ['Discipline', 'WinRate', 'Psychology'],
    upvotes: 31,
    comments: [],
    createdAt: '2026-05-20T08:15:00Z'
  }
];

const initialProfiles: TraderProfile[] = [
  {
    id: 'tp-1',
    name: 'Prabesh Shrestha',
    handle: '@prabeshFX',
    avatar: '⚡',
    propFirms: ['FTMO', 'FundedNext'],
    balance: '$100,000',
    winRate: '64%',
    profitSplit: '85%',
    status: 'Active',
    equityCurve: [0, 2.5, 1.2, 3.8, 5.0, 4.2, 7.8, 9.4],
    bio: 'Forex swing trader specialized in Gold and GBPUSD. Relying heavily on volume profile and market structures.'
  },
  {
    id: 'tp-2',
    name: 'Sandhya Thapa',
    handle: '@sandhyaScalps',
    avatar: '🦅',
    propFirms: ['The 5%ers', 'FTMO'],
    balance: '$50,000',
    winRate: '72%',
    profitSplit: '80%',
    status: 'Active',
    equityCurve: [0, 4.0, 3.1, 7.2, 6.0, 9.5, 11.2, 13.8],
    bio: 'Index scalper (US30 & NAS100). Focuses on session openings and high-probability liquidity sweeps.'
  },
  {
    id: 'tp-3',
    name: 'Rohan Adhikari',
    handle: '@rohanPips',
    avatar: '📈',
    propFirms: ['FundedNext'],
    balance: '$200,000',
    winRate: '58%',
    profitSplit: '80%',
    status: 'Active',
    equityCurve: [0, -1.5, 2.0, 1.1, 4.0, 3.2, 5.5, 6.2],
    bio: 'Macro Forex trader. Combines interest rate differentials with classical price action technical analysis.'
  }
];

const initialPayouts: Payout[] = [
  { id: 'p-1', trader: 'BishalFX', amount: 1240, propFirm: 'FundedNext', date: '2026-05-21', hash: 'TXN-9842183-NP' },
  { id: 'p-2', trader: 'PrabeshFX', amount: 4550, propFirm: 'FTMO', date: '2026-05-18', hash: 'TXN-4190823-NP' },
  { id: 'p-3', trader: 'SandhyaScalps', amount: 2890, propFirm: 'The 5%ers', date: '2026-05-15', hash: 'TXN-8371902-NP' },
  { id: 'p-4', trader: 'RohanPips', amount: 3750, propFirm: 'FundedNext', date: '2026-05-10', hash: 'TXN-2839103-NP' }
];

const initialReviews: Review[] = [
  {
    id: 'rf-1',
    name: 'FTMO',
    rating: 4.8,
    dailyDrawdown: '5%',
    maxDrawdown: '10%',
    profitTarget: '10% (Phase 1) / 5% (Phase 2)',
    refundFee: 'Yes (100% Refundable on First Payout)',
    localSupport: 'Medium-High (Supports standard international payouts, Crypto, eSewa-to-crypto setups)',
    pros: ['Highly reputable, established in 2015', 'Raw spreads & low commissions', 'Very reliable payout processing'],
    cons: ['Slightly higher evaluation fee than competitors', 'Strict consistency checks on funding phase']
  },
  {
    id: 'rf-2',
    name: 'FundedNext',
    rating: 4.7,
    dailyDrawdown: '5% (Balance-based)',
    maxDrawdown: '10%',
    profitTarget: '8% (Phase 1) / 5% (Phase 2)',
    refundFee: 'Yes (150% Refundable)',
    localSupport: 'Excellent (Direct Bank Transfers in Nepal, local eSewa wallet transfers, responsive local agents)',
    pros: ['15% payout profit share during evaluation phase', 'Balance-based drawdown (safer than equity-based)', 'No time limits on challenges'],
    cons: ['Spreads can widen slightly during high news events', 'Slightly higher slippage on indices']
  },
  {
    id: 'rf-3',
    name: 'The 5%ers',
    rating: 4.6,
    dailyDrawdown: '3%',
    maxDrawdown: '6%',
    profitTarget: '6%',
    refundFee: 'Yes (Refundable)',
    localSupport: 'Medium (Standard Crypto, Wire Transfers, Deel, Card)',
    pros: ['Very relaxed rules & low profit target (6%)', 'Immediate funding program available', 'Excellent growth/scaling program up to $4M'],
    cons: ['Tight drawdown limits (6% overall max)', 'Minimum active trading day requirements']
  }
];

const initialJournals: JournalEntry[] = [
  { id: 'j-1', date: '2026-05-20', asset: 'XAUUSD', direction: 'BUY', lots: 2.00, entryPrice: 2415.50, exitPrice: 2427.80, pnl: 2460.00, notes: 'Broke out of Asian range. Golden cross on 15m. Perfect execution, closed at structural resistance.' },
  { id: 'j-2', date: '2026-05-19', asset: 'EURUSD', direction: 'SELL', lots: 1.50, entryPrice: 1.08520, exitPrice: 1.08220, pnl: 450.00, notes: 'Fakeout at 1.0860 psychological level. MACD bearish crossover on 1h chart. Closed at key support.' },
  { id: 'j-3', date: '2026-05-18', asset: 'US30', direction: 'BUY', lots: 0.50, entryPrice: 39800, exitPrice: 39550, pnl: -125.00, notes: 'Impulse buy on US Open. Violated plan by trading inside range. Stopped out quickly.' }
];

export class MockSupabaseEngine {
  private getStorage<T>(key: string, initial: T): T {
    if (typeof window === 'undefined') return initial;
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getPosts(): Post[] {
    return this.getStorage<Post[]>('propnepal_posts', initialPosts);
  }

  savePosts(posts: Post[]): void {
    this.setStorage('propnepal_posts', posts);
  }

  getProfiles(): TraderProfile[] {
    return this.getStorage<TraderProfile[]>('propnepal_profiles', initialProfiles);
  }

  getPayouts(): Payout[] {
    return this.getStorage<Payout[]>('propnepal_payouts', initialPayouts);
  }

  savePayouts(payouts: Payout[]): void {
    this.setStorage('propnepal_payouts', payouts);
  }

  getReviews(): Review[] {
    return initialReviews; // Reviews are static references
  }

  getJournals(): JournalEntry[] {
    return this.getStorage<JournalEntry[]>('propnepal_journals', initialJournals);
  }

  saveJournals(journals: JournalEntry[]): void {
    this.setStorage('propnepal_journals', journals);
  }

  getCurrentUser(): { username: string; loggedIn: boolean; avatar: string; email: string } {
    return this.getStorage('propnepal_user', { username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '' });
  }

  setCurrentUser(user: { username: string; loggedIn: boolean; avatar: string; email: string }) {
    this.setStorage('propnepal_user', user);
  }
}

export const db = new MockSupabaseEngine();
