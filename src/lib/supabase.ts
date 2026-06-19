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
  isComingSoon?: boolean;
}

export interface PremiumAccess {
  username: string;
  esewaTransactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  requestedAt: string;
  verifiedAt?: string;
}

export type Emotion = 'calm' | 'confident' | 'anxious' | 'fomo' | 'revenge' | 'frustrated' | 'neutral';
export type SetupType = 'Supply Zone' | 'Demand Zone' | 'FVG Fill' | 'Breakout' | 'Breakdown' | 'Scalp' | 'Trend Follow' | 'Mean Reversion' | 'News Trade' | 'Liquidity Sweep' | 'Order Block' | 'No Setup' | 'Other';
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
  'Liquidity Sweep', 'Order Block', 'No Setup', 'Other'
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

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  progress: { current: number; target: number };
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
    title: '🚀 Got my first Freelancing performance fees approved on FundedNext! $1,240 split processed via eSewa!',
    content: 'Stoked to share that my 80/20 split Freelancing performance fees from FundedNext was processed today! I requested it yesterday and it arrived directly via eSewa in NPR. Big shoutout to this community for keeping me motivated during the evaluation phase! Keep pushing guys, it is real.',
    author: 'BishalFX',
    category: 'Performance Fees',
    tags: ['FundedNext', 'PerformanceFees', 'eSewa'],
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
    refundFee: 'Yes (100% Refundable on First Performance Fee Withdrawal)',
    localSupport: 'Medium-High (Supports Freelancing performance fees, Deel, RISE wallet to Nepali bank)',
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
    localSupport: 'Medium (Freelancing performance fees, Wire Transfers, Deel, Card)',
    pros: ['Very relaxed rules & low profit target (6%)', 'Immediate funding program available', 'Excellent growth/scaling program up to $4M'],
    cons: ['Tight drawdown limits (6% overall max)', 'Minimum active trading day requirements']
  }
];

