// src/components/PayoutShowcase.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, Upload, Heart, MessageSquare, X } from 'lucide-react';
import { db, Payout, Comment } from '@/lib/supabase';

export default function PayoutShowcase() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; loggedIn: boolean; avatar: string } | null>(null);

  // Form States
  const [formFirm, setFormFirm] = useState('FTMO');
  const [formAmount, setFormAmount] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTrader, setFormTrader] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Interaction States
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [selectedTraderPayouts, setSelectedTraderPayouts] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load payouts and user
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const rawPayouts = db.getPayouts() || [];
    const sanitized = rawPayouts.map(p => ({
      ...p,
      likes: p.likes || [],
      comments: p.comments || []
    }));
    setPayouts(sanitized);
    setCurrentUser(db.getCurrentUser());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG/WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Submit Payout Form
  const handleSubmitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formImage) {
      alert('Amount and Certificate upload are mandatory!');
      return;
    }

    const numericAmount = parseFloat(formAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    const traderName = currentUser?.loggedIn ? currentUser.username : (formTrader.trim() || 'GuestTrader');

    const newPayout: Payout = {
      id: `p-${Date.now()}`,
      trader: traderName.replace(/\s+/g, ''),
      amount: numericAmount,
      propFirm: formFirm,
      date: new Date().toISOString().split('T')[0],
      hash: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}-NP`,
      verified: false, // Must be verified by admin
      likes: [],
      comments: [],
      imageUrl: formImage
    };

    const updated = [newPayout, ...payouts];
    setPayouts(updated);
    db.savePayouts(updated);

    // Reset Form
    setFormAmount('');
    setFormImage('');
    setFormTrader('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsUploadModalOpen(false);
    }, 3000);
  };

  // Animated Counter Component
  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const start = 0;
      const end = value;
      if (start === end) return;
      const duration = 1500;
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeProgress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };
      window.requestAnimationFrame(step);
    }, [value]);
    return <span>{count.toLocaleString()}</span>;
  };

  // Like Payout
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.loggedIn) {
      alert('Please connect your account to like payout achievements!');
      return;
    }

    const updated = payouts.map(p => {
      if (p.id === id) {
        const username = currentUser.username;
        const likesList = p.likes || [];
        const liked = likesList.includes(username);
        const nextLikes = liked 
          ? likesList.filter(u => u !== username)
          : [...likesList, username];
        return { ...p, likes: nextLikes };
      }
      return p;
    });

    setPayouts(updated);
    db.savePayouts(updated);
  };

  // Comment Payout
  const handlePostComment = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[id]?.trim();
    if (!commentText) return;

    if (!currentUser?.loggedIn) {
      alert('Please connect your account to comment on payouts!');
      return;
    }

    const updated = payouts.map(p => {
      if (p.id === id) {
        const newComment: Comment = {
          id: `c-${Date.now()}`,
          author: currentUser.username,
          content: commentText,
          createdAt: new Date().toISOString()
        };
        const commentsList = p.comments || [];
        return { ...p, comments: [...commentsList, newComment] };
      }
      return p;
    });

    setPayouts(updated);
    db.savePayouts(updated);
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
  };

  // Separate list into Verified
  const verifiedPayouts = payouts.filter(p => p.verified);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto mb-8">
        <div className="space-y-1 sm:text-left text-center flex-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
            Performance <span className="text-brand-green">Fees</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            The Wall of Fame. Upload your certificates of freelancing performance fees from global funding providers.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-xl bg-brand-green px-5 py-3 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-2 hover:scale-105"
        >
          <Upload className="h-4 w-4" />
          <span>Submit Certificate</span>
        </button>
      </div>

      <div className="space-y-6 text-left">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedPayouts.map((payout) => {
              const hasLiked = currentUser?.loggedIn && payout.likes.includes(currentUser.username);
              const isCommentsOpen = !!expandedComments[payout.id];

              return (
                <div
                  key={payout.id}
                  className="rounded-xl border border-border-theme bg-bg-card hover:border-border-hover transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Main Body */}
                  <div className="p-4 space-y-3.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                      <span className="font-bold uppercase tracking-wider text-brand-green bg-brand-green/5 border border-brand-green/15 px-2 py-0.5 rounded">
                        {payout.propFirm}
                      </span>
                      <span>{payout.date}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-input border border-border-theme text-sm font-bold text-text-primary uppercase cursor-pointer hover:border-brand-green/45 hover:text-brand-green transition-all"
                          onClick={() => setSelectedTraderPayouts(payout.trader)}
                        >
                          {payout.trader.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="font-bold text-text-primary text-xs cursor-pointer hover:text-brand-green hover:underline transition-all"
                              onClick={() => setSelectedTraderPayouts(payout.trader)}
                            >
                              u/{payout.trader}
                            </div>
                            {(() => {
                              const badges = db.getUserBadges(payout.trader);
                              const unlocked = badges.filter(b => b.unlocked);
                              return unlocked.map(b => (
                                <span key={b.id} className="text-[10px]" title={b.name}>
                                  {b.emoji}
                                </span>
                              ));
                            })()}
                          </div>
                          <div className="text-[9px] text-text-muted font-mono leading-none mt-0.5">{payout.hash}</div>
                        </div>
                      </div>

                      {payout.imageUrl && (
                        <div
                          className="h-10 w-14 rounded overflow-hidden border border-border-theme/60 bg-bg-secondary cursor-pointer hover:scale-105 transition-all"
                          onClick={() => setActiveLightboxImage(payout.imageUrl || null)}
                          title="View Certificate"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={payout.imageUrl} alt="Cert" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between border-t border-border-theme/40 pt-2.5">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Fee Amount</span>
                      <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                        $<AnimatedCounter value={payout.amount} />
                      </span>
                    </div>
                  </div>

                  {/* Card Social Engagement Panel */}
                  <div className="bg-bg-input/30 border-t border-border-theme/40 p-3 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                      <button
                        onClick={(e) => handleLike(payout.id, e)}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-bg-hover ${
                          hasLiked ? 'text-brand-green bg-brand-green/5' : 'hover:text-text-primary'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{payout.likes.length} Likes</span>
                      </button>

                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [payout.id]: !isCommentsOpen }))}
                        className="flex items-center gap-1 px-2 py-1 rounded transition-all hover:bg-bg-hover hover:text-text-primary"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{payout.comments.length} Comments</span>
                      </button>
                    </div>

                    {/* Expandable Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="space-y-3 border-t border-border-theme/40 pt-3 animate-fade-in">
                        {payout.comments.length > 0 && (
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {payout.comments.map((comment) => (
                              <div key={comment.id} className="text-[11px] leading-relaxed rounded bg-bg-secondary/40 p-2 border border-border-theme/40">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-bold text-text-primary text-xs">{comment.author}</span>
                                  {(() => {
                                    const badges = db.getUserBadges(comment.author);
                                    const unlocked = badges.filter(b => b.unlocked);
                                    return unlocked.map(b => (
                                      <span key={b.id} className="text-[9px]" title={b.name}>
                                        {b.emoji}
                                      </span>
                                    ));
                                  })()}
                                </div>
                                <span className="text-text-secondary">{comment.content}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {currentUser?.loggedIn ? (
                          <form onSubmit={(e) => handlePostComment(payout.id, e)} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              required
                              placeholder="Write a comment..."
                              value={commentInputs[payout.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [payout.id]: e.target.value }))}
                              className="flex-1 rounded-md border border-border-theme bg-bg-input px-2 py-1.5 text-[11px] text-text-primary focus:border-brand-green focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-md bg-brand-green px-2.5 py-1.5 text-[10px] font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all"
                            >
                              Post
                            </button>
                          </form>
                        ) : (
                          <div className="text-[10px] text-text-muted italic text-center py-1">
                            Connect your account to write comments.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Upload Certificate Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl border border-border-theme bg-bg-card p-6 shadow-2xl glow-accent">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-green" /> Submit Performance Fee Proof
                </h3>
                <p className="text-[11px] text-text-secondary mt-1">
                  Upload your certificate of freelancing performance fees provided by your prop firm.
                </p>
              </div>

              <form onSubmit={handleSubmitPayout} className="space-y-3.5">
                {!currentUser?.loggedIn && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Trader Handle</label>
                    <input
                      type="text"
                      required
                      value={formTrader}
                      onChange={(e) => setFormTrader(e.target.value)}
                      placeholder="e.g. SamirFX"
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Prop Firm</label>
                    <select
                      value={formFirm}
                      onChange={(e) => setFormFirm(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none"
                    >
                      <option value="FTMO">FTMO</option>
                      <option value="FundedNext">FundedNext</option>
                      <option value="The 5%ers">The 5%ers</option>
                      <option value="FundedMax">FundedMax</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Amount (USD)</label>
                    <input
                      type="number"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary placeholder-text-muted focus:border-brand-green focus:outline-none"
                    />
                  </div>
                </div>

                {/* Certificate Image File Dropzone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Mandatory Certificate Upload
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-brand-green bg-brand-green/5'
                        : formImage
                          ? 'border-brand-green bg-bg-secondary/40'
                          : 'border-border-theme bg-bg-secondary/20 hover:border-brand-green/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    {formImage ? (
                      <div className="space-y-2 w-full flex flex-col items-center">
                        <div className="h-20 w-32 rounded border border-border-theme overflow-hidden bg-bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formImage} alt="Uploaded Cert Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-brand-green font-bold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>Ready to upload</span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-text-muted">
                        <Upload className="h-6 w-6 mx-auto text-text-subtle" />
                        <div className="text-[10px] font-bold">DRAG & DROP CERTIFICATE IMAGE</div>
                        <div className="text-[8px] uppercase tracking-wider">or click to browse from device</div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-green py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all shadow-[0_0_10px_rgba(34,197,94,0.15)] flex items-center justify-center gap-1.5 mt-4"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Submit Certificate Proof</span>
                </button>
              </form>

              {submitSuccess && (
                <div className="p-3 bg-brand-green/10 border border-brand-green/30 rounded-lg text-brand-green text-[10px] font-bold flex items-center gap-1.5 animate-fade-in">
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span>Submitted successfully! Admin will verify soon.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Lightbox Modal */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-brand-green/20 shadow-2xl glow-accent" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeLightboxImage} 
              alt="Payout Certificate Preview" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
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

      {/* Trader Payouts Modal */}
      {selectedTraderPayouts && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedTraderPayouts(null)}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl border border-border-theme bg-bg-card p-6 space-y-6 shadow-2xl glow-accent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 border border-brand-green/20 text-base font-bold text-brand-green uppercase font-sans">
                  {selectedTraderPayouts.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Trader Performance Fee Profile</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-brand-green font-semibold">u/{selectedTraderPayouts}</p>
                    {(() => {
                      const badges = db.getUserBadges(selectedTraderPayouts);
                      const unlocked = badges.filter(b => b.unlocked);
                      return unlocked.map(b => (
                        <span key={b.id} className="text-[10px]" title={b.name}>
                          {b.emoji}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              <button 
                className="rounded-lg border border-border-theme p-2 text-text-secondary hover:text-text-primary transition-all hover:bg-bg-hover"
                onClick={() => setSelectedTraderPayouts(null)}
                title="Close Modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stats Summary */}
            {(() => {
              const traderPayouts = payouts.filter(p => p.trader.toLowerCase() === selectedTraderPayouts.toLowerCase());
              const verifiedAmount = traderPayouts.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
              const pendingAmount = traderPayouts.filter(p => !p.verified).reduce((sum, p) => sum + p.amount, 0);
              const totalPayoutsCount = traderPayouts.length;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-bg-secondary border border-border-theme rounded-xl p-3 text-center space-y-1">
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Claims</div>
                      <div className="text-base font-black text-text-primary font-mono">{totalPayoutsCount}</div>
                    </div>
                    <div className="bg-bg-secondary border border-border-theme rounded-xl p-3 text-center space-y-1">
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Verified Fees</div>
                      <div className="text-base font-black text-brand-green font-mono">${verifiedAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-bg-secondary border border-border-theme rounded-xl p-3 text-center space-y-1">
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Pending Review</div>
                      <div className="text-base font-black text-yellow-500 font-mono">${pendingAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Payouts list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Fee Transaction History</h4>
                    {traderPayouts.length === 0 ? (
                      <div className="text-center py-6 text-xs text-text-muted italic bg-bg-secondary/40 border border-dashed border-border-theme rounded-xl">
                        No payout transactions logged.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {traderPayouts.map(p => (
                          <div 
                            key={p.id} 
                            className="p-3 bg-bg-secondary border border-border-theme rounded-xl flex items-center justify-between gap-4 hover:border-border-hover transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[10px] text-text-primary bg-bg-input px-2 py-0.5 rounded border border-border-theme uppercase">
                                  {p.propFirm}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono">{p.date}</span>
                              </div>
                              <div className="text-[9px] text-text-muted font-mono">{p.hash}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right space-y-0.5">
                                <div className="font-bold font-mono text-brand-green text-sm">${p.amount.toLocaleString()}</div>
                                <div className="text-[9px] font-bold uppercase">
                                  {p.verified ? (
                                    <span className="text-brand-green inline-flex items-center gap-0.5">
                                      <Check className="h-3 w-3" /> Verified
                                    </span>
                                  ) : (
                                    <span className="text-yellow-500">Pending Review</span>
                                  )}
                                </div>
                              </div>
                              {p.imageUrl && (
                                <div 
                                  className="h-10 w-14 rounded overflow-hidden border border-border-theme bg-bg-input flex-shrink-0 cursor-pointer hover:scale-105 transition-all"
                                  onClick={() => setActiveLightboxImage(p.imageUrl || null)}
                                  title="View Certificate"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.imageUrl} alt="Certificate" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
