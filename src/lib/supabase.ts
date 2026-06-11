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
  imageUrl?: string;
  reactions?: Record<string, number>;
  userReactions?: Record<string, boolean>;
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
  isDemo?: boolean;
  // Dynamic metrics computed for sorting
  journalCount?: number;
  totalProfit?: number;
}

export interface TradingAccount {
  id: string;
  name: string;
  type: 'Challenge' | 'Funded';
  propFirm: string;
  size: number;
}

export interface Payout {
  id: string;
  trader: string;
  amount: number;
  propFirm: string;
  date: string;
  hash: string;
  verified: boolean;
  likes: string[]; // usernames of users who liked
  comments: Comment[];
  imageUrl?: string;
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

export interface Ad {
  id: string;
  text: string;
  author: string;
  isSponsored: boolean;
  logoUrl?: string;
  imageUrl?: string; // Optional banner image uploaded by the admin
}

export interface Lesson {
  title: string;
  content: string; // Further description/text content of the lesson
  mediaUrl?: string; // Image or Video URL/base64
  mediaType?: 'image' | 'video'; // Type of media
}

export interface CourseModule {
  id: string;
  level: string;
  title: string;
  duration: string;
  desc: string;
  lessons: Lesson[];
}

export interface PremiumStrategy {
  id: string;
  title: string;
  description: string;
  asset: string;
  timeframe: string;
  winRate: string;
  riskReward: string;
  content: string;
  previewText: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface PremiumAccess {
  username: string;
  esewaTransactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  requestedAt: string;
  verifiedAt?: string;
}

export type Emotion = 'calm' | 'confident' | 'anxious' | 'fomo' | 'revenge' | 'frustrated' | 'neutral';
export type SetupType = 'Supply Zone' | 'Demand Zone' | 'FVG Fill' | 'Breakout' | 'Breakdown' | 'Scalp' | 'Trend Follow' | 'Mean Reversion' | 'News Trade' | 'Liquidity Sweep' | 'Order Block' | 'Other';
export type TradingSession = 'Asian' | 'London' | 'New York';

export const EMOTIONS: { value: Emotion; label: string; emoji: string; color: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'text-sky-400' },
  { value: 'confident', label: 'Confident', emoji: '💪', color: 'text-brand-green' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-text-secondary' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'text-yellow-400' },
  { value: 'fomo', label: 'FOMO', emoji: '🔥', color: 'text-orange-400' },
  { value: 'revenge', label: 'Revenge', emoji: '😤', color: 'text-red-400' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😖', color: 'text-red-500' },
];

export const SETUP_TYPES: SetupType[] = [
  'Supply Zone', 'Demand Zone', 'FVG Fill', 'Breakout', 'Breakdown',
  'Scalp', 'Trend Follow', 'Mean Reversion', 'News Trade',
  'Liquidity Sweep', 'Order Block', 'Other'
];

export const TRADING_SESSIONS: TradingSession[] = ['Asian', 'London', 'New York'];

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
  emotion: Emotion;
  setup: SetupType;
  author: string;
  riskPct?: number;       // Capital risk % (e.g. 1.5)
  riskReward?: number;    // Risk-to-reward ratio (e.g. 3.0)
  imageUrl?: string;      // Screenshot URL or uploaded image base64
  accountId?: string;     // Associated trading account
  session?: TradingSession; // Associated trading session
  newsChecked?: boolean;
  riskSet?: boolean;
  mindsetReady?: boolean;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface JournalSettings {
  isPublic: boolean;
}

export interface TradeFeedback {
  id: string;
  tradeId: string;
  author: string;
  comment: string;
  rating?: number;
  createdAt: string;
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
    createdAt: '2026-05-20T12:00:00Z',
    imageUrl: '/feed-images/trading-chart-gold.png'
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
    createdAt: '2026-05-21T01:10:00Z',
    imageUrl: '/feed-images/nepse-chart.png'
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
    createdAt: '2026-05-21T03:05:00Z',
    imageUrl: '/feed-images/payout-confirmation.png'
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
    createdAt: '2026-05-20T08:15:00Z',
    imageUrl: '/feed-images/trading-journal.png'
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
  { id: 'p-1', trader: 'BishalFX', amount: 1240, propFirm: 'FundedNext', date: '2026-05-21', hash: 'TXN-9842183-NP', verified: true, likes: ['PrabeshFX'], comments: [{ id: 'c-p1', author: 'PrabeshFX', content: 'Congrats Bishal! Big milestone.', createdAt: '2026-05-21T05:00:00Z' }] },
  { id: 'p-2', trader: 'PrabeshFX', amount: 4550, propFirm: 'FTMO', date: '2026-05-18', hash: 'TXN-4190823-NP', verified: true, likes: ['SandhyaScalps', 'RohanPips'], comments: [] },
  { id: 'p-3', trader: 'SandhyaScalps', amount: 2890, propFirm: 'The 5%ers', date: '2026-05-15', hash: 'TXN-8371902-NP', verified: true, likes: [], comments: [] },
  { id: 'p-4', trader: 'RohanPips', amount: 3750, propFirm: 'FundedNext', date: '2026-05-10', hash: 'TXN-2839103-NP', verified: true, likes: [], comments: [] }
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

const initialModules: CourseModule[] = [
  {
    id: 'mod-1',
    level: 'Beginner',
    title: 'Prop Firm Fundamentals',
    duration: '45 Mins',
    desc: 'Understand how modern prop trading works, the differences between evaluation challenges, and how to select the right funding provider in Nepal.',
    lessons: [
      {
        title: 'Introduction to Prop Capital',
        content: 'Proprietary trading firms (prop firms) provide traders with access to large sums of capital in exchange for a percentage of the profits. This model allows talented traders to scale their income without risking their personal savings. In Nepal, prop trading has gained massive popularity as a path to financial freedom.',
        mediaUrl: '/feed-images/trading-chart-gold.png',
        mediaType: 'image'
      },
      {
        title: 'Evaluation vs Instant Funding',
        content: 'Evaluation challenges require traders to pass a two-phase test to prove their consistency and risk management skills. Instant funding bypasses this phase, but usually comes with smaller profit splits and higher initial fees. Select the structure that matches your trading timeline and risk tolerance.',
        mediaUrl: '/feed-images/nepse-chart.png',
        mediaType: 'image'
      },
      {
        title: 'Understanding Evaluation Fee Refunds',
        content: 'Most reputable prop firms (like FTMO and FundedNext) refund your challenge registration fee in full with your very first successful profit split payout. This ensures that once you prove consistency, your net initial cost becomes zero.',
        mediaUrl: '/feed-images/payout-confirmation.png',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'mod-2',
    level: 'Intermediate',
    title: 'Mastering Strict Drawdown Rules',
    duration: '1.5 Hours',
    desc: 'The single most important skill. Learn details of balance-based vs equity-based drawdown, daily stop calculations, and news-trading restrictions.',
    lessons: [
      {
        title: 'Equity vs Balance-Based Drawdowns',
        content: 'Drawdown limit checks can be based on your starting day balance or floating equity. Balance-based is much safer, as it ignores intra-day floating profit peaks. Equity-based drawdown is sensitive to trade retracements and requires active stop management.',
        mediaUrl: '/feed-images/trading-chart-gold.png',
        mediaType: 'image'
      },
      {
        title: 'Setting Daily Automatic Risk Stops',
        content: 'The most effective way to protect your account is to calculate your daily limit (e.g. 5% max FTMO limit) and configure your broker or local journal tracker to alert or close trades automatically once you reach a 2% daily loss threshold.',
        mediaUrl: '/feed-images/trading-journal.png',
        mediaType: 'image'
      },
      {
        title: 'Handling News Slippage Policies',
        content: 'Trading during major economic announcements (CPI, FOMC, NFP) is highly restricted by many firms. Slippage can trigger massive losses that violate your drawdown targets. Always check the calendar and close swing positions prior to high-impact news releases.',
        mediaUrl: '/feed-images/payout-confirmation.png',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'mod-3',
    level: 'Advanced',
    title: 'Smart Money Concepts & Liquidity',
    duration: '2.5 Hours',
    desc: 'Master the high-R:R setups required to pass evaluation profit targets (8-10%) quickly while maintaining extremely tight risk limits.',
    lessons: [
      {
        title: 'Order Blocks & Fair Value Gaps (FVG)',
        content: 'Smart Money Concepts (SMC) focus on institutional footprint entries. Look for strong impulse moves that leave behind Fair Value Gaps (FVG). Place limit orders in these imbalance zones for high-probability setups with tight stop losses.',
        mediaUrl: '/feed-images/trading-chart-gold.png',
        mediaType: 'image'
      },
      {
        title: 'Identifying Asian Session Liquidity Sweeps',
        content: 'The Asian session accumulates buy/sell orders that act as liquidity pools. During London or NY session open, wait for the market to run those highs/lows (sweeping liquidity) before entering in the opposite direction. This is a primary high-R:R setup.',
        mediaUrl: '/feed-images/nepse-chart.png',
        mediaType: 'image'
      },
      {
        title: 'Risk Scaling on Win Streaks',
        content: 'When you are in a streak of wins, do not increase your leverage. Scale down your risk percentage (e.g., from 1% to 0.5%) to lock in profits and protect your challenge drawdown buffers. Consistent sizing leads to successful payouts.',
        mediaUrl: '/feed-images/trading-journal.png',
        mediaType: 'image'
      }
    ]
  }
];

const initialPremiumStrategies: PremiumStrategy[] = [
  {
    id: 'strat-1',
    title: 'XAUUSD London Session Liquidity Sweep',
    description: 'A high-probability gold scalping strategy targeting Asian session liquidity pools during London open. Designed for FTMO/FundedNext evaluation accounts.',
    asset: 'XAUUSD',
    timeframe: 'M15',
    winRate: '76%',
    riskReward: '1:3',
    previewText: 'This strategy exploits the predictable pattern of London session sweeping Asian highs/lows on Gold. Combined with FVG confirmations and order block entries, it consistently delivers 1:3+ R:R setups during the first 90 minutes of London open.',
    content: 'FULL STRATEGY BREAKDOWN:\n\n1. PRE-SESSION ANALYSIS (6:00-7:30 AM GMT)\n• Mark Asian session high and low on M15 chart\n• Identify any FVG (Fair Value Gap) left by the Asian session\n• Note the prevailing daily bias from H4 structure\n\n2. ENTRY RULES\n• Wait for price to sweep Asian high/low (grab liquidity)\n• After the sweep, look for a displacement candle (strong rejection)\n• Enter on the next candle\'s retracement into the created FVG\n• Stop loss: 2-3 pips beyond the sweep wick\n\n3. TAKE PROFIT MANAGEMENT\n• TP1: Opposite Asian session level (1:2 R:R typically)\n• TP2: Previous day high/low (1:3+ R:R)\n• Move SL to breakeven after TP1 is hit\n\n4. RISK RULES\n• Max 0.5% risk per trade for evaluation accounts\n• Max 2 trades per session\n• No trading on NFP, FOMC, or CPI days\n\n5. EVALUATION ACCOUNT TIPS\n• This setup alone can clear Phase 1 profit targets in 8-12 trading days\n• Focus only on London session for consistency\n• Journal every trade with emotion tags',
    imageUrl: '/feed-images/trading-chart-gold.png',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    id: 'strat-2',
    title: 'NAS100 NY Open Breakout Sniper',
    description: 'A momentum-based NAS100 strategy for the New York opening bell. Targets the first clean breakout with institutional confirmation via order flow.',
    asset: 'NAS100',
    timeframe: 'M5',
    winRate: '71%',
    riskReward: '1:2.5',
    previewText: 'The New York open on NAS100 is the most volatile and predictable window for breakout setups. This strategy waits for the initial fake-out, then enters on the true directional move with a tight stop and aggressive trailing take-profit system.',
    content: 'FULL STRATEGY BREAKDOWN:\n\n1. PRE-MARKET ANALYSIS (1:00-2:00 PM GMT)\n• Identify the pre-market range (last 2 hours before NY open)\n• Mark the high and low of this consolidation zone\n• Check if there is a clear daily bias from the overnight session\n\n2. ENTRY RULES\n• Wait for the 9:30 AM ET candle (NY open)\n• Look for an initial fake breakout of the range (the \'judas swing\')\n• After the fake-out reverses, enter on the M5 body close back inside the range\n• Stop loss: Beyond the fake-out wick\n\n3. TAKE PROFIT MANAGEMENT\n• TP1: Opposite side of the range (1:1.5 R:R)\n• TP2: Previous day high/low extension (1:2.5 R:R)\n• Trail stop using M5 swing structure after TP1\n\n4. RISK MANAGEMENT\n• Max 0.75% risk per trade\n• Only 1 entry per session\n• Avoid trading during FOMC meeting days\n\n5. PROP FIRM NOTES\n• Works exceptionally well on equity-based drawdown accounts\n• Quick scalp nature prevents overnight holding violations\n• Average 3-5 setups per week',
    imageUrl: '/feed-images/nepse-chart.png',
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'strat-3',
    title: 'EURUSD H1 Swing — Smart Money Confluence',
    description: 'A swing trading strategy for EURUSD combining weekly order blocks, daily FVGs, and H1 market structure shifts for high-conviction entries.',
    asset: 'EURUSD',
    timeframe: 'H1',
    winRate: '68%',
    riskReward: '1:4',
    previewText: 'This longer-term strategy focuses on confluence-based entries where weekly order blocks align with daily FVGs and H1 structure shifts. Ideal for traders who prefer fewer but higher quality setups with massive R:R potential.',
    content: 'FULL STRATEGY BREAKDOWN:\n\n1. WEEKLY ANALYSIS (Sunday)\n• Identify the weekly order block (last up/down candle before a major move)\n• Mark weekly imbalances and liquidity pools\n• Determine the weekly bias (bullish/bearish)\n\n2. DAILY REFINEMENT\n• Look for daily FVGs that align with the weekly OB zone\n• Mark daily highs/lows that act as liquidity targets\n\n3. H1 ENTRY CRITERIA\n• Wait for price to enter the daily FVG + weekly OB confluence zone\n• Look for H1 Market Structure Shift (MSS) — break of the most recent swing\n• Enter on the H1 pullback after the MSS\n• Stop loss: Below the weekly OB low (typically 25-35 pips)\n\n4. TAKE PROFIT\n• TP1: Daily opposite liquidity level (1:2 R:R)\n• TP2: Weekly liquidity target (1:4 R:R)\n• Partial close at TP1, trail remainder\n\n5. RISK & POSITION MANAGEMENT\n• Max 1% risk per setup\n• Average hold time: 2-4 days\n• Max 2 concurrent positions\n• Check for high-impact news before entry\n\n6. PROP FIRM COMPATIBILITY\n• Use FTMO Swing account (allows weekend holding)\n• 1-2 winning trades per week is enough for evaluation targets\n• Extremely low trade count keeps emotional discipline high',
    imageUrl: '/feed-images/payout-confirmation.png',
    createdAt: '2026-06-01T14:00:00Z'
  }
];

const initialAds: Ad[] = [
  {
    id: 'ad-propnepal',
    text: 'Join PropNepal Elite community. Log journals, verify payouts, and master prop challenges with the ultimate Nepalese trading network!',
    author: 'PropNepal Academy',
    isSponsored: true,
    logoUrl: '/logo-icon.svg'
  },
  { id: 'ad-1', text: "The goal of a successful trader is to make the best trades. Money is secondary.", author: "Alexander Elder", isSponsored: true },
  { id: 'ad-2', text: "In this business, if you're good, you're right six times out of ten. You're never going to be right nine times out of ten.", author: "Peter Lynch", isSponsored: true },
  { id: 'ad-3', text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher", isSponsored: true },
  { id: 'ad-4', text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett", isSponsored: true },
  { id: 'ad-5', text: "Don't focus on making money; focus on protecting what you have.", author: "Paul Tudor Jones", isSponsored: true },
  { id: 'ad-6', text: "The elements of good trading are: cutting losses, cutting losses, and cutting losses.", author: "Ed Seykota", isSponsored: true },
  { id: 'ad-7', text: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.", author: "George Soros", isSponsored: true },
  { id: 'ad-8', text: "Losers average losers. Cut your losses and let your winners run.", author: "Paul Tudor Jones", isSponsored: true },
  { id: 'ad-9', text: "The market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett", isSponsored: true },
  { id: 'ad-10', text: "Trade what you see, not what you believe.", author: "Larry Williams", isSponsored: true },
  { id: 'ad-11', text: "A peak performance trader is totally committed to being the best and doing whatever it takes to be the best.", author: "Van K. Tharp", isSponsored: true },
  { id: 'ad-12', text: "Without discipline, a clear strategy is just a wish.", author: "Anonymous Trader", isSponsored: true }
];

// Demo journal entries — only loaded for quick-login demo accounts
const demoJournals: Record<string, JournalEntry[]> = {
  FTMO_Champ: [
    { id: 'j-d1', date: '2026-05-20', asset: 'XAUUSD', direction: 'BUY', lots: 2.00, entryPrice: 2415.50, exitPrice: 2427.80, pnl: 2460.00, notes: 'Broke out of Asian range. Golden cross on 15m.', emotion: 'confident', setup: 'Breakout', author: 'FTMO_Champ', accountId: 'acc-d2', session: 'Asian' },
    { id: 'j-d2', date: '2026-05-19', asset: 'EURUSD', direction: 'SELL', lots: 1.50, entryPrice: 1.08520, exitPrice: 1.08220, pnl: 450.00, notes: 'Fakeout at 1.0860 psychological level.', emotion: 'calm', setup: 'Supply Zone', author: 'FTMO_Champ', accountId: 'acc-d2', session: 'London' },
    { id: 'j-d3', date: '2026-05-18', asset: 'US30', direction: 'BUY', lots: 0.50, entryPrice: 39800, exitPrice: 39550, pnl: -125.00, notes: 'Impulse buy on US Open. Violated plan.', emotion: 'fomo', setup: 'Scalp', author: 'FTMO_Champ', accountId: 'acc-d1', session: 'New York' },
    { id: 'j-d4', date: '2026-05-17', asset: 'GBPUSD', direction: 'BUY', lots: 1.00, entryPrice: 1.27100, exitPrice: 1.27450, pnl: 350.00, notes: 'Clean demand zone bounce on H1.', emotion: 'calm', setup: 'Demand Zone', author: 'FTMO_Champ', accountId: 'acc-d2', session: 'London' },
    { id: 'j-d5', date: '2026-05-16', asset: 'XAUUSD', direction: 'SELL', lots: 1.50, entryPrice: 2405.00, exitPrice: 2412.50, pnl: -1125.00, notes: 'Revenge trade after missing earlier entry.', emotion: 'revenge', setup: 'Supply Zone', author: 'FTMO_Champ', accountId: 'acc-d1', session: 'New York' },
    { id: 'j-d6', date: '2026-05-15', asset: 'NAS100', direction: 'BUY', lots: 0.30, entryPrice: 18950, exitPrice: 19080, pnl: 390.00, notes: 'FVG fill on 15m, clean trend follow.', emotion: 'confident', setup: 'FVG Fill', author: 'FTMO_Champ', accountId: 'acc-d2', session: 'London' },
  ],
  GoldHunter: [
    { id: 'j-g1', date: '2026-05-20', asset: 'XAUUSD', direction: 'BUY', lots: 3.00, entryPrice: 2390.00, exitPrice: 2418.50, pnl: 8550.00, notes: 'Massive run on gold. Held through pullback.', emotion: 'confident', setup: 'Trend Follow', author: 'GoldHunter', accountId: 'acc-g1', session: 'London' },
    { id: 'j-g2', date: '2026-05-19', asset: 'XAUUSD', direction: 'SELL', lots: 1.00, entryPrice: 2425.00, exitPrice: 2420.00, pnl: 500.00, notes: 'Quick scalp at resistance.', emotion: 'calm', setup: 'Scalp', author: 'GoldHunter', accountId: 'acc-g1', session: 'New York' },
    { id: 'j-g3', date: '2026-05-18', asset: 'XAUUSD', direction: 'BUY', lots: 2.00, entryPrice: 2400.00, exitPrice: 2395.00, pnl: -1000.00, notes: 'Got stopped on news spike. Anxious entry.', emotion: 'anxious', setup: 'News Trade', author: 'GoldHunter', accountId: 'acc-g1', session: 'London' },
  ],
  NepaliScalper: [
    { id: 'j-n1', date: '2026-05-20', asset: 'US30', direction: 'BUY', lots: 0.50, entryPrice: 39750, exitPrice: 39820, pnl: 350.00, notes: 'NY open liquidity sweep.', emotion: 'calm', setup: 'Liquidity Sweep', author: 'NepaliScalper', accountId: 'acc-n1', session: 'New York' },
    { id: 'j-n2', date: '2026-05-19', asset: 'NAS100', direction: 'SELL', lots: 0.30, entryPrice: 19100, exitPrice: 19050, pnl: 150.00, notes: 'Order block rejection on 5m.', emotion: 'neutral', setup: 'Order Block', author: 'NepaliScalper', accountId: 'acc-n1', session: 'London' },
  ],
  PrabeshFX: [
    { id: 'j-p1', date: '2026-05-20', asset: 'XAUUSD', direction: 'BUY', lots: 2.00, entryPrice: 2415.50, exitPrice: 2427.80, pnl: 2460.00, notes: 'Broke out of Asian range. Golden cross on 15m.', emotion: 'confident', setup: 'Breakout', author: 'PrabeshFX', accountId: 'acc-p1', session: 'Asian' },
    { id: 'j-p2', date: '2026-05-19', asset: 'XAUUSD', direction: 'BUY', lots: 1.50, entryPrice: 2400.00, exitPrice: 2430.00, pnl: 4500.00, notes: 'Supply to demand flip.', emotion: 'confident', setup: 'Demand Zone', author: 'PrabeshFX', accountId: 'acc-p1', session: 'London' },
    { id: 'j-p3', date: '2026-05-18', asset: 'GBPUSD', direction: 'SELL', lots: 1.00, entryPrice: 1.27500, exitPrice: 1.28700, pnl: -1200.00, notes: 'ECB news spike stopped me out.', emotion: 'anxious', setup: 'News Trade', author: 'PrabeshFX', accountId: 'acc-p1', session: 'New York' },
    { id: 'j-p4', date: '2026-05-17', asset: 'GBPUSD', direction: 'BUY', lots: 2.00, entryPrice: 1.27100, exitPrice: 1.28920, pnl: 3640.00, notes: 'Held through demand block bounce.', emotion: 'calm', setup: 'Demand Zone', author: 'PrabeshFX', accountId: 'acc-p1', session: 'London' },
    { id: 'j-p5', date: '2026-05-16', asset: 'XAUUSD', direction: 'BUY', lots: 1.50, entryPrice: 2410.00, exitPrice: 2423.33, pnl: 2000.00, notes: 'H4 block test.', emotion: 'confident', setup: 'Order Block', author: 'PrabeshFX', accountId: 'acc-p1', session: 'Asian' }
  ],
  SandhyaScalps: [
    { id: 'j-s1', date: '2026-05-20', asset: 'US30', direction: 'BUY', lots: 1.00, entryPrice: 39750, exitPrice: 39790, pnl: 4000.00, notes: 'US Open scalp sweep.', emotion: 'confident', setup: 'Scalp', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'New York' },
    { id: 'j-s2', date: '2026-05-19', asset: 'NAS100', direction: 'SELL', lots: 0.50, entryPrice: 19100, exitPrice: 19038, pnl: 3100.00, notes: '5m order block rejection.', emotion: 'calm', setup: 'Order Block', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'London' },
    { id: 'j-s3', date: '2026-05-18', asset: 'US30', direction: 'BUY', lots: 0.80, entryPrice: 39800, exitPrice: 39775, pnl: -2000.00, notes: 'Impulse buy. High volatility sweep.', emotion: 'fomo', setup: 'Scalp', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'New York' },
    { id: 'j-s4', date: '2026-05-17', asset: 'NAS100', direction: 'BUY', lots: 0.60, entryPrice: 18950, exitPrice: 19025, pnl: 4500.00, notes: 'FVG fill trend continuation.', emotion: 'confident', setup: 'FVG Fill', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'London' },
    { id: 'j-s5', date: '2026-05-16', asset: 'US30', direction: 'BUY', lots: 0.50, entryPrice: 39700, exitPrice: 39734, pnl: 1700.00, notes: 'NY Session close.', emotion: 'neutral', setup: 'Scalp', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'New York' },
    { id: 'j-s6', date: '2026-05-15', asset: 'NAS100', direction: 'BUY', lots: 0.40, entryPrice: 18900, exitPrice: 18962.50, pnl: 2500.00, notes: 'Support zone double bottom.', emotion: 'calm', setup: 'Demand Zone', author: 'SandhyaScalps', accountId: 'acc-s1', session: 'Asian' }
  ],
  RohanPips: [
    { id: 'j-r1', date: '2026-05-20', asset: 'EURUSD', direction: 'SELL', lots: 2.00, entryPrice: 1.08700, exitPrice: 1.08775, pnl: -1500.00, notes: 'Stopped out. Over-leveraged on CPI.', emotion: 'anxious', setup: 'News Trade', author: 'RohanPips', accountId: 'acc-r1', session: 'New York' },
    { id: 'j-r2', date: '2026-05-19', asset: 'GBPUSD', direction: 'BUY', lots: 1.50, entryPrice: 1.27000, exitPrice: 1.27233, pnl: 3500.00, notes: 'Macro trend alignment.', emotion: 'calm', setup: 'Trend Follow', author: 'RohanPips', accountId: 'acc-r1', session: 'London' },
    { id: 'j-r3', date: '2026-05-18', asset: 'EURUSD', direction: 'BUY', lots: 2.50, entryPrice: 1.08200, exitPrice: 1.08284, pnl: 2100.00, notes: 'H4 demand zone bounce.', emotion: 'confident', setup: 'Demand Zone', author: 'RohanPips', accountId: 'acc-r1', session: 'London' },
    { id: 'j-r4', date: '2026-05-17', asset: 'EURUSD', direction: 'BUY', lots: 2.00, entryPrice: 1.08100, exitPrice: 1.08205, pnl: 2100.00, notes: 'Order block test.', emotion: 'calm', setup: 'Order Block', author: 'RohanPips', accountId: 'acc-r1', session: 'Asian' }
  ]
};

const DATA_VERSION = 'v6_trading_sessions_upgrade';

export class MockSupabaseEngine {
  constructor() {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('propnepal_data_version');
      if (storedVersion !== DATA_VERSION) {
        // Wipe all cached propnepal items to load newly seeded structures
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('propnepal_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('propnepal_data_version', DATA_VERSION);
      }

      // Initialize demo profiles registration & settings to public
      const demoRoles = ['FTMO_Champ', 'GoldHunter', 'NepaliScalper', 'PrabeshFX', 'SandhyaScalps', 'RohanPips', 'BishalFX'];
      const usersKey = 'propnepal_registered_users';
      const registeredUsers = JSON.parse(localStorage.getItem(usersKey) || '[]');
      const updatedUsers = [...registeredUsers];
      let changed = false;

      const avatarMap: Record<string, string> = {
        FTMO_Champ: '⚡',
        GoldHunter: '🏆',
        NepaliScalper: '🦅',
        PrabeshFX: '📈',
        SandhyaScalps: '🦉',
        RohanPips: '🌊',
        BishalFX: '💸'
      };

      // Seed admin user
      const adminEmail = 'admin@propnepal.com';
      if (!registeredUsers.some((u: { email: string }) => u.email === adminEmail)) {
        const adminUser = {
          id: 'user-admin',
          email: adminEmail,
          username: 'admin',
          password: btoa('admin123'),
          avatar: '👑',
          createdAt: new Date().toISOString(),
          isDemo: false
        };
        updatedUsers.push(adminUser);
        changed = true;
      }

      demoRoles.forEach(role => {
        const email = `${role.toLowerCase()}@propnepal.com`;
        if (!registeredUsers.some((u: { email: string }) => u.email === email)) {
          const newUser = {
            id: `user-${role}`,
            email,
            username: role,
            password: btoa('demo1234'),
            avatar: avatarMap[role] || '👤',
            createdAt: new Date().toISOString(),
            isDemo: true
          };
          updatedUsers.push(newUser);
          changed = true;
        }

        // Make demo journals public by default
        const settingsKey = `propnepal_journal_settings_${role}`;
        if (!localStorage.getItem(settingsKey)) {
          localStorage.setItem(settingsKey, JSON.stringify({ isPublic: true }));
        }
      });

      if (changed) {
        localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
      }
    }
  }

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

  getRawProfiles(): TraderProfile[] {
    return this.getStorage<TraderProfile[]>('propnepal_profiles', initialProfiles);
  }

  saveProfiles(profiles: TraderProfile[]): void {
    this.setStorage('propnepal_profiles', profiles);
  }

  getProfiles(): TraderProfile[] {
    const profiles = this.getRawProfiles();
    
    const updatedProfiles = profiles.map(profile => {
      const username = profile.handle.replace('@', '');
      const journals = this.getJournals(username);
      
      if (journals.length > 0) {
        const totalTrades = journals.length;
        const winningTrades = journals.filter(j => j.pnl > 0).length;
        const winRateVal = Math.round((winningTrades / totalTrades) * 100);
        const totalProfit = journals.reduce((sum, j) => sum + j.pnl, 0);
        
        const accounts = this.getAccounts(username);
        const maxBalance = accounts.length > 0 
          ? `$${accounts.reduce((max, acc) => Math.max(max, acc.size), 0).toLocaleString()}` 
          : profile.balance;

        return {
          ...profile,
          winRate: `${winRateVal}%`,
          balance: maxBalance,
          journalCount: totalTrades,
          totalProfit: totalProfit
        };
      }
      
      return {
        ...profile,
        journalCount: 0,
        totalProfit: 0
      };
    });

    // Custom ranking sort: journalCount (primary), totalProfit, winRate, profitSplit
    updatedProfiles.sort((a, b) => {
      const aCount = a.journalCount || 0;
      const bCount = b.journalCount || 0;
      if (aCount !== bCount) return bCount - aCount;

      const aProfit = a.totalProfit || 0;
      const bProfit = b.totalProfit || 0;
      if (aProfit !== bProfit) return bProfit - aProfit;

      const aWR = parseInt(a.winRate.replace('%', '')) || 0;
      const bWR = parseInt(b.winRate.replace('%', '')) || 0;
      if (aWR !== bWR) return bWR - aWR;

      const aSplit = parseInt(a.profitSplit.replace('%', '')) || 0;
      const bSplit = parseInt(b.profitSplit.replace('%', '')) || 0;
      return bSplit - aSplit;
    });

    return updatedProfiles;
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

  getJournals(username?: string): JournalEntry[] {
    if (!username) return [];
    const key = `propnepal_journals_${username}`;
    const defaultData = demoJournals[username] || [];
    return this.getStorage<JournalEntry[]>(key, defaultData);
  }

  saveJournals(username: string, journals: JournalEntry[]): void {
    const key = `propnepal_journals_${username}`;
    this.setStorage(key, journals);
  }

  // ── Trading Accounts Methods ──
  getAccounts(username: string): TradingAccount[] {
    const key = `propnepal_accounts_${username}`;
    let initial: TradingAccount[] = [];
    
    if (username === 'FTMO_Champ') {
      initial = [
        { id: 'acc-d1', name: 'FTMO Challenge $100K', type: 'Challenge', propFirm: 'FTMO', size: 100000 },
        { id: 'acc-d2', name: 'FTMO Funded $100K', type: 'Funded', propFirm: 'FTMO', size: 100000 }
      ];
    } else if (username === 'GoldHunter') {
      initial = [
        { id: 'acc-g1', name: 'FundedNext Challenge $50K', type: 'Challenge', propFirm: 'FundedNext', size: 50000 }
      ];
    } else if (username === 'NepaliScalper') {
      initial = [
        { id: 'acc-n1', name: 'The 5%ers Funded $24K', type: 'Funded', propFirm: 'The 5%ers', size: 24000 }
      ];
    } else if (username === 'PrabeshFX') {
      initial = [
        { id: 'acc-p1', name: 'FTMO Funded $100K', type: 'Funded', propFirm: 'FTMO', size: 100000 }
      ];
    } else if (username === 'SandhyaScalps') {
      initial = [
        { id: 'acc-s1', name: 'FTMO Funded $50K', type: 'Funded', propFirm: 'FTMO', size: 50000 }
      ];
    } else if (username === 'RohanPips') {
      initial = [
        { id: 'acc-r1', name: 'FundedNext Funded $200K', type: 'Funded', propFirm: 'FundedNext', size: 200000 }
      ];
    } else {
      initial = [
        { id: 'acc-initial', name: 'Primary Evaluation $100K', type: 'Challenge', propFirm: 'FTMO', size: 100000 }
      ];
    }
    return this.getStorage<TradingAccount[]>(key, initial);
  }

  saveAccounts(username: string, accounts: TradingAccount[]): void {
    const key = `propnepal_accounts_${username}`;
    this.setStorage(key, accounts);
  }

  getCurrentUser(): { username: string; loggedIn: boolean; avatar: string; email: string; isDemo?: boolean } {
    return this.getStorage('propnepal_user', { username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '', isDemo: false });
  }

  setCurrentUser(user: { username: string; loggedIn: boolean; avatar: string; email: string; isDemo?: boolean }) {
    this.setStorage('propnepal_user', user);
  }

  // ── Journal Settings ──

  getJournalSettings(username: string): JournalSettings {
    const key = `propnepal_journal_settings_${username}`;
    return this.getStorage<JournalSettings>(key, { isPublic: false });
  }

  saveJournalSettings(username: string, settings: JournalSettings): void {
    const key = `propnepal_journal_settings_${username}`;
    this.setStorage(key, settings);
  }

  // ── Trade Feedback / Q&A ──

  getTradeFeedback(tradeId: string): TradeFeedback[] {
    const key = `propnepal_trade_feedback_${tradeId}`;
    return this.getStorage<TradeFeedback[]>(key, []);
  }

  addTradeFeedback(tradeId: string, author: string, comment: string, rating?: number): TradeFeedback {
    const key = `propnepal_trade_feedback_${tradeId}`;
    const currentFeedback = this.getTradeFeedback(tradeId);
    const newFeedback: TradeFeedback = {
      id: `tf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tradeId,
      author,
      comment,
      rating,
      createdAt: new Date().toISOString()
    };
    this.setStorage(key, [...currentFeedback, newFeedback]);
    return newFeedback;
  }

  // ── User Registration & Authentication ──

  getRegisteredUsers(): RegisteredUser[] {
    return this.getStorage<RegisteredUser[]>('propnepal_registered_users', []);
  }

  private saveRegisteredUsers(users: RegisteredUser[]): void {
    this.setStorage('propnepal_registered_users', users);
  }

  registerUser(email: string, username: string, password: string, isDemo?: boolean): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();

    // Check for duplicate email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    // Check for duplicate username
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'This username is already taken. Try a different one.' };
    }

    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      username,
      password: btoa(password), // Simple encoding for mock (not real hashing)
      avatar: username.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      isDemo
    };

    this.saveRegisteredUsers([...users, newUser]);

    if (isDemo) {
      const rawProfiles = this.getRawProfiles();
      const newProfile: TraderProfile = {
        id: `tp-${username.toLowerCase()}`,
        name: 'Demo Trader',
        handle: `@${username}`,
        avatar: '⚡',
        propFirms: ['Simulated Account'],
        balance: '$100,000',
        winRate: '0%',
        profitSplit: '0%',
        status: 'Active',
        equityCurve: [0, 0, 0, 0, 0, 0, 0, 0],
        bio: 'Demo simulation profile. Contains simulated trading data only.',
        isDemo: true
      };
      this.saveProfiles([...rawProfiles, newProfile]);
    }

    return { success: true };
  }

  authenticateUser(email: string, password: string): { success: boolean; username?: string; avatar?: string; isDemo?: boolean; error?: string } {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }

    if (atob(user.password) !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    return { success: true, username: user.username, avatar: user.avatar, isDemo: user.isDemo };
  }

  deleteUserAccount(username: string): void {
    // 1. Remove from registered users list
    const users = this.getRegisteredUsers();
    this.saveRegisteredUsers(users.filter(u => u.username !== username));

    // 2. Remove journal and settings from local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`propnepal_journals_${username}`);
      localStorage.removeItem(`propnepal_journal_settings_${username}`);
      localStorage.removeItem(`propnepal_accounts_${username}`);
    }

    // 3. Remove profile from localStorage
    const rawProfiles = this.getRawProfiles();
    const updatedProfiles = rawProfiles.filter(p => p.handle.toLowerCase() !== `@${username.toLowerCase()}`);
    this.saveProfiles(updatedProfiles);
  }

  getAds(): Ad[] {
    return this.getStorage<Ad[]>('propnepal_ads', initialAds);
  }

  saveAds(ads: Ad[]): void {
    this.setStorage('propnepal_ads', ads);
  }

  getAcademyModules(): CourseModule[] {
    return this.getStorage<CourseModule[]>('propnepal_academy_modules', initialModules);
  }

  saveAcademyModules(modules: CourseModule[]): void {
    this.setStorage('propnepal_academy_modules', modules);
  }

  // --- Premium Strategies ---
  getPremiumStrategies(): PremiumStrategy[] {
    return this.getStorage<PremiumStrategy[]>('propnepal_premium_strategies', initialPremiumStrategies);
  }

  savePremiumStrategies(strategies: PremiumStrategy[]): void {
    this.setStorage('propnepal_premium_strategies', strategies);
  }

  // --- Premium Access / eSewa Payment ---
  getPremiumAccessList(): PremiumAccess[] {
    return this.getStorage<PremiumAccess[]>('propnepal_premium_access', []);
  }

  savePremiumAccessList(list: PremiumAccess[]): void {
    this.setStorage('propnepal_premium_access', list);
  }

  requestPremiumAccess(username: string, esewaTransactionId: string): void {
    const list = this.getPremiumAccessList();
    // Remove any previous pending/rejected request for this user
    const filtered = list.filter(a => !(a.username === username && a.status !== 'verified'));
    filtered.push({
      username,
      esewaTransactionId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    this.savePremiumAccessList(filtered);
  }

  verifyPremiumAccess(username: string): void {
    const list = this.getPremiumAccessList();
    const updated = list.map(a =>
      a.username === username && a.status === 'pending'
        ? { ...a, status: 'verified' as const, verifiedAt: new Date().toISOString() }
        : a
    );
    this.savePremiumAccessList(updated);
  }

  rejectPremiumAccess(username: string): void {
    const list = this.getPremiumAccessList();
    const updated = list.map(a =>
      a.username === username && a.status === 'pending'
        ? { ...a, status: 'rejected' as const }
        : a
    );
    this.savePremiumAccessList(updated);
  }

  hasVerifiedAccess(username: string): boolean {
    const list = this.getPremiumAccessList();
    return list.some(a => a.username === username && a.status === 'verified');
  }

  getUserAccessStatus(username: string): PremiumAccess | undefined {
    const list = this.getPremiumAccessList();
    return list.find(a => a.username === username);
  }

  adminUpdateProfile(updated: TraderProfile): void {
    const rawProfiles = this.getRawProfiles();
    const next = rawProfiles.map(p => p.id === updated.id ? updated : p);
    this.saveProfiles(next);
  }

  adminCreateProfile(profile: TraderProfile): void {
    const rawProfiles = this.getRawProfiles();
    this.saveProfiles([...rawProfiles, profile]);
  }

  adminDeleteProfile(id: string): void {
    const rawProfiles = this.getRawProfiles();
    this.saveProfiles(rawProfiles.filter(p => p.id !== id));
  }

  getAllPublicTraders(): { username: string; avatar: string }[] {
    const users = this.getRegisteredUsers();
    return users
      .filter(user => {
        const settings = this.getJournalSettings(user.username);
        return settings.isPublic;
      })
      .map(user => ({
        username: user.username,
        avatar: user.avatar
      }));
  }

  getAllPublicJournals(): (JournalEntry & { avatar: string })[] {
    const users = this.getRegisteredUsers();
    let publicJournals: (JournalEntry & { avatar: string })[] = [];
    
    users.forEach(user => {
      const settings = this.getJournalSettings(user.username);
      if (settings.isPublic) {
        const userJournals = this.getJournals(user.username);
        const mapped = userJournals.map(journal => ({
          ...journal,
          avatar: user.avatar || '👤'
        }));
        publicJournals = [...publicJournals, ...mapped];
      }
    });
    
    return publicJournals.sort((a, b) => b.id.localeCompare(a.id));
  }
}

export interface RegisteredUser {
  id: string;
  email: string;
  username: string;
  password: string; // base64 encoded (mock only)
  avatar: string;
  createdAt: string;
  isDemo?: boolean;
}

export const db = new MockSupabaseEngine();