const initialModules: CourseModule[] = [
  {
    id: 'mod-1',
    level: 'Beginner',
    title: 'Prop Firm Fundamentals',
    duration: '1.5 Hours',
    desc: 'Understand how modern prop trading works, the differences between evaluation challenges, and how to select the right funding provider in Nepal.',
    lessons: [
      {
        title: '1. Introduction to Prop Capital',
        content: 'Proprietary trading firms (prop firms) provide traders with access to large sums of capital in exchange for a percentage of the profits. This model allows talented traders to scale their income without risking their personal savings.\n\nKey Concepts:\n• Leverage: Instead of risking your own limited money, you trade the firm\'s funds (from $5,000 up to $200,000+).\n• Profit-Sharing: You keep 80% to 90% of the profits you generate. The firm takes the remaining 10-20% split.\n• Buying Power: In Nepal, accessing substantial trading capital is difficult due to foreign currency limits. Prop firms resolve this by acting as liquidity backers.',
        mediaUrl: '/feed-images/trading-chart-gold.png',
        mediaType: 'image'
      },
      {
        title: '2. NRB Prepaid Dollar Card & Payments',
        content: 'In Nepal, making international purchases is restricted. To buy a prop firm challenge, you must navigate local payment channels.\n\nPrepaid Dollar Card Steps:\n1. Open a bank account at any Class A Commercial Bank in Nepal (e.g., Nabil Bank, Global IME, NIC Asia).\n2. Apply for a PAN Card (Permanent Account Number) at the nearest Inland Revenue Office (IRO).\n3. Submit your PAN Card, Citizenship/Passport, and bank application for a Nepal Rastra Bank (NRB) Prepaid Dollar Card. The annual spending limit is $500 USD.\n4. Load NPR into your account; the bank converts it to USD on the card for a small fee (~Rs 500 card fee).\n\nAlternative Payments:\n• Relatives Abroad: You can have a friend/relative abroad pay for your challenge via credit card or PayPal.\n• eSewa / Local Brokers: Some prop firms (e.g., FundedNext) support local payment gateways, allowing direct payments.',
        mediaUrl: '/feed-images/nepal-dollar-card.png',
        mediaType: 'image'
      },
      {
        title: '3. Evaluation vs Instant Funding',
        content: 'Prop firms offer different challenge types. Understanding their targets and rules is crucial before starting.\n\n1. Evaluation (2-Phase) Model:\n• Phase 1: Profit target is usually 8% to 10% within no time limit (or 30 days historically). Daily drawdown limit is 5%, and overall drawdown limit is 10%.\n• Phase 2: Profit target is reduced to 5% to prove consistency. Same drawdown limits apply.\n• Refund: The registration fee is fully refunded with your first successful payout split.\n\n2. Instant Funding Model:\n• Skip the test phase and trade live capital immediately.\n• Cons: Much higher initial registration fees, lower profit splits (50% to 60%), and tighter drawdown rules (usually 5% maximum total drawdown).',
        mediaUrl: '/feed-images/nepse-chart.png',
        mediaType: 'image'
      },
      {
        title: '4. Understanding Bid, Ask, Spread & Commissions',
        content: 'When you trade on platforms like MT5, you do not buy or sell at a single price. You trade between two prices: the Bid and the Ask.\n\nKey Definitions:\n• Bid Price: The price the market is willing to pay to buy from you (the price you sell/short at).\n• Ask Price: The price the market asks you to pay to buy from it (the price you buy/long at).\n• Spread: The difference between the Ask price and the Bid price. Spread is the transaction cost charged by the broker.\n• Spread Formula: Spread = Ask Price - Bid Price. For example, if EURUSD Ask is 1.0852 and Bid is 1.0850, the spread is 2 pips.\n\nProp Firm Relevance:\nProp firms offer Raw Spread accounts with extremely low spreads (near 0.0 pips) but charge a flat Commission (e.g. $3 to $7 per lot) on every trade. Be careful: during market rollover (2:45 AM NST), spreads widen massively. If your stop loss is close, the wide spread can trigger your stop and breach your daily drawdown limit, even if the candlestick chart doesn\'t show price reaching that level!',
        mediaUrl: '/feed-images/bid-ask-spread.png',
        mediaType: 'image'
      },
      {
        title: '5. Setting Up MT5, cTrader & DXTrade',
        content: 'Once you sign up, the prop firm will email you your trading account credentials. You must connect them to a trading platform.\n\nStep-by-Step Platform Setup:\n1. Download the Platform: Download MetaTrader 5 (MT5), cTrader, or DxTrade for your PC, iOS, or Android devices.\n2. Choose Server: Look up the exact broker server name provided by the firm (e.g., "FundedNext-Server" or "FTMO-Demo"). Do not select the default MetaQuotes server.\n3. Login Credentials: Enter the Account ID (Login) and Master Password. Make sure not to use the Investor Password (which is read-only).\n4. Position Sizing: lot sizes differ across assets. On currency pairs, 1 lot = $10 per pip. On Gold (XAUUSD), 1 lot = $10 per point. Always use a position size calculator to verify your stop-loss risk aligns with less than 1% of your daily drawdown limit.',
        mediaUrl: '/feed-images/mt5-setup-guide.png',
        mediaType: 'image'
      },
      {
        title: '6. KYC Verification & NPR Performance Fee Withdrawals',
        content: 'Once you pass your challenge or earn profits on a funded account, you can request withdrawals of your freelancing performance fees directly to Nepal.\n\nKYC (Know Your Customer) Verification:\n• Identity: Upload your Nepali Citizenship Card (colored scan, front and back) or Passport. Some firms require English translation if the text is strictly in Devanagari.\n• Address: Upload a bank statement showing your name and home address with a clear bank stamp, or a utility bill (electricity, water, internet) not older than 3 months.\n\nReceiving Freelancing Performance Fees in Nepal:\n• Payout Portals: Most firms use RISE or Deel portals to manage contracts and payouts.\n• Nepali Bank Withdrawal: Freelancing performance fees can be withdrawn directly to your local Nepalese bank account (NPR bank transfers) from your RISE wallet or Deel portal via local payout partners.',
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
        title: '1. Equity vs Balance-Based Drawdowns',
        content: 'Firms track your losses relative to two main reference points: starting balance or starting equity. Knowing how they calculate this is the difference between keeping or losing your account.\n\nBalance-Based Drawdown:\n• Calculated relative to your cash balance at the daily reset time (typically 5:00 PM EST / 2:45 AM NST).\n• Example: If your day starts with $100,000, your 5% limit is $95,000. If you have a trade floating at +$4,000 and it reverses to -$1,000, your cash balance was never closed at +$4,000, so your daily boundary remains $95,000. You are safe!\n\nEquity-Based Drawdown (Tighter):\n• Calculated relative to your highest floating equity peak.\n• Example: If your day starts with $100,000, your 5% limit is $95,000. But if your trade floats up to +$4,000, your daily peak is $104,000. Your daily drawdown limit adjusts to $99,000 ($104,000 - $5,000). If that trade pulls back to -$1,000 (equity becomes $99,000), your account is violated! Always close running trades near structural targets to avoid equity trailing breaches.',
        mediaUrl: '/feed-images/drawdown-guide.png',
        mediaType: 'image'
      },
      {
        title: '2. Setting Daily Automatic Risk Stops',
        content: 'Relying on human willpower to stop trading during a drawdown is a primary cause of failed evaluations. Successful traders automate their risk rules.\n\nPractical Risk Stop Guidelines:\n• Hard Broker Stops: Configure automated alerts on MetaTrader 5 or install a local risk manager EA (Expert Advisor) that automatically closes all active positions if your daily loss hits 4% (giving you a 1% safety buffer before the firm\'s 5% limit).\n• Daily Target Alerts: Set alert sounds on your phone for structural price targets so you don\'t sit staring at charts, which encourages FOMO or revenge trading.\n• Capital Allocation: Never risk more than 0.5% to 1% per trade. If your daily maximum drawdown is 5%, you must have at least 5 consecutive losses before losing your account.',
        mediaUrl: '/feed-images/trading-journal.png',
        mediaType: 'image'
      },
      {
        title: '3. Handling News Slippage Policies',
        content: 'Firms strictly limit trading during high-impact news reports (e.g., NFP, FOMC, CPI) because massive volatility can trigger "slippage."\n\nNews Trading Realities:\n• What is Slippage?: During news events, liquidity drops, and spreads widen. If you set a stop loss at 2030 on Gold and news drops, the next available market price might be 2020. Your trade gets closed at 2020 instead of 2030, doubling your intended risk and violating your drawdown limits.\n• The 2-Minute Rule: Most prop firms ban opening or closing trades within 2 minutes before and after high-impact news releases. Swing trades are exempt in swing account types, but scalping is strictly forbidden. Always close your short-term positions at least 5 minutes prior to news events.',
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
        title: '1. Order Blocks & Fair Value Gaps (FVG)',
        content: 'To clear an evaluation challenge, you must achieve high Risk-to-Reward (R:R) ratios. Smart Money Concepts (SMC) help locate institutional footprints to trade with tight stop losses.\n\nFair Value Gap (FVG):\n• Occurs when a highly displaced candle leaves behind an imbalance. It is marked as the empty gap between the wick high of Candle 1 and the wick low of Candle 3 in a 3-candle sequence.\n• Institutions often return price to fill these imbalances before continuing the trend. Mark these on your M15/H1 charts.\n\nOrder Blocks (OB):\n• A zone representing institutional order accumulation. It is the final bearish candle before a displacement bullish run that breaks market structure, or the final bearish run that breaks market structure. Set limit entries at the open or 50% equilibrium level of the Order Block.',
        mediaUrl: '/feed-images/trading-chart-gold.png',
        mediaType: 'image'
      },
      {
        title: '2. Identifying Asian Session Liquidity Sweeps',
        content: 'The Asian session consolidation range behaves as a major pool of buy/sell stop liquidity. Institutional algorithms hunt these levels before the true trend begins during London or New York sessions.\n\nStep-by-Step Liquidity Sweep Strategy:\n1. Mark Range: Box the consolidation high and low during the Tokyo session (00:00 to 08:00 UTC / 5:45 AM to 1:45 PM NST).\n2. Wait for the Sweep: Watch price spike above the consolidation high or below the low during the London open (1:45 PM NST) to hunt retail stop losses.\n3. Spot displacement: Wait for a sharp rejection wick on M15/M5 back inside the range, creating a Change of Character (CHoCH).\n4. Entry: Enter on the retest of the newly formed FVG. Place stop-loss 2 pips beyond the sweep wick. Target the opposite side of the range for a high R:R ratio (usually 1:3+).',
        mediaUrl: '/feed-images/smc-liquidity-sweep.png',
        mediaType: 'image'
      },
      {
        title: '3. Risk Scaling on Win Streaks',
        content: 'Psychological pitfalls usually occur when a trader is close to passing the evaluation. Learn how to adjust position sizing near targets.\n\nRisk Scaling Blueprint:\n• Reverse Scale: If you are at 7.5% profit on a $100,000 account and need only $500 (0.5%) to clear Phase 1, reduce your risk from 1% down to 0.25%. This gives you 2 chances to secure the remaining target, rather than risking a single trade that could return you to breakeven or drawdown.\n• Buffer Management: Once you pass Phase 1, reset your psychological counter. Treat Phase 2 as a brand new challenge with smaller profit targets (5%). Always keep your risk small and focus on consistency over speedy passing.',
        mediaUrl: '/feed-images/trading-journal.png',
        mediaType: 'image'
      }
    ]
  }
];

