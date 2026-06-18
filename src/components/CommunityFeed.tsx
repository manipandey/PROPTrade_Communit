// src/components/CommunityFeed.tsx
'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Search, Flame, Clock, MessageSquare, User, Hash, Share2, PlusCircle, CheckCircle, ImageIcon, MapPin, X, Upload, Link } from 'lucide-react';
import { db, Post, Comment } from '@/lib/supabase';
import AdSlot from './AdSlot';

const REACTION_TYPES = [
  { key: 'rocket', emoji: '🚀', label: 'To The Moon' },
  { key: 'bear',   emoji: '🐻', label: 'Bear Trap' },
  { key: 'whale',  emoji: '🐋', label: 'Whale Play' },
  { key: 'rekt',   emoji: '💀', label: 'Margin Called' },
  { key: 'bag',    emoji: '💸', label: 'Secured Bag' },
  { key: 'hot',    emoji: '🔥', label: 'Hot Setup' },
];

interface CommunityFeedProps {
  currentUser: { username: string; loggedIn: boolean; avatar: string } | null;
  onOpenAuth: () => void;
}

export default function CommunityFeed({ currentUser, onOpenAuth }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts(db.getPosts());
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
  
  // Post Submission Form States
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('FTMO');
  const [postTagsString, setPostTagsString] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload -> convert to base64 data URL
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Expand Thread State (Post ID)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  const categories = ['All', 'FTMO', 'FundedNext', 'Local Market', 'Payouts', 'Trading Journals', 'General'];

  // Handle Emoji Reacting
  const handleReact = (postId: string, reactionKey: string) => {
    if (!currentUser || !currentUser.loggedIn) {
      onOpenAuth();
      return;
    }

    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;

      const currentReactions = post.reactions || {
        rocket: post.upvotes || 0,
        bear: 0,
        whale: 0,
        rekt: 0,
        bag: 0,
        hot: 0,
      };

      const currentUserReactions = post.userReactions || {};
      const hasReacted = currentUserReactions[reactionKey] || false;

      const nextReactions = {
        ...currentReactions,
        [reactionKey]: Math.max(0, (currentReactions[reactionKey] || 0) + (hasReacted ? -1 : 1))
      };

      const nextUserReactions = {
        ...currentUserReactions,
        [reactionKey]: !hasReacted
      };

      // Recalculate upvotes sum to maintain sorting stability
      const totalReactions = Object.values(nextReactions).reduce((sum, val) => sum + val, 0);

      return {
        ...post,
        reactions: nextReactions,
        userReactions: nextUserReactions,
        upvotes: totalReactions
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
      userVoted: 'up', // Creator automatically upvotes their post
      imageUrl: postImageUrl.trim() || undefined
    };

    const newPostsList = [newPost, ...posts];
    setPosts(newPostsList);
    db.savePosts(newPostsList);

    // Reset Form
    setPostTitle('');
    setPostContent('');
    setPostCategory('FTMO');
    setPostTagsString('');
    setPostImageUrl('');
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
                : 'border border-border-theme bg-bg-card text-text-secondary hover:text-text-primary hover:border-border-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Control bar: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-border-theme pb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border-theme bg-bg-card py-2 pl-9 pr-4 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
          />
        </div>

        {/* Sort and Create Post Trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex rounded-lg border border-border-theme bg-bg-card p-0.5 text-xs font-bold font-sans">
            <button
              onClick={() => setSortBy('hot')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                sortBy === 'hot' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Hot</span>
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md uppercase tracking-wider transition-all ${
                sortBy === 'new' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
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
        <form onSubmit={handleCreatePostSubmit} className="rounded-xl border border-border-theme bg-bg-secondary p-6 space-y-4 glow-accent animate-fade-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4 text-brand-green" />
            <span>Create a New Discussion</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Thread Title</label>
              <input
                type="text"
                required
                placeholder="What is on your trading mind?"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none transition-all"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} className="bg-bg-input text-text-secondary">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. gold, ftmo, supplyanddemand"
              value={postTagsString}
              onChange={(e) => setPostTagsString(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Body Content</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your thesis, share charts, or ask questions..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Attach Image (optional)</span>
              </label>
              <div className="flex rounded-md border border-border-theme bg-bg-input p-0.5 text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-all uppercase tracking-wider ${
                    imageMode === 'upload' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-all uppercase tracking-wider ${
                    imageMode === 'url' ? 'bg-bg-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Link className="h-3 w-3" />
                  URL
                </button>
              </div>
            </div>

            {/* URL Mode */}
            {imageMode === 'url' && !postImageUrl && (
              <input
                type="text"
                placeholder="Paste image URL here... (e.g. https://i.imgur.com/chart.png)"
                value={postImageUrl}
                onChange={(e) => setPostImageUrl(e.target.value)}
                className="w-full rounded-lg border border-border-theme bg-bg-input py-2.5 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
              />
            )}

            {/* Upload / Drag-and-Drop Mode */}
            {imageMode === 'upload' && !postImageUrl && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-brand-green bg-brand-green/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                    : 'border-border-theme bg-bg-input/40 hover:border-border-hover hover:bg-bg-input/60'
                }`}
              >
                <div className={`rounded-full p-3 transition-colors ${
                  isDragging ? 'bg-brand-green/10 text-brand-green' : 'bg-bg-secondary text-text-secondary'
                }`}>
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${
                    isDragging ? 'text-brand-green' : 'text-text-secondary'
                  }`}>
                    {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>
            )}

            {/* Image Preview (shown for both modes) */}
            {postImageUrl && (
              <div className="relative rounded-xl border border-border-theme bg-bg-input overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={postImageUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPostImageUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="rounded-lg bg-bg/70 backdrop-blur-sm border border-border-theme/50 p-1.5 text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-brand-green" />
                    Image attached — ready to publish
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingPost(false)}
              className="rounded-lg border border-border-theme bg-bg-input/50 px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider"
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
        <div className="rounded-2xl border border-border-theme bg-bg-card/85 p-6 text-center space-y-3 glass-panel">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Join Nepal&apos;s Trading Conversations</h3>
          <p className="text-xs text-text-secondary max-w-lg mx-auto">
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
          <div className="rounded-xl border border-border-theme bg-bg-input/50 p-12 text-center text-text-muted text-xs">
            No active discussions found for this category/search. Be the first to start a thread!
          </div>
        ) : (
          filteredAndSortedPosts.map((post, index) => {
            const isExpanded = expandedPostId === post.id;
            
            return (
              <React.Fragment key={post.id}>
                <div
                  className="rounded-xl border border-border-theme bg-bg-card transition-all duration-300 hover:border-border-hover hover:shadow-[0_0_15px_rgba(34,197,94,0.02)]"
                >
                <div className="p-5 flex flex-col gap-3">
                  {/* Main Thread Content */}
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-text-secondary font-mono">
                      <span className="text-text-muted">u/{post.author}</span>
                      {(() => {
                        const badges = db.getUserBadges(post.author);
                        const unlocked = badges.filter(b => b.unlocked);
                        return unlocked.map(b => (
                          <span key={b.id} className="text-[10px]" title={b.name}>
                            {b.emoji}
                          </span>
                        ));
                      })()}
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
                      className="text-sm font-bold text-text-primary hover:text-brand-green cursor-pointer leading-snug transition-colors"
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt/Content */}
                    <p 
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className={`text-xs text-text-secondary leading-relaxed cursor-pointer transition-colors ${
                        isExpanded ? '' : 'line-clamp-3 hover:text-text-primary'
                      }`}
                    >
                      {post.content}
                    </p>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="relative mt-2 overflow-hidden rounded-xl border border-border-theme bg-bg-input group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-auto max-h-[600px] object-contain transition-transform duration-500 group-hover:scale-[1.01] bg-black/10 cursor-zoom-in"
                          onClick={() => setActiveLightboxImage(post.imageUrl || null)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-bg/70 backdrop-blur-sm border border-border-theme/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                            <ImageIcon className="h-3 w-3 text-brand-green" />
                            <span>Chart / Screenshot</span>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-md bg-bg/70 backdrop-blur-sm border border-border-theme/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                            <MapPin className="h-3 w-3 text-brand-green" />
                            <span>{post.category === 'Local Market' ? 'Nepal' : post.category}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-bg-input border border-border-theme px-2 py-0.5 text-[9px] font-mono font-bold text-text-secondary"
                        >
                          <Hash className="h-2 w-2 mr-0.5 text-text-muted" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Reactions & Footer Actions */}
                    <div className="pt-3 border-t border-border-theme space-y-3">
                      {/* Active Reactions List */}
                      <div className="flex flex-wrap gap-1.5">
                        {REACTION_TYPES.map((type) => {
                          const postReactions = post.reactions || {
                            rocket: post.upvotes || 0,
                            bear: 0,
                            whale: 0,
                            rekt: 0,
                            bag: 0,
                            hot: 0,
                          };
                          const currentUserReactions = post.userReactions || {};
                          const count = postReactions[type.key] || 0;
                          const active = currentUserReactions[type.key] || false;
                          if (count === 0 && !active) return null;

                          return (
                            <button
                              key={type.key}
                              onClick={() => handleReact(post.id, type.key)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all text-[10px] font-bold"
                              style={{
                                backgroundColor: active ? 'rgba(22, 163, 74, 0.15)' : 'var(--bg-input)',
                                borderColor: active ? 'var(--accent)' : 'var(--border)',
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)'
                              }}
                              title={type.label}
                            >
                              <span>{type.emoji}</span>
                              <span className="font-mono text-[9px]">{count}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Action buttons (Facebook Style) */}
                      <div className="flex items-center justify-between border-t border-border-theme pt-2 mt-3 select-none">
                        {/* React Popover Button */}
                        <div className="relative group flex-1 flex justify-center">
                          {(() => {
                            const currentUserReactions = post.userReactions || {};
                            const activeReactionKey = Object.keys(currentUserReactions).find(key => currentUserReactions[key]);
                            const activeReaction = activeReactionKey 
                              ? REACTION_TYPES.find(r => r.key === activeReactionKey)
                              : null;
                            const defaultReaction = REACTION_TYPES.find(r => r.key === 'rocket')!;

                            const handleClick = () => {
                              if (activeReaction) {
                                handleReact(post.id, activeReaction.key);
                              } else {
                                handleReact(post.id, defaultReaction.key);
                              }
                            };

                            return (
                              <button
                                onClick={handleClick}
                                className={`w-full py-2 flex items-center justify-center gap-2 hover:bg-bg-hover rounded-lg transition-all text-xs font-bold ${
                                  activeReaction ? 'text-brand-green' : 'text-text-secondary hover:text-text-primary'
                                }`}
                              >
                                {activeReaction ? (
                                  <>
                                    <span className="text-sm">{activeReaction.emoji}</span>
                                    <span>{activeReaction.label}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm">🚀</span>
                                    <span>To The Moon</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}
                          
                          {/* Hover Emoji Selector */}
                          <div 
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-2 bg-bg-card border border-border-theme p-2 rounded-xl shadow-2xl z-20 after:absolute after:h-4 after:w-full after:top-full after:left-0" 
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                          >
                            {REACTION_TYPES.map((type) => {
                              const currentUserReactions = post.userReactions || {};
                              const active = currentUserReactions[type.key] || false;
                              return (
                                <button
                                  key={type.key}
                                  type="button"
                                  onClick={() => handleReact(post.id, type.key)}
                                  className="p-1.5 rounded-lg hover:bg-bg-hover transition-all text-xl hover:scale-135 hover:-translate-y-1 transform active:scale-95 duration-150"
                                  title={type.label}
                                  style={{ backgroundColor: active ? 'rgba(22, 163, 74, 0.15)' : 'transparent' }}
                                >
                                  {type.emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-bg-hover rounded-lg transition-all text-xs font-bold text-text-secondary hover:text-text-primary"
                        >
                          <MessageSquare className="h-4 w-4 text-brand-green" />
                          <span>Comment ({post.comments.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '?post=' + post.id);
                            alert('Link copied to clipboard!');
                          }}
                          className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-bg-hover rounded-lg transition-all text-xs font-bold text-text-secondary hover:text-text-primary"
                        >
                          <Share2 className="h-4 w-4 text-brand-green" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Comment Thread View */}
                {isExpanded && (
                  <div className="border-t border-border-theme bg-bg-input/40 p-5 rounded-b-xl space-y-4 animate-fade-in">
                    
                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleCreateCommentSubmit(e, post.id)} className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
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
                          className="flex-1 rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!currentUser?.loggedIn}
                          className="rounded-lg bg-bg-secondary border border-border-theme text-text-secondary px-4 text-xs font-bold uppercase tracking-wider hover:bg-brand-green hover:text-black hover:border-brand-green transition-all"
                        >
                          Send
                        </button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 pt-2">
                      {post.comments.length === 0 ? (
                        <div className="text-text-muted text-xs italic py-2">
                          No responses yet. Be the first to share your thoughts!
                        </div>
                      ) : (
                        post.comments.map((comm) => (
                          <div key={comm.id} className="border-l border-border-theme pl-4 py-1 space-y-1">
                            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-text-secondary">
                              <span className="text-text-muted">u/{comm.author}</span>
                              {(() => {
                                const badges = db.getUserBadges(comm.author);
                                const unlocked = badges.filter(b => b.unlocked);
                                return unlocked.map(b => (
                                  <span key={b.id} className="text-[9px]" title={b.name}>
                                    {b.emoji}
                                  </span>
                                ));
                              })()}
                              <span>•</span>
                              <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Inline Banner Ad between 2nd and 3rd post */}
              {index === 1 && (
                <div className="my-2">
                  <AdSlot variant="banner" />
                </div>
              )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Image Lightbox Modal */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border-theme/40 shadow-2xl glow-accent" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeLightboxImage} 
              alt="Fullscreen View" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button 
              className="absolute top-3 right-3 rounded-lg bg-bg-card/75 border border-border-theme p-1.5 text-text-secondary hover:text-text-primary transition-all hover:bg-bg-hover"
              onClick={() => setActiveLightboxImage(null)}
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
