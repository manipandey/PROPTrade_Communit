import { supabase } from './supabaseClient';

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
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    
    // Fetch profile
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
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
      return { success: true, user: data.user };
    }
    return { success: false, message: 'Unknown error' };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return { ...user, ...profile };
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
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey(username, avatar),
        comments(id, content, created_at, parent_id, profiles(username, avatar), comment_reactions(reaction_type, user_id))
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching posts:', error.message);
      return [];
    }
    
    const postsData = (data as unknown) as SupabasePost[];
    
    return postsData.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      imageUrl: p.image_url,
      upvotes: p.upvotes || 0,
      createdAt: p.created_at,
      author: p.profiles?.username || 'Unknown',
      tags: ['General'],
      comments: (p.comments || []).map((c) => {
        const reactions: Record<string, number> = { rocket: 0, bear: 0, whale: 0, rekt: 0, bag: 0, hot: 0 };
        const rawReactions = c.comment_reactions || [];
        rawReactions.forEach((r) => {
          if (reactions[r.reaction_type] !== undefined) {
            reactions[r.reaction_type]++;
          } else {
            reactions[r.reaction_type] = 1;
          }
        });
        return {
          id: c.id,
          parentId: c.parent_id || null,
          author: c.profiles?.username || 'Unknown',
          content: c.content,
          createdAt: c.created_at,
          reactions,
          rawReactions
        };
      }),
      reactions: {
        rocket: p.upvotes || 0,
        bear: 0,
        whale: 0,
        rekt: 0,
        bag: 0,
        hot: 0,
      },
      userReactions: {} as Record<string, boolean>,
      userVoted: null as 'up' | 'down' | null
    }));
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
  }
};