const initialPremiumStrategies: PremiumStrategy[] = [
  {
    id: 'strat-1',
    title: 'Session based liquidity hunt',
    description: 'Advanced liquidity hunt strategy focusing on session liquidity sweeps and institutional order blocks. Designed for Funded accounts.',
    asset: 'XAUUSD',
    timeframe: 'M15',
    winRate: '75%',
    riskReward: '1:3',
    previewText: 'Sweeping session liquidity is one of the most reliable institutional patterns. This strategy details entry confirmations and stop-loss placements based on session high/low sweeps.',
    content: 'Coming Soon - Session based liquidity hunt strategy.',
    imageUrl: '/feed-images/trading-chart-gold.png',
    createdAt: '2026-06-19T00:00:00Z',
    isComingSoon: true
  },
  {
    id: 'strat-2',
    title: 'Volume profile Strategy',
    description: 'Volume Profile strategy mapping high volume nodes (HVN), point of control (POC), and value areas to find institutional support/resistance.',
    asset: 'NAS100',
    timeframe: 'H1',
    winRate: '72%',
    riskReward: '1:4',
    previewText: 'Trade with volume confirmation. Find dynamic institutional support and resistance zones using the Volume Profile indicator, Value Area High (VAH), and Value Area Low (VAL).',
    content: 'Coming Soon - Volume profile Strategy.',
    imageUrl: '/feed-images/nepse-chart.png',
    createdAt: '2026-06-19T00:00:00Z',
    isComingSoon: true
  }
];

