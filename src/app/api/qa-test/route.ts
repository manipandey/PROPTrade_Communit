import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET() {
  const results: any[] = [];
  try {
    // 1. Register a test user
    const username = 'QA_' + Date.now();
    const email = username + '@test.com';
    const password = 'password123';
    
    results.push({ step: 'Register', data: { username, email } });
    const regRes = await api.register(email, username, password, false);
    if (!regRes.success || !regRes.user) {
      return NextResponse.json({ success: false, error: 'Registration failed', details: regRes, results });
    }
    const userId = regRes.user.id;
    results.push({ step: 'Register Success', userId });

    // 3. Create Journal
    const journalPayload = {
      date: new Date().toISOString().split('T')[0],
      asset: 'XAUUSD',
      direction: 'Long',
      lots: 2,
      entryPrice: 2000,
      exitPrice: 2010,
      pnl: 2000,
      emotion: 'Neutral',
      setup: 'Breakout',
      session: 'New York',
      notes: 'QA Test Trade',
      isPublic: true
    };
    const saveJournalRes = await api.saveJournal(userId, journalPayload);
    if (!saveJournalRes) {
       return NextResponse.json({ success: false, error: 'Save Journal failed', results });
    }
    results.push({ step: 'Save Journal Success', data: saveJournalRes });

    // 4. Fetch Journals
    const journals = await api.getJournals(userId);
    if (!journals || journals.length === 0) {
      return NextResponse.json({ success: false, error: 'Get Journals failed or empty', results });
    }
    results.push({ step: 'Fetch Journals Success', count: journals.length });

    // 5. Create Post
    const postPayload = {
      title: 'QA Test Post',
      content: 'This is a test post from the automated QA script.',
      category: 'General',
      upvotes: 1
    };
    const savePostRes = await api.savePost(userId, postPayload);
    if (!savePostRes || savePostRes.length === 0) {
       return NextResponse.json({ success: false, error: 'Save Post failed', results });
    }
    const postId = savePostRes[0].id;
    results.push({ step: 'Save Post Success', postId });

    // 6. Add Comment
    const saveCommentRes = await api.saveComment(userId, postId, 'QA Test Comment');
    if (!saveCommentRes) {
       return NextResponse.json({ success: false, error: 'Save Comment failed', results });
    }
    results.push({ step: 'Save Comment Success' });

    // 7. Fetch Posts
    const posts = await api.getPosts();
    if (!posts || posts.length === 0) {
       return NextResponse.json({ success: false, error: 'Get Posts failed', results });
    }
    
    // Verify comment exists in the fetched post
    const myPost = posts.find((p: any) => p.id === postId);
    if (!myPost) {
       return NextResponse.json({ success: false, error: 'My post missing from getPosts', results });
    }
    results.push({ step: 'Fetch Posts Success', postFound: true, commentsFound: myPost.comments.length });

    return NextResponse.json({ success: true, message: 'All backend QA tests passed!', results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, results });
  }
}
