import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'manirajpandey@propnepal.com';
    const password = 'Password123!';

    // Attempt to login first to get the session and userId
    const loginRes = await api.login(email, password);
    if (!loginRes || !loginRes.success || !loginRes.user) {
      return NextResponse.json({ success: false, error: 'Could not login Maniraj Pandey' });
    }
    const userId = loginRes.user.id;

    // Delete existing posts by this user
    await supabase.from('posts').delete().eq('user_id', userId);

    // The QA test post was created at around 2026-06-18T16:00.
    // To make these appear AFTER the QA post (i.e. older than it), 
    // we need to set created_at to times in the past.
    
    // We want the order (Top to Bottom):
    // 1. QA post (Current time)
    // 2. What is Prop Trading? (1 hour ago)
    // 3. Pros of Prop Firm Trading (2 hours ago)
    // 4. How a Journal & Checklist Helps You Pass Prop Challenges (3 hours ago)

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();

    const postsToInsert = [
      {
        user_id: userId,
        title: 'What is Prop Firm Trading?',
        content: `Proprietary (Prop) Firm Trading is a business model where a company provides capital to skilled traders. Instead of risking your own hard-earned money, you trade the firm's capital. \n\nThe process usually involves an evaluation phase (challenge) where you must prove your profitability and risk management skills. Once passed, you become a "Funded Trader". You keep a large majority of the profits (usually 80-90%), and the firm covers any losses. It's the ultimate path to scaling your trading career!`,
        category: 'Education',
        image_url: '/images/posts/prop_trading_concept.png',
        created_at: oneHourAgo,
        upvotes: 24
      },
      {
        user_id: userId,
        title: 'The Pros of Prop Firm Trading',
        content: `Why should you trade with a Prop Firm instead of a personal broker account?\n\n1. **Zero Personal Capital Risk**: You are trading the firm's money. If you hit the max drawdown, you lose the account, but you are not liable for the financial loss.\n2. **Huge Buying Power**: Scaling a $500 account to $10,000 takes years. Passing a $100k prop challenge takes weeks, giving you massive leverage instantly.\n3. **Psychological Relief**: Trading other people's money often removes the emotional attachment to the funds, allowing you to execute your strategy mechanically.\n4. **Strict Risk Rules**: The firm enforces daily and maximum drawdowns. While annoying at first, it forces you to become a highly disciplined trader.`,
        category: 'Discussion',
        image_url: '/images/posts/prop_firm_pros.png',
        created_at: twoHoursAgo,
        upvotes: 18
      },
      {
        user_id: userId,
        title: 'How a Journal & Checklist Helps You Pass Prop Challenges',
        content: `The #1 reason traders fail prop firm challenges isn't bad strategies—it's poor discipline and lack of a trading plan. \n\nHere is how maintaining a journal and checklist guarantees your success:\n- **The Checklist**: Before entering ANY trade, you must tick off your criteria (e.g., Is it at a key level? Is there a catalyst? Is the Risk:Reward 1:2+?). If the checklist isn't complete, you don't trade. This prevents impulsive gambling.\n- **The Journal**: By logging every trade in the PropNepal Trading Journal, you collect data. After 20 trades, you can review your win rate, best setups, and worst mistakes. You stop guessing and start trading based on statistics.\n\nTreat trading like a business, use your journal, stick to your checklist, and the payouts will follow!`,
        category: 'Strategies',
        image_url: '/images/posts/trading_journal_checklist.png',
        created_at: threeHoursAgo,
        upvotes: 35
      }
    ];

    const { data, error } = await supabase.from('posts').insert(postsToInsert).select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, inserted: data?.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message });
  }
}