const initialAds: Ad[] = [
  {
    id: 'ad-propnpl',
    text: 'Join propNPL Elite community. Log journals, verify payouts, and master prop challenges with the ultimate Nepalese trading network!',
    author: 'propNPL Academy',
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
      const storedVersion = localStorage.getItem('propnpl_data_version');
      if (storedVersion !== DATA_VERSION) {
        // Wipe all cached propnpl items to load newly seeded structures
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('propnpl_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('propnpl_data_version', DATA_VERSION);
      }

      // Initialize demo profiles registration & settings to public
      const demoRoles = ['FTMO_Champ', 'GoldHunter', 'NepaliScalper', 'PrabeshFX', 'SandhyaScalps', 'RohanPips', 'BishalFX'];
      const usersKey = 'propnpl_registered_users';
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
      const adminEmail = 'admin@propnpl.com';
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
        const email = `${role.toLowerCase()}@propnpl.com`;
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
        const settingsKey = `propnpl_journal_settings_${role}`;
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
    return this.getStorage<Post[]>('propnpl_posts', initialPosts);
  }

  savePosts(posts: Post[]): void {
    this.setStorage('propnpl_posts', posts);
  }

  getRawProfiles(): TraderProfile[] {
    return this.getStorage<TraderProfile[]>('propnpl_profiles', initialProfiles);
  }

  saveProfiles(profiles: TraderProfile[]): void {
    this.setStorage('propnpl_profiles', profiles);
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
    return this.getStorage<Payout[]>('propnpl_payouts', initialPayouts);
  }

  savePayouts(payouts: Payout[]): void {
    this.setStorage('propnpl_payouts', payouts);
  }

  getReviews(): Review[] {
    return initialReviews; // Reviews are static references
  }

  getJournals(username?: string): JournalEntry[] {
    if (!username) return [];
    const key = `propnpl_journals_${username}`;
    const defaultData = demoJournals[username] || [];
    return this.getStorage<JournalEntry[]>(key, defaultData);
  }

  saveJournals(username: string, journals: JournalEntry[]): void {
    const key = `propnpl_journals_${username}`;
    this.setStorage(key, journals);
  }

  // ── Trading Accounts Methods ──
  getAccounts(username: string): TradingAccount[] {
    const key = `propnpl_accounts_${username}`;
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
    const key = `propnpl_accounts_${username}`;
    this.setStorage(key, accounts);
  }

  getCurrentUser(): { username: string; loggedIn: boolean; avatar: string; email: string; isDemo?: boolean } {
    return this.getStorage('propnpl_user', { username: 'GuestTrader', loggedIn: false, avatar: '👤', email: '', isDemo: false });
  }

  setCurrentUser(user: { username: string; loggedIn: boolean; avatar: string; email: string; isDemo?: boolean }) {
    this.setStorage('propnpl_user', user);
  }

  // ── Journal Settings ──

  getJournalSettings(username: string): JournalSettings {
    const key = `propnpl_journal_settings_${username}`;
    return this.getStorage<JournalSettings>(key, { isPublic: false });
  }

  saveJournalSettings(username: string, settings: JournalSettings): void {
    const key = `propnpl_journal_settings_${username}`;
    this.setStorage(key, settings);
  }

  // ── Trade Feedback / Q&A ──

  getTradeFeedback(tradeId: string): TradeFeedback[] {
    const key = `propnpl_trade_feedback_${tradeId}`;
    return this.getStorage<TradeFeedback[]>(key, []);
  }

  addTradeFeedback(tradeId: string, author: string, comment: string, rating?: number): TradeFeedback {
    const key = `propnpl_trade_feedback_${tradeId}`;
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

  getUserBadges(username: string): Badge[] {
    const journals = this.getJournals(username) || [];
    const payouts = this.getPayouts() || [];

    // 1. Consistency Streak (🔥): Log at least 3 consecutive calendar days
    const uniqueDates = Array.from(new Set(journals.map(j => j.date))).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    if (uniqueDates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
    }

    // 2. Risk Manager (🛡️): risk <= 1% for last 5 trades
    const sortedJournals = [...journals].sort((a, b) => b.id.localeCompare(a.id));
    let consecutiveRiskOk = 0;
    for (const j of sortedJournals) {
      if (j.riskPct !== undefined && j.riskPct <= 1.0 && j.riskPct > 0) {
        consecutiveRiskOk += 1;
        if (consecutiveRiskOk >= 5) break;
      } else {
        break; // consecutive broken
      }
    }

    // 3. Mindful Trader (🧘): checklist complete for last 5 trades
    let consecutiveMindfulOk = 0;
    for (const j of sortedJournals) {
      if (j.newsChecked && j.riskSet && j.mindsetReady) {
        consecutiveMindfulOk += 1;
        if (consecutiveMindfulOk >= 5) break;
      } else {
        break; // consecutive broken
      }
    }

    // 4. Payout Pioneer (💰): at least 1 verified payout
    const traderPayouts = payouts.filter(
      p => p.trader.toLowerCase() === username.toLowerCase() && p.verified
    );
    const hasPayout = traderPayouts.length > 0;

    // 5. SMC Scholar (🎓): positive net P&L on SMC setups
    const smcSetups = ['Supply Zone', 'Demand Zone', 'FVG Fill', 'Liquidity Sweep', 'Order Block'];
    const smcTrades = journals.filter(j => smcSetups.includes(j.setup));
    const smcPnl = smcTrades.reduce((acc, j) => acc + j.pnl, 0);
    const hasSmcProfit = smcTrades.length > 0 && smcPnl > 0;

    return [
      {
        id: 'streak',
        name: 'Consistency Streak',
        emoji: '🔥',
        description: 'Log trades on at least 3 consecutive days to build momentum.',
        unlocked: maxStreak >= 3,
        progress: { current: Math.min(maxStreak, 3), target: 3 }
      },
      {
        id: 'risk_manager',
        name: 'Risk Manager',
        emoji: '🛡️',
        description: 'Keep capital risk strictly at or below 1% for 5 consecutive trades.',
        unlocked: consecutiveRiskOk >= 5,
        progress: { current: Math.min(consecutiveRiskOk, 5), target: 5 }
      },
      {
        id: 'mindful_trader',
        name: 'Mindful Trader',
        emoji: '🧘',
        description: 'Check news, define risk, and prepare mindset for 5 consecutive trades.',
        unlocked: consecutiveMindfulOk >= 5,
        progress: { current: Math.min(consecutiveMindfulOk, 5), target: 5 }
      },
      {
        id: 'payout_pioneer',
        name: 'Payout Pioneer',
        emoji: '💰',
        description: 'Earn and showcase your first verified prop firm payout.',
        unlocked: hasPayout,
        progress: { current: hasPayout ? 1 : 0, target: 1 }
      },
      {
        id: 'smc_scholar',
        name: 'SMC Scholar',
        emoji: '🎓',
        description: 'Earn a positive net profit across Smart Money Concepts setups.',
        unlocked: hasSmcProfit,
        progress: { current: hasSmcProfit ? 1 : 0, target: 1 }
      }
    ];
  }

  // ── User Registration & Authentication ──

  getRegisteredUsers(): RegisteredUser[] {
    return this.getStorage<RegisteredUser[]>('propnpl_registered_users', []);
  }

  saveRegisteredUsers(users: RegisteredUser[]): void {
    this.setStorage('propnpl_registered_users', users);
  }

  updatePassword(username: string, newPass: string): void {
    const users = this.getRegisteredUsers();
    const updated = users.map(u => u.username === username ? { ...u, password: btoa(newPass) } : u);
    this.saveRegisteredUsers(updated);
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
      localStorage.removeItem(`propnpl_journals_${username}`);
      localStorage.removeItem(`propnpl_journal_settings_${username}`);
      localStorage.removeItem(`propnpl_accounts_${username}`);
    }

    // 3. Remove profile from localStorage
    const rawProfiles = this.getRawProfiles();
    const updatedProfiles = rawProfiles.filter(p => p.handle.toLowerCase() !== `@${username.toLowerCase()}`);
    this.saveProfiles(updatedProfiles);
  }

  getAds(): Ad[] {
    return this.getStorage<Ad[]>('propnpl_ads', initialAds);
  }

  saveAds(ads: Ad[]): void {
    this.setStorage('propnpl_ads', ads);
  }

  getAcademyModules(): CourseModule[] {
    const cached = this.getStorage<CourseModule[]>('propnpl_academy_modules', initialModules);
    const mod1 = cached.find(m => m.id === 'mod-1');
    const mod2 = cached.find(m => m.id === 'mod-2');
    const mod3 = cached.find(m => m.id === 'mod-3');
    const isStale = !mod1 || mod1.lessons.length < 6 ||
                    !mod2 || mod2.lessons.length < 3 || !mod2.lessons[0].title.startsWith('1.') ||
                    !mod3 || mod3.lessons.length < 3 || !mod3.lessons[0].title.startsWith('1.');
    if (isStale) {
      this.saveAcademyModules(initialModules);
      return initialModules;
    }
    return cached;
  }

  saveAcademyModules(modules: CourseModule[]): void {
    this.setStorage('propnpl_academy_modules', modules);
  }

  // --- Premium Strategies ---
  getPremiumStrategies(): PremiumStrategy[] {
    this.setStorage('propnpl_premium_strategies', initialPremiumStrategies);
    return initialPremiumStrategies;
  }

  savePremiumStrategies(strategies: PremiumStrategy[]): void {
    this.setStorage('propnpl_premium_strategies', strategies);
  }

  // --- Premium Access / eSewa Payment ---
  getPremiumAccessList(): PremiumAccess[] {
    return this.getStorage<PremiumAccess[]>('propnpl_premium_access', []);
  }

  savePremiumAccessList(list: PremiumAccess[]): void {
    this.setStorage('propnpl_premium_access', list);
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
