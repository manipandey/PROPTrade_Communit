// src/components/CommunityFeed.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Search, Flame, Clock, MessageSquare, ArrowUp, ArrowDown, User, Hash, Share2, PlusCircle, CheckCircle } from 'lucide-react';
import { db, Post, Comment } from '@/lib/supabase';

interface CommunityFeedProps {
  currentUser: { username: string; loggedIn: boolean; avatar: string } | null;
  onOpenAuth: () => void;
}

export default function CommunityFeed({ currentUser, onOpenAuth }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>(() => db.getPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
  
  // Post Submission Form States
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('FTMO');
  const [postTagsString, setPostTagsString] = useState('');

  // Expand Thread State (Post ID)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const categories = ['All', 'FTMO', 'FundedNext', 'Local Market', 'Payouts', 'Trading Journals', 'General'];

  // Handle Voting
  const handleVote = (postId: string, direction: 'up' | 'down') => {
    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      
      let upvoteDiff = 0;
      let currentVote = post.userVoted;

      if (direction === 'up') {
        if (currentVote === 'up') {
          upvoteDiff = -1;
          currentVote = null;
        } else if (currentVote === 'down') {
          upvoteDiff = 2;
          currentVote = 'up';
        } else {
          upvoteDiff = 1;
          currentVote = 'up';
        }
      } else {
        if (currentVote === 'down') {
          upvoteDiff = 1;
          currentVote = null;
        } else if (currentVote === 'up') {
          upvoteDiff = -2;
          currentVote = 'down';
        } else {
          upvoteDiff = -1;
          currentVote = 'down';
        }
      }

      return {
        ...post,
        upvotes: post.upvotes + upvoteDiff,
        userVoted: currentVote
      };
    });

    setPosts(updatedPosts);
    db.savePosts(updatedPosts);
  };

  // Submit Post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.loggedIn) return;
    if (!postTitle || !postContent) return;

    const tags = postTagsString
      .split(',')
      .map((t) => t.trim().replace(/#/g, ''))
      .filter((t) => t.length > 0);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: postTitle,
      content: postContent,
      author: currentUser.username,
      category: postCategory,
      tags: tags.length > 0 ? tags : ['General'],
      upvotes: 1,
      comments: [],
      createdAt: new Date().toISOString(),
      userVoted: 'up' // Creator automatically upvotes their post
    };

    const newPostsList = [newPost, ...posts];
    setPosts(newPostsList);
    db.savePosts(newPostsList);

    // Reset Form
    setPostTitle('');
    setPostContent('');
    setPostCategory('FTMO');
    setPostTagsString('');
    setIsCreatingPost(false);
  };

  // Submit Comment
  const handleCreateCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!currentUser || !currentUser.loggedIn) {
      onOpenAuth();
      return;
    }
    if (!newCommentContent.trim()) return;

    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        author: currentUser.username,
        content: newCommentContent,
        createdAt: new Date().toISOString()
      };

      return {
        ...post,
        comments: [...post.comments, newComment]
      };
    });

    setPosts(updatedPosts);
    db.savePosts(updatedPosts);
    setNewCommentContent('');
  };

  // Filter & Sort Posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((post) => post.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'hot') {
      result.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      
      {/* Category Pill Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-brand-green text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                : 'border border-zinc-900 bg-[#070709] text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Control bar: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-zinc-900 pb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-900 bg-[#070709] py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-brand-green focus:outline-none transition-all"
          />
        </div>

        {/* Sort and Create Post Trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex rounded-lg border border-zinc-900 bg-[#070709] p-0.5 text-xs font-bold font-sans">
            <button
              onClick={() => setSortBy('hot')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                sortBy === 'hot' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Hot</span>
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                sortBy === 'new' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (currentUser?.loggedIn) {
                setIsCreatingPost(!isCreatingPost);
              } else {
                onOpenAuth();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green/10 border border-brand-green/20 px-3.5 py-2 text-xs font-bold text-brand-green hover:bg-brand-green/20 uppercase tracking-wider transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* Compose Discussion Panel */}
      {isCreatingPost && currentUser?.loggedIn && (
        <form onSubmit={handleCreatePostSubmit} className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6 space-y-4 glow-accent animate-fade-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4 text-brand-green" />
            <span>Create a New Discussion</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Thread Title</label>
              <input
                type="text"
                required
                placeholder="What is on your trading mind?"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-zinc-300 focus:border-brand-green focus:outline-none transition-all"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} className="bg-black text-zinc-300">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. gold, ftmo, supplyanddemand"
              value={postTagsString}
              onChange={(e) => setPostTagsString(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Body Content</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your thesis, share charts, or ask questions..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="rounded-lg border border-zinc-900 bg-black/50 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-green px-5 py-2 text-xs font-bold text-black hover:bg-brand-green/90 uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]"
            >
              Publish Post
            </button>
          </div>
        </form>
      )}

      {/* Guest Lock Screen */}
      {!currentUser?.loggedIn && (
        <div className="rounded-2xl border border-zinc-900 bg-[#070709]/80 p-6 text-center space-y-3 glass-panel">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Join Nepal's Trading Conversations</h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Create an account or login to upvote analysis threads, ask technical questions, comment on posts, and collaborate on localized prop-firm guides.
          </p>
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all glow-accent"
          >
            <User className="h-4 w-4" />
            <span>Create Profile</span>
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="rounded-xl border border-zinc-900 bg-black/50 p-12 text-center text-zinc-500 text-xs">
            No active discussions found for this category/search. Be the first to start a thread!
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            
            return (
              <div
                key={post.id}
                className="rounded-xl border border-zinc-900 bg-[#070708] transition-all duration-300 hover:border-zinc-800 hover:shadow-[0_0_15px_rgba(34,197,94,0.02)]"
              >
                <div className="p-5 flex gap-4">
                  {/* Voting Column */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => handleVote(post.id, 'up')}
                      className={`rounded p-1 transition-colors hover:bg-zinc-800 ${
                        post.userVoted === 'up' ? 'text-brand-green bg-brand-green/10' : 'text-zinc-500'
                      }`}
                      title="Upvote"
                    >
                      <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <span className={`text-xs font-mono font-bold ${
                      post.userVoted === 'up' ? 'text-brand-green' : post.userVoted === 'down' ? 'text-red-500' : 'text-white'
                    }`}>
                      {post.upvotes}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, 'down')}
                      className={`rounded p-1 transition-colors hover:bg-zinc-800 ${
                        post.userVoted === 'down' ? 'text-red-500 bg-red-950/20' : 'text-zinc-500'
                      }`}
                      title="Downvote"
                    >
                      <ArrowDown className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Main Thread Content */}
                  <div className="flex-1 space-y-2.5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-500 font-mono">
                      <span className="text-zinc-400">u/{post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-brand-green bg-brand-green/15 border border-brand-green/10 rounded px-2 py-0.5 uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className="text-sm font-bold text-white hover:text-brand-green cursor-pointer leading-snug transition-colors"
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt/Content */}
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-zinc-950 border border-zinc-900 px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-400"
                        >
                          <Hash className="h-2 w-2 mr-0.5 text-zinc-600" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-zinc-900/60 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <button
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-brand-green" />
                        <span>{post.comments.length} Comments</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Comment Thread View */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 bg-black/40 p-5 rounded-b-xl space-y-4 animate-fade-in">
                    
                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleCreateCommentSubmit(e, post.id)} className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {currentUser?.loggedIn ? `Comment as u/${currentUser.username}` : 'You must be signed in to comment'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder={currentUser?.loggedIn ? "Write a helpful response..." : "Join PropNepal to comment"}
                          disabled={!currentUser?.loggedIn}
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          className="flex-1 rounded-lg border border-zinc-900 bg-black py-2 px-3 text-xs text-white placeholder-zinc-700 focus:border-brand-green focus:outline-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!currentUser?.loggedIn}
                          className="rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 text-xs font-bold uppercase tracking-wider hover:bg-brand-green hover:text-black hover:border-brand-green transition-all"
                        >
                          Send
                        </button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 pt-2">
                      {post.comments.length === 0 ? (
                        <div className="text-zinc-600 text-xs italic py-2">
                          No responses yet. Be the first to share your thoughts!
                        </div>
                      ) : (
                        post.comments.map((comm) => (
                          <div key={comm.id} className="border-l border-zinc-900 pl-4 py-1 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-zinc-500">
                              <span className="text-zinc-400">u/{comm.author}</span>
                              <span>•</span>
                              <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
