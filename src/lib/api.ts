/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabaseClient';
import { db, Comment, Payout, TraderProfile, TradingAccount, Ad, CourseModule, PremiumAccess, TradeFeedback } from './supabase';

const mockAuthListeners: Array<(user: any) => void> = [];

export interface SupabaseComment {
  id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  profiles: { username: string; avatar: string } | null;
  comment_reactions: { reaction_type: string; user_id: string }[] | null;
}

export interface SupabasePost {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  upvotes: number | null;
  created_at: string;
  profiles: { username: string; avatar: string } | null;
  comments: SupabaseComment[] | null;
  post_reactions?: { reaction_type: string; user_id: string }[] | null;
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string) {
    // 1. Try local mock authentication first (for admin/demo seeded users)
    const mockRes = db.authenticateUser(email, password);
    if (mockRes.success && mockRes.username) {
      const mockUser = {
        id: 'mock-' + mockRes.username.toLowerCase(),
        email: email,
        username: mockRes.username,
        avatar: mockRes.avatar || '👤',
        is_demo: mockRes.isDemo || false
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('propnpl_mock_session', JSON.stringify(mockUser));
        mockAuthListeners.forEach(cb => cb(mockUser));
      }
      return { success: true, user: mockUser };
    }

    // 2. Fallback to Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    // Fetch profile
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('propnpl_mock_session');
      }
      return { success: true, user: { ...data.user, ...profile } };
    }
    return { success: false, message: 'Unknown error' };
  },

  async loginWithOAuth(provider: 'google' | 'github' | 'apple') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) return { success: false, message: error.message };
    return { success: true };
  },

  async register(email: string, username: string, password: string, isDemo: boolean = false) {
    if (isDemo) {
      const regRes = db.registerUser(email, username, password, true);
      if (!regRes.success) {
        return { success: false, message: regRes.error || 'Registration failed.' };
      }
      const mockUser = {
        id: 'mock-' + username.toLowerCase(),
        email: email,
        username: username,
        avatar: '👤',
        is_demo: true
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('propnpl_mock_session', JSON.stringify(mockUser));
        mockAuthListeners.forEach(cb => cb(mockUser));
      }
      return { success: true, user: mockUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };

    if (data.user) {
      // Insert profile
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: data.user.id, username, email, is_demo: isDemo }
      ]);
      if (profileError) return { success: false, message: profileError.message };
      if (typeof window !== 'undefined') {
        localStorage.removeItem('propnpl_mock_session');
      }
      return { success: true, user: data.user };
    }
    return { success: false, message: 'Unknown error' };
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('propnpl_mock_session');
      mockAuthListeners.forEach(cb => cb(null));
    }
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('propnpl_mock_session');
      if (mockSession) {
        return JSON.parse(mockSession);
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    let profile = null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!error && data) {
        profile = data;
      }
    } catch (e) {
      console.warn('Error fetching profile in getCurrentUser:', e);
    }

    if (!profile) {
      try {
        const fallbackUsername = user.email 
          ? user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') 
          : 'trader_' + user.id.slice(0, 5);
          
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([
          { id: user.id, username: fallbackUsername, email: user.email || '', is_demo: false }
        ]).select().single();
        
        if (!insertError && newProfile) {
          profile = newProfile;
        }
      } catch (e) {
        console.warn('Error creating default profile in getCurrentUser:', e);
      }
    }

    return { ...user, ...profile };
  },

  onAuthStateChange(callback: (user: any) => void) {
    mockAuthListeners.push(callback);
    
    if (typeof window !== 'undefined') {
      const mockSession = localStorage.getItem('propnpl_mock_session');
      if (mockSession) {
        callback(JSON.parse(mockSession));
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (typeof window !== 'undefined' && localStorage.getItem('propnpl_mock_session')) {
        return;
      }

      if (session?.user) {
        let profile = null;
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (!error && data) {
            profile = data;
          }
        } catch (e) {
          console.warn('Error fetching profile in onAuthStateChange:', e);
        }

        if (!profile) {
          try {
            const fallbackUsername = session.user.email 
              ? session.user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') 
              : 'trader_' + session.user.id.slice(0, 5);
              
            const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([
              { id: session.user.id, username: fallbackUsername, email: session.user.email || '', is_demo: false }
            ]).select().single();
            
            if (!insertError && newProfile) {
              profile = newProfile;
            }
          } catch (e) {
            console.warn('Error creating default profile in onAuthStateChange:', e);
          }
        }

        callback({ ...session.user, ...profile });
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      const idx = mockAuthListeners.indexOf(callback);
      if (idx !== -1) mockAuthListeners.splice(idx, 1);
    };
  },

  // --- JOURNALS ---
  async getJournals(userId: string) {
    const { data, error } = await supabase.from('journals').select(`*, profiles(username)`).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching journals:', error.message);
      return [];
    }
    return data.map(j => ({
      id: j.id,
      date: j.date,
      asset: j.asset,
      direction: j.direction,
      lots: j.lots,
      entryPrice: j.entry_price,
      exitPrice: j.exit_price,
      pnl: j.pnl,
      emotion: j.emotion,
      setup: j.setup,
      session: j.session,
      notes: j.notes,
      imageUrl: j.image_url,
      isPublic: j.is_public,
      author: j.profiles?.username || 'Unknown'
    }));
  },

  async saveJournal(
    userId: string,
    journal: {
      date: string;
      asset: string;
      direction: string;
      lots: number;
      entryPrice: number;
      exitPrice: number;
      pnl: number;
      emotion: string;
      setup: string;
      session?: string;
      notes?: string;
      imageUrl?: string;
      isPublic?: boolean;
    }
  ) {
    const dbPayload = {
      user_id: userId,
      date: journal.date,
      asset: journal.asset,
      direction: journal.direction,
      lots: journal.lots,
      entry_price: journal.entryPrice,
      exit_price: journal.exitPrice,
      pnl: journal.pnl,
      emotion: journal.emotion,
      setup: journal.setup,
      session: journal.session,
      notes: journal.notes || '',
      image_url: journal.imageUrl,
      is_public: journal.isPublic || false,
    };
    
    const { data, error } = await supabase.from('journals').insert([dbPayload]).select();
    if (error) {
      console.error('Error saving journal:', error.message);
      return null;
    }
    return data;
  },

  // --- POSTS ---
  async getPosts(currentUserId?: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey(username, avatar),
        post_reactions(reaction_type, user_id),
        comments(id, content, created_at, parent_id, profiles(username, avatar), comment_reactions(reaction_type, user_id))
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching posts:', error.message);
      return [];
    }
    
    const postsData = (data as unknown) as SupabasePost[];
    
    return postsData.map((p) => {
      const reactions: Record<string, number> = { rocket: 0, bear: 0, whale: 0, rekt: 0, bag: 0, hot: 0 };
      const userReactions: Record<string, boolean> = { rocket: false, bear: false, whale: false, rekt: false, bag: false, hot: false };
      
      const rawPostReactions = p.post_reactions || [];
      rawPostReactions.forEach((r) => {
        if (reactions[r.reaction_type] !== undefined) {
          reactions[r.reaction_type]++;
        } else {
          reactions[r.reaction_type] = 1;
        }
        if (currentUserId && r.user_id === currentUserId) {
          userReactions[r.reaction_type] = true;
        }
      });
      
      const totalReactions = Object.values(reactions).reduce((sum, val) => sum + val, 0);

      return {
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        imageUrl: p.image_url || undefined,
        upvotes: totalReactions || p.upvotes || 0,
        createdAt: p.created_at,
        author: p.profiles?.username || 'Unknown',
        tags: ['General'],
        comments: (p.comments || []).map((c) => {
          const comReactions: Record<string, number> = { rocket: 0, bear: 0, whale: 0, rekt: 0, bag: 0, hot: 0 };
          const rawReactions = c.comment_reactions || [];
          rawReactions.forEach((r) => {
            if (comReactions[r.reaction_type] !== undefined) {
              comReactions[r.reaction_type]++;
            } else {
              comReactions[r.reaction_type] = 1;
            }
          });
          return {
            id: c.id,
            parentId: c.parent_id || null,
            author: c.profiles?.username || 'Unknown',
            content: c.content,
            createdAt: c.created_at,
            reactions: comReactions,
            rawReactions
          };
        }),
        reactions,
        userReactions,
        userVoted: null as 'up' | 'down' | null
      };
    });
  },

  async savePost(
    userId: string,
    post: {
      title: string;
      content: string;
      category: string;
      imageUrl?: string | null;
      upvotes?: number;
    }
  ) {
    const dbPayload = {
      user_id: userId,
      title: post.title,
      content: post.content,
      category: post.category,
      image_url: post.imageUrl || null,
      upvotes: post.upvotes || 0,
    };
    const { data, error } = await supabase.from('posts').insert([dbPayload]).select();
    if (error) {
      console.error('Error saving post:', error.message);
      return null;
    }
    return data;
  },

  async saveComment(userId: string, postId: string, content: string, parentId?: string) {
    const dbPayload: { user_id: string; post_id: string; content: string; parent_id?: string } = {
      user_id: userId,
      post_id: postId,
      content: content
    };
    if (parentId) dbPayload.parent_id = parentId;
    const { data, error } = await supabase.from('comments').insert([dbPayload]).select();
    if (error) {
      console.error('Error saving comment:', error.message);
      return null;
    }
    return data;
  },

  async reactToComment(userId: string, commentId: string, reactionType: string, isAdding: boolean) {
    if (isAdding) {
      const { error } = await supabase.from('comment_reactions').insert({
        user_id: userId,
        comment_id: commentId,
        reaction_type: reactionType
      });
      if (error) console.error('Error adding comment reaction:', error.message);
      return !error;
    } else {
      const { error } = await supabase.from('comment_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .eq('reaction_type', reactionType);
      if (error) console.error('Error removing comment reaction:', error.message);
      return !error;
    }
  },

  // --- PAYOUTS ---
  async getPayouts(): Promise<Payout[] | null> {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payouts from Supabase:', error.message);
        return null;
      }
      return data.map(p => ({
        id: p.id,
        trader: p.trader,
        amount: Number(p.amount),
        propFirm: p.prop_firm,
        date: p.date,
        hash: p.hash,
        verified: p.verified,
        likes: p.likes || [],
        comments: p.comments || [],
        imageUrl: p.image_url || undefined
      }));
    } catch (e) {
      console.warn('Supabase getPayouts failed:', e);
      return null;
    }
  },

  async savePayout(payout: {
    trader: string;
    amount: number;
    propFirm: string;
    date: string;
    hash: string;
    verified: boolean;
    imageUrl?: string;
    userId?: string;
  }) {
    try {
      const dbPayload = {
        user_id: payout.userId || null,
        trader: payout.trader,
        amount: payout.amount,
        prop_firm: payout.propFirm,
        date: payout.date,
        hash: payout.hash,
        verified: payout.verified,
        image_url: payout.imageUrl || null,
        likes: [],
        comments: []
      };
      const { data, error } = await supabase.from('payouts').insert([dbPayload]).select();
      if (error) {
        console.error('Error saving payout to Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase savePayout failed:', e);
      return null;
    }
  },

  async updatePayout(id: string, updates: Partial<any>) {
    try {
      const dbPayload: any = {};
      if (updates.verified !== undefined) dbPayload.verified = updates.verified;
      if (updates.likes !== undefined) dbPayload.likes = updates.likes;
      if (updates.comments !== undefined) dbPayload.comments = updates.comments;

      const { data, error } = await supabase
        .from('payouts')
        .update(dbPayload)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating payout in Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase updatePayout failed:', e);
      return null;
    }
  },

  async deletePayout(id: string) {
    try {
      const { error } = await supabase.from('payouts').delete().eq('id', id);
      if (error) {
        console.error('Error deleting payout from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deletePayout failed:', e);
      return false;
    }
  },

  // --- POST REACTIONS & MODERATION ---
  async reactToPost(userId: string, postId: string, reactionType: string, isAdding: boolean) {
    try {
      if (isAdding) {
        const { error } = await supabase.from('post_reactions').insert({
          user_id: userId,
          post_id: postId,
          reaction_type: reactionType
        });
        if (error) console.error('Error adding post reaction:', error.message);
        return !error;
      } else {
        const { error } = await supabase.from('post_reactions')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId)
          .eq('reaction_type', reactionType);
        if (error) console.error('Error removing post reaction:', error.message);
        return !error;
      }
    } catch (e) {
      console.warn('Supabase reactToPost failed:', e);
      return false;
    }
  },

  async deletePost(postId: string) {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) {
        console.error('Error deleting post from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deletePost failed:', e);
      return false;
    }
  },

  // --- TRADING ACCOUNTS ---
  async getAccounts(userId: string): Promise<TradingAccount[]> {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching accounts from Supabase:', error.message);
        return [];
      }
      return data.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type as 'Challenge' | 'Funded',
        propFirm: a.prop_firm,
        size: Number(a.size)
      }));
    } catch (e) {
      console.warn('Supabase getAccounts failed:', e);
      return [];
    }
  },

  async saveAccount(userId: string, account: { name: string; type: string; propFirm: string; size: number }) {
    try {
      const dbPayload = {
        user_id: userId,
        name: account.name,
        type: account.type,
        prop_firm: account.propFirm,
        size: account.size
      };
      const { data, error } = await supabase.from('trading_accounts').insert([dbPayload]).select();
      if (error) {
        console.error('Error saving account to Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase saveAccount failed:', e);
      return null;
    }
  },

  async deleteAccount(accountId: string) {
    try {
      const { error } = await supabase.from('trading_accounts').delete().eq('id', accountId);
      if (error) {
        console.error('Error deleting account from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteAccount failed:', e);
      return false;
    }
  },

  // --- TRADER PROFILES ---
  async getProfiles(): Promise<TraderProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        console.error('Error fetching profiles from Supabase:', error.message);
        return db.getProfiles(); // fallback
      }
      if (data && data.length > 0) {
        const mapped: TraderProfile[] = data.map(p => ({
          id: p.id,
          name: p.name || p.username || 'Trader',
          handle: '@' + p.username,
          avatar: p.avatar || '👤',
          propFirms: p.prop_firms || [],
          balance: p.balance || '$100,000',
          winRate: p.win_rate || '0%',
          profitSplit: p.profit_split || '80%',
          status: (p.status || 'Active') as 'Active' | 'Under Review' | 'Resetting',
          equityCurve: p.equity_curve ? p.equity_curve.map(Number) : [0,0,0,0,0,0,0,0],
          bio: p.bio || '',
          isDemo: p.is_demo
        }));
        db.saveProfiles(mapped);
      }
      return db.getProfiles(); // Computes sorting and journalCount/totalProfit
    } catch (e) {
      console.warn('Supabase getProfiles failed:', e);
      return db.getProfiles();
    }
  },

  async adminUpdateProfile(profile: TraderProfile) {
    try {
      const dbPayload = {
        name: profile.name,
        avatar: profile.avatar,
        prop_firms: profile.propFirms,
        balance: profile.balance,
        win_rate: profile.winRate,
        profit_split: profile.profitSplit,
        status: profile.status,
        equity_curve: profile.equityCurve,
        bio: profile.bio
      };
      let targetId = profile.id;
      if (targetId.startsWith('tp-')) {
        const username = profile.handle.replace('@', '');
        const { data: matched } = await supabase.from('profiles').select('id').eq('username', username).single();
        if (matched) targetId = matched.id;
      }
      const { data, error } = await supabase.from('profiles').update(dbPayload).eq('id', targetId).select();
      if (error) {
        console.error('Error updating profile in Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase adminUpdateProfile failed:', e);
      return null;
    }
  },

  async adminCreateProfile(profile: TraderProfile) {
    try {
      const username = profile.handle.replace('@', '');
      const dbPayload = {
        username,
        name: profile.name,
        avatar: profile.avatar,
        prop_firms: profile.propFirms,
        balance: profile.balance,
        win_rate: profile.winRate,
        profit_split: profile.profitSplit,
        status: profile.status,
        equity_curve: profile.equityCurve,
        bio: profile.bio,
        is_demo: profile.isDemo || false
      };
      const { data, error } = await supabase.from('profiles').insert([dbPayload]).select();
      if (error) {
        console.error('Error creating profile in Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase adminCreateProfile failed:', e);
      return null;
    }
  },

  async adminDeleteProfile(id: string, handle?: string) {
    try {
      let targetId = id;
      if (targetId.startsWith('tp-') && handle) {
        const username = handle.replace('@', '');
        const { data: matched } = await supabase.from('profiles').select('id').eq('username', username).single();
        if (matched) targetId = matched.id;
      }
      const { error } = await supabase.from('profiles').delete().eq('id', targetId);
      if (error) {
        console.error('Error deleting profile from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase adminDeleteProfile failed:', e);
      return false;
    }
  },

  async deleteUserAccount(userId: string, username: string) {
    try {
      await supabase.from('profiles').delete().eq('id', userId);
      db.deleteUserAccount(username);
      return true;
    } catch (e) {
      console.warn('Supabase deleteUserAccount failed:', e);
      db.deleteUserAccount(username);
      return false;
    }
  },

  // --- TRADE FEEDBACKS ---
  async getTradeFeedback(tradeId: string): Promise<TradeFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('trade_feedbacks')
        .select('*')
        .eq('trade_id', tradeId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching trade feedback from Supabase:', error.message);
        return db.getTradeFeedback(tradeId); // fallback
      }
      const mapped: TradeFeedback[] = data.map(f => ({
        id: f.id,
        tradeId: f.trade_id,
        author: f.author,
        comment: f.comment,
        rating: f.rating || undefined,
        createdAt: f.created_at
      }));
      const key = `propnpl_trade_feedback_${tradeId}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(mapped));
      }
      return mapped;
    } catch (e) {
      console.warn('Supabase getTradeFeedback failed:', e);
      return db.getTradeFeedback(tradeId);
    }
  },

  async addTradeFeedback(tradeId: string, author: string, comment: string, rating?: number) {
    try {
      const dbPayload = {
        trade_id: tradeId,
        author,
        comment,
        rating: rating || null
      };
      const { data, error } = await supabase.from('trade_feedbacks').insert([dbPayload]).select();
      if (error) {
        console.error('Error adding trade feedback in Supabase:', error.message);
        return null;
      }
      return data[0];
    } catch (e) {
      console.warn('Supabase addTradeFeedback failed:', e);
      return null;
    }
  },

  // --- ADS ---
  async getAds(): Promise<Ad[]> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching ads from Supabase:', error.message);
        return db.getAds(); // fallback
      }
      if (data && data.length > 0) {
        const mapped: Ad[] = data.map(ad => ({
          id: ad.id,
          text: ad.text,
          author: ad.author,
          isSponsored: ad.is_sponsored,
          logoUrl: ad.logo_url || undefined,
          imageUrl: ad.image_url || undefined
        }));
        db.saveAds(mapped);
      }
      return db.getAds();
    } catch (e) {
      console.warn('Supabase getAds failed:', e);
      return db.getAds();
    }
  },

  async saveAds(ads: Ad[]) {
    try {
      await supabase.from('ads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const payload = ads.map(ad => ({
        text: ad.text,
        author: ad.author,
        is_sponsored: ad.isSponsored,
        logo_url: ad.logoUrl || null,
        image_url: ad.imageUrl || null
      }));
      const { data, error } = await supabase.from('ads').insert(payload).select();
      if (error) {
        console.error('Error saving ads to Supabase:', error.message);
        return null;
      }
      db.saveAds(ads);
      return data;
    } catch (e) {
      console.warn('Supabase saveAds failed:', e);
      return null;
    }
  },

  // --- ACADEMY MODULES ---
  async getAcademyModules(): Promise<CourseModule[]> {
    try {
      const { data, error } = await supabase
        .from('academy_modules')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching academy modules from Supabase:', error.message);
        return db.getAcademyModules(); // fallback
      }
      if (data && data.length > 0) {
        const mapped: CourseModule[] = data.map(m => ({
          id: m.id,
          level: m.level,
          title: m.title,
          duration: m.duration,
          desc: m.desc,
          lessons: m.lessons
        }));
        db.saveAcademyModules(mapped);
      }
      return db.getAcademyModules();
    } catch (e) {
      console.warn('Supabase getAcademyModules failed:', e);
      return db.getAcademyModules();
    }
  },

  async saveAcademyModules(modules: CourseModule[]) {
    try {
      await supabase.from('academy_modules').delete().neq('id', 'placeholder-non-existent-id');
      const payload = modules.map(m => ({
        id: m.id,
        level: m.level,
        title: m.title,
        duration: m.duration,
        desc: m.desc,
        lessons: m.lessons
      }));
      const { data, error } = await supabase.from('academy_modules').insert(payload).select();
      if (error) {
        console.error('Error saving academy modules to Supabase:', error.message);
        return null;
      }
      db.saveAcademyModules(modules);
      return data;
    } catch (e) {
      console.warn('Supabase saveAcademyModules failed:', e);
      return null;
    }
  },

  // --- PREMIUM ACCESS ---
  async getPremiumAccessList(): Promise<PremiumAccess[]> {
    try {
      const { data, error } = await supabase
        .from('premium_access')
        .select('*')
        .order('requested_at', { ascending: false });
      if (error) {
        console.error('Error fetching premium access from Supabase:', error.message);
        return db.getPremiumAccessList(); // fallback
      }
      const mapped: PremiumAccess[] = data.map(a => ({
        username: a.username,
        esewaTransactionId: a.esewa_transaction_id,
        status: a.status as 'pending' | 'verified' | 'rejected',
        requestedAt: a.requested_at,
        verifiedAt: a.verified_at || undefined
      }));
      db.savePremiumAccessList(mapped);
      return mapped;
    } catch (e) {
      console.warn('Supabase getPremiumAccessList failed:', e);
      return db.getPremiumAccessList();
    }
  },

  async requestPremiumAccess(username: string, esewaTransactionId: string) {
    try {
      const dbPayload = {
        username,
        esewa_transaction_id: esewaTransactionId,
        status: 'pending'
      };
      const { data, error } = await supabase.from('premium_access').insert([dbPayload]).select();
      if (error) {
        console.error('Error requesting premium access from Supabase:', error.message);
        return null;
      }
      db.requestPremiumAccess(username, esewaTransactionId);
      return data;
    } catch (e) {
      console.warn('Supabase requestPremiumAccess failed:', e);
      return null;
    }
  },

  async verifyPremiumAccess(username: string) {
    try {
      const { data, error } = await supabase
        .from('premium_access')
        .update({ status: 'verified', verified_at: new Date().toISOString() })
        .eq('username', username)
        .eq('status', 'pending')
        .select();
      if (error) {
        console.error('Error verifying premium access in Supabase:', error.message);
        return null;
      }
      db.verifyPremiumAccess(username);
      return data;
    } catch (e) {
      console.warn('Supabase verifyPremiumAccess failed:', e);
      return null;
    }
  },

  async rejectPremiumAccess(username: string) {
    try {
      const { data, error } = await supabase
        .from('premium_access')
        .update({ status: 'rejected' })
        .eq('username', username)
        .eq('status', 'pending')
        .select();
      if (error) {
        console.error('Error rejecting premium access in Supabase:', error.message);
        return null;
      }
      db.rejectPremiumAccess(username);
      return data;
    } catch (e) {
      console.warn('Supabase rejectPremiumAccess failed:', e);
      return null;
    }
  },

  async hasVerifiedAccess(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('premium_access')
        .select('status')
        .eq('username', username)
        .eq('status', 'verified');
      if (error) throw error;
      return data && data.length > 0;
    } catch (e) {
      console.warn('Supabase hasVerifiedAccess check failed, using local:', e);
      return db.hasVerifiedAccess(username);
    }
  },

  async getUserAccessStatus(username: string): Promise<PremiumAccess | undefined> {
    try {
      const { data, error } = await supabase
        .from('premium_access')
        .select('*')
        .eq('username', username)
        .order('requested_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) throw error || new Error('No status found');
      return {
        username: data[0].username,
        esewaTransactionId: data[0].esewa_transaction_id,
        status: data[0].status as 'pending' | 'verified' | 'rejected',
        requestedAt: data[0].requested_at,
        verifiedAt: data[0].verified_at || undefined
      };
    } catch (e) {
      console.warn('Supabase getUserAccessStatus check failed, using local:', e);
      return db.getUserAccessStatus(username);
    }
  },

  async deleteJournal(id: string) {
    try {
      const { error } = await supabase.from('journals').delete().eq('id', id);
      if (error) {
        console.error('Error deleting journal from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteJournal failed:', e);
      return false;
    }
  }
}
