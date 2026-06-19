  // src/components/AdminPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Check, Trash2, Plus, Edit, BookOpen, 
  MessageSquare, Users, X, Save, Volume2, Crown
} from 'lucide-react';
import { 
  db, Payout, Post, TraderProfile, Ad, CourseModule, RegisteredUser, Lesson, PremiumAccess 
} from '@/lib/supabase';
import { api } from '@/lib/api';

export default function AdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'ads' | 'payouts' | 'posts' | 'profiles' | 'academy' | 'users' | 'premium'>('ads');

  // Database States
  const [ads, setAds] = useState<Ad[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<TraderProfile[]>([]);
  const [academyModules, setAcademyModules] = useState<CourseModule[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [premiumAccessList, setPremiumAccessList] = useState<PremiumAccess[]>([]);

  // Ads Form States
  const [adText, setAdText] = useState('');
  const [adAuthor, setAdAuthor] = useState('');
  const [adSponsored, setAdSponsored] = useState(true);
  const [adUseLogo, setAdUseLogo] = useState(false);
  const [adImage, setAdImage] = useState('');

  // Profiles Form States
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileHandle, setProfileHandle] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('👤');
  const [profileFirms, setProfileFirms] = useState('');
  const [profileBalance, setProfileBalance] = useState('$100,000');
  const [profileWinRate, setProfileWinRate] = useState('60%');
  const [profileSplit, setProfileSplit] = useState('80%');
  const [profileStatus, setProfileStatus] = useState<'Active' | 'Under Review' | 'Resetting'>('Active');
  const [profileBio, setProfileBio] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  // Academy Form States
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleDesc, setModuleDesc] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonMedia, setLessonMedia] = useState('');
  const [lessonMediaType, setLessonMediaType] = useState<'image' | 'video'>('image');
  const [editingLessonIdx, setEditingLessonIdx] = useState<number | null>(null);

  // Users Directory search state
  const [searchUser, setSearchUser] = useState('');

  const loadAllData = async () => {
    const liveAds = await api.getAds();
    setAds(liveAds || []);
    
    let livePayouts = await api.getPayouts();
    if (!livePayouts) {
      livePayouts = db.getPayouts() || [];
    }
    setPayouts(livePayouts);

    const livePosts = await api.getPosts();
    setPosts(livePosts || []);

    const liveProfiles = await api.getProfiles();
    setProfiles(liveProfiles || []);

    const liveModules = await api.getAcademyModules();
    setAcademyModules(liveModules || []);

    setUsers(db.getRegisteredUsers() || []);

    const livePremiumList = await api.getPremiumAccessList();
    setPremiumAccessList(livePremiumList || []);
  };

  // Load state on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadAllData();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // --- Ads Logic ---
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adText || !adAuthor) return;

    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      text: adText.trim(),
      author: adAuthor.trim(),
      isSponsored: adSponsored,
      logoUrl: adUseLogo ? '/logo-icon.svg' : undefined,
      imageUrl: adImage || undefined
    };

    const nextAds = [...ads, newAd];
    setAds(nextAds);
    await api.saveAds(nextAds);

    // Reset Form
    setAdText('');
    setAdAuthor('');
    setAdSponsored(true);
    setAdUseLogo(false);
    setAdImage('');
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad/quote?')) return;
    const nextAds = ads.filter(a => a.id !== id);
    setAds(nextAds);
    await api.saveAds(nextAds);
  };

  // --- Payout Approvals Logic ---
  const handleApprovePayout = async (id: string) => {
    if (!id.startsWith('p-')) {
      await api.updatePayout(id, { verified: true });
    }

    const nextPayouts = payouts.map(p => p.id === id ? { ...p, verified: true } : p);
    setPayouts(nextPayouts);
    db.savePayouts(nextPayouts);
  };

  const handleRejectPayout = async (id: string) => {
    if (!confirm('Reject and delete this payout proof submission?')) return;

    if (!id.startsWith('p-')) {
      await api.deletePayout(id);
    }

    const nextPayouts = payouts.filter(p => p.id !== id);
    setPayouts(nextPayouts);
    db.savePayouts(nextPayouts);
  };

  // --- Posts Moderator Logic ---
  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to moderate/delete this post?')) return;
    const success = await api.deletePost(id);
    if (success) {
      const nextPosts = posts.filter(p => p.id !== id);
      setPosts(nextPosts);
    }
  };

  // --- Profile Directory Logic ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileHandle) return;

    const firmsArray = profileFirms.split(',').map(f => f.trim()).filter(Boolean);

    if (editingProfileId) {
      // Edit mode
      const existing = profiles.find(p => p.id === editingProfileId);
      if (!existing) return;

      const updated: TraderProfile = {
        ...existing,
        name: profileName,
        handle: profileHandle.startsWith('@') ? profileHandle : `@${profileHandle}`,
        avatar: profileAvatar,
        propFirms: firmsArray.length > 0 ? firmsArray : ['Standard'],
        balance: profileBalance,
        winRate: profileWinRate,
        profitSplit: profileSplit,
        status: profileStatus,
        bio: profileBio
      };

      await api.adminUpdateProfile(updated);
      setEditingProfileId(null);
    } else {
      // Create mode
      const created: TraderProfile = {
        id: `tp-${Date.now()}`,
        name: profileName,
        handle: profileHandle.startsWith('@') ? profileHandle : `@${profileHandle}`,
        avatar: profileAvatar,
        propFirms: firmsArray.length > 0 ? firmsArray : ['Standard'],
        balance: profileBalance,
        winRate: profileWinRate,
        profitSplit: profileSplit,
        status: profileStatus,
        equityCurve: [0, 1.2, 0.8, 2.5, 3.4, 3.0, 4.2, 5.0],
        bio: profileBio || 'Trader ranking profile.'
      };

      await api.adminCreateProfile(created);
      setIsAddingProfile(false);
    }

    // Reset profile form states
    setProfileName('');
    setProfileHandle('');
    setProfileAvatar('👤');
    setProfileFirms('');
    setProfileBalance('$100,000');
    setProfileWinRate('60%');
    setProfileSplit('80%');
    setProfileStatus('Active');
    setProfileBio('');
    loadAllData();
  };

  const handleEditProfileInit = (p: TraderProfile) => {
    setEditingProfileId(p.id);
    setIsAddingProfile(true);
    setProfileName(p.name);
    setProfileHandle(p.handle);
    setProfileAvatar(p.avatar);
    setProfileFirms(p.propFirms.join(', '));
    setProfileBalance(p.balance);
    setProfileWinRate(p.winRate);
    setProfileSplit(p.profitSplit);
    setProfileStatus(p.status);
    setProfileBio(p.bio);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trader profile?')) return;
    const existing = profiles.find(p => p.id === id);
    await api.adminDeleteProfile(id, existing?.handle);
    loadAllData();
  };
  
  const handleDeleteUser = async (username: string) => {
    if (username === 'admin') {
      alert('Cannot delete the root admin user!');
      return;
    }
    if (!confirm(`Are you sure you want to delete account "${username}"? This will erase their profile and journal history.`)) return;
    const usersList = db.getRegisteredUsers();
    const userObj = usersList.find(u => u.username === username);
    if (userObj) {
      await api.deleteUserAccount(userObj.id, username);
    } else {
      db.deleteUserAccount(username);
    }
    loadAllData();
  };

  // --- Academy Logic ---
  const handleSaveAcademyModule = async (moduleId: string) => {
    const updated = academyModules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          desc: moduleDesc
        };
      }
      return mod;
    });
    setAcademyModules(updated);
    await api.saveAcademyModules(updated);
    setEditingModuleId(null);
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonContent('');
    setLessonMedia('');
    setLessonMediaType('image');
    setEditingLessonIdx(null);
  };

  const handleEditLessonInit = (idx: number, lesson: Lesson) => {
    setEditingLessonIdx(idx);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content || '');
    setLessonMedia(lesson.mediaUrl || '');
    setLessonMediaType(lesson.mediaType || 'image');
  };

  const handleSaveLesson = async (moduleId: string) => {
    if (!lessonTitle.trim() || !lessonContent.trim()) {
      alert('Lesson Title and Detailed Description are required!');
      return;
    }

    const newLesson: Lesson = {
      title: lessonTitle.trim(),
      content: lessonContent.trim(),
      mediaUrl: lessonMedia || undefined,
      mediaType: lessonMedia ? lessonMediaType : undefined
    };

    const updated = academyModules.map(mod => {
      if (mod.id === moduleId) {
        const nextLessons = [...mod.lessons];
        if (editingLessonIdx !== null) {
          nextLessons[editingLessonIdx] = newLesson;
        } else {
          nextLessons.push(newLesson);
        }
        return {
          ...mod,
          lessons: nextLessons
        };
      }
      return mod;
    });

    setAcademyModules(updated);
    await api.saveAcademyModules(updated);
    resetLessonForm();
  };

  const handleDeleteLesson = async (moduleId: string, lessonIdx: number) => {
    if (!confirm('Delete this lesson outline?')) return;
    const updated = academyModules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.filter((_, idx) => idx !== lessonIdx)
        };
      }
      return mod;
    });
    setAcademyModules(updated);
    await api.saveAcademyModules(updated);
  };

  // Sub-lists
  const pendingPayouts = payouts.filter(p => !p.verified);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-left space-y-1.5 border-b border-border-theme pb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand-green" />
          <span>Admin <span className="text-brand-green">Dashboard</span></span>
        </h2>
        <p className="text-xs text-text-secondary max-w-2xl">
          Centralized Simulation Control Panel. Manage dynamic ad spaces, review fee submissions, moderate feed posts, customize trader ranking directories, and update academy courses.
        </p>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex border-b border-border-theme/60 overflow-x-auto pb-px text-xs font-bold uppercase tracking-wider gap-5">
        <button
          onClick={() => { setActiveSubTab('ads'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'ads' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Volume2 className="h-4 w-4" />
          <span>Manage Ads ({ads.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('payouts'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'payouts' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Fee Verification ({pendingPayouts.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('posts'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'posts' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Moderate Feed ({posts.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('profiles'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'profiles' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Traders Directory ({profiles.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('academy'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'academy' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Academy Editor</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('users'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'users' 
              ? 'border-brand-green text-brand-green' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Registered Users ({users.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('premium'); setIsAddingProfile(false); setEditingProfileId(null); }}
          className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 select-none cursor-pointer ${
            activeSubTab === 'premium' 
              ? 'border-yellow-400 text-yellow-400' 
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>Premium Access ({premiumAccessList.filter(a => a.status === 'pending').length})</span>
        </button>
      </div>

      <div className="pt-2 animate-fade-in text-left">

        {/* ── SUBTAB: ADS MANAGER ── */}
        {activeSubTab === 'ads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Form: Add Ads */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border-theme bg-bg-card p-6 space-y-4 glow-accent">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Create Ad Banner</h3>
                  <p className="text-[10px] text-text-secondary mt-1">Design a new quote card or sponsored ad promotion to render inside rotating spaces.</p>
                </div>

                <form onSubmit={handleAddAd} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Ad Text / Wisdom Quote</label>
                    <textarea
                      required
                      value={adText}
                      onChange={(e) => setAdText(e.target.value)}
                      placeholder="e.g. Master order block confirmations before putting capital at risk."
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none min-h-[70px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Author / Sponsor Name</label>
                    <input
                      type="text"
                      required
                      value={adAuthor}
                      onChange={(e) => setAdAuthor(e.target.value)}
                      placeholder="e.g. Warren Buffett or AlphaJournal Trading"
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2 bg-bg-secondary/40 border border-border-theme/40 rounded-lg p-3">
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adSponsored}
                        onChange={(e) => setAdSponsored(e.target.checked)}
                        className="rounded border-border-theme bg-bg-input text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-[11px] font-bold text-text-secondary uppercase">💡 Mark as Sponsored Space</span>
                    </label>

                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adUseLogo}
                        onChange={(e) => setAdUseLogo(e.target.checked)}
                        className="rounded border-border-theme bg-bg-input text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-[11px] font-bold text-text-secondary uppercase">🔰 Attach AlphaJournal Logo</span>
                    </label>
                  </div>

                  {/* Banner Image Uploader */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Ad Banner Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image size exceeds 2MB limit.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setAdImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-text-secondary rounded-lg border border-border-theme bg-bg-input p-1"
                    />
                    {adImage && (
                      <div className="relative h-14 w-28 rounded-lg overflow-hidden border border-border-theme mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={adImage} alt="Banner Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAdImage('')}
                          className="absolute top-1 right-1 rounded bg-black/60 p-0.5 text-text-secondary hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Deploy Ad Banner</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right List: Active Ads */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Deployed Ads List</h3>
              
              {ads.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-theme bg-bg-card p-8 text-center text-xs text-text-muted italic">
                  No active ad banners inside rotation.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="rounded-xl border border-border-theme bg-bg-card p-4 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-bg-secondary border border-border-theme flex-shrink-0 text-xs mt-0.5 overflow-hidden">
                          {ad.logoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={ad.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
                          ) : (
                            '💡'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary leading-relaxed">
                            &ldquo;{ad.text}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                            <span>— {ad.author}</span>
                            {ad.isSponsored && (
                              <span className="text-[8px] bg-brand-green/10 text-brand-green border border-brand-green/20 px-1 py-0.5 rounded">
                                Sponsor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ad.imageUrl && (
                          <div className="h-10 w-16 rounded overflow-hidden border border-border-theme bg-bg-secondary flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ad.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="rounded p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                          title="Delete Ad"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── SUBTAB: FEE VERIFICATION ── */}
        {activeSubTab === 'payouts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Submitted Fee Proof Approvals</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Review, verify, or reject certificate screenshots submitted by Nepalese traders.</p>
              </div>
            </div>

            {pendingPayouts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-theme bg-bg-card p-12 text-center text-xs text-text-muted italic">
                All fee submissions have been reviewed. No pending approvals.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pendingPayouts.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border-theme bg-bg-card p-4 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[11px] font-bold text-text-primary">u/{p.trader}</div>
                          <div className="text-[9px] font-mono text-text-muted mt-0.5">{p.hash}</div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5">
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-y border-border-theme/40 py-2 text-center font-mono">
                        <div>
                          <span className="text-[9px] text-text-muted block">AMOUNT</span>
                          <span className="text-xs font-black text-brand-green">${p.amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-muted block">PROP FIRM</span>
                          <span className="text-xs font-black text-text-primary">{p.propFirm}</span>
                        </div>
                      </div>

                      {p.imageUrl && (
                        <div className="h-28 w-full rounded-lg border border-border-theme overflow-hidden bg-bg-secondary flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imageUrl} alt="Certificate Proof" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovePayout(p.id)}
                        className="flex-1 rounded-lg bg-brand-green py-1.5 text-[10px] font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectPayout(p.id)}
                        className="flex-1 rounded-lg bg-red-950/20 border border-red-900/30 text-red-500 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black hover:border-red-500 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB: POSTS MODERATOR ── */}
        {activeSubTab === 'posts' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Feed Moderation Panel</h3>

            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-theme bg-bg-secondary text-text-muted uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Post Title</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Upvotes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme/40 text-text-secondary">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted italic">No posts found in database.</td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-bg-hover/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-text-primary max-w-sm truncate">{post.title}</td>
                          <td className="py-3 px-4 font-mono text-text-secondary">u/{post.author}</td>
                          <td className="py-3 px-4">
                            <span className="bg-bg-input border border-border-theme text-[10px] px-2 py-0.5 rounded text-text-secondary uppercase">
                              {post.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-brand-green">{post.upvotes}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="rounded p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB: TRADERS DIRECTORY ── */}
        {activeSubTab === 'profiles' && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Trader Profiles Directory</h3>
              
              {!isAddingProfile && (
                <button
                  onClick={() => setIsAddingProfile(true)}
                  className="btn-primary text-xs uppercase font-bold tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Trader Profile</span>
                </button>
              )}
            </div>

            {/* Profiles CRUD Form */}
            {isAddingProfile && (
              <div className="rounded-xl border border-border-theme bg-bg-card p-6 space-y-4 glow-accent">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                    {editingProfileId ? 'Edit Trader Profile' : 'New Trader Profile'}
                  </h4>
                  <button
                    onClick={() => {
                      setIsAddingProfile(false);
                      setEditingProfileId(null);
                      setProfileName('');
                      setProfileHandle('');
                      setProfileAvatar('👤');
                      setProfileFirms('');
                      setProfileBalance('$100,000');
                      setProfileWinRate('60%');
                      setProfileSplit('80%');
                      setProfileStatus('Active');
                      setProfileBio('');
                    }}
                    className="text-text-muted hover:text-text-primary transition-all cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Trader Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="e.g. Prabesh Shrestha"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Handle (Username)</label>
                      <input
                        type="text"
                        required
                        value={profileHandle}
                        onChange={(e) => setProfileHandle(e.target.value)}
                        placeholder="e.g. @prabeshFX"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Avatar Emoji</label>
                      <input
                        type="text"
                        required
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="e.g. ⚡"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Max Account Balance</label>
                      <input
                        type="text"
                        required
                        value={profileBalance}
                        onChange={(e) => setProfileBalance(e.target.value)}
                        placeholder="e.g. $100,000"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Win Rate</label>
                      <input
                        type="text"
                        required
                        value={profileWinRate}
                        onChange={(e) => setProfileWinRate(e.target.value)}
                        placeholder="e.g. 64%"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Profit Split</label>
                      <input
                        type="text"
                        required
                        value={profileSplit}
                        onChange={(e) => setProfileSplit(e.target.value)}
                        placeholder="e.g. 85%"
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Account Status</label>
                      <select
                        value={profileStatus}
                        onChange={(e) => setProfileStatus(e.target.value as 'Active' | 'Under Review' | 'Resetting')}
                        className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resetting">Resetting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">Prop Firms (comma-separated)</label>
                    <input
                      type="text"
                      required
                      value={profileFirms}
                      onChange={(e) => setProfileFirms(e.target.value)}
                      placeholder="e.g. FTMO, FundedNext, The 5%ers"
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Trading Thesis / Bio</label>
                    <textarea
                      required
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Forex swing trader specialized in Gold. Relying heavily on volume profile..."
                      className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none min-h-[60px] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProfile(false);
                        setEditingProfileId(null);
                      }}
                      className="rounded-lg border border-border-theme bg-bg-input/50 px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-green px-5 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingProfileId ? 'Save Edits' : 'Deploy Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profiles Directory Table */}
            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-theme bg-bg-secondary text-text-muted uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Trader Name</th>
                      <th className="py-3 px-4">Handle</th>
                      <th className="py-3 px-4">Max Balance</th>
                      <th className="py-3 px-4 font-mono">Win Rate</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme/40 text-text-secondary">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-bg-hover/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-text-primary flex items-center gap-2">
                          <span className="text-base select-none">{p.avatar}</span>
                          <span>{p.name}</span>
                          {p.isDemo && (
                            <span className="text-[7px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/25 px-1 py-0.2 rounded uppercase font-mono">
                              Demo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">{p.handle}</td>
                        <td className="py-3 px-4 font-mono font-bold text-text-primary">{p.balance}</td>
                        <td className="py-3 px-4 font-mono text-brand-green font-bold">{p.winRate}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                            p.status === 'Active' 
                              ? 'bg-brand-green/10 text-brand-green' 
                              : p.status === 'Under Review' 
                                ? 'bg-yellow-500/10 text-yellow-500' 
                                : 'bg-red-500/10 text-red-500'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 flex justify-end">
                          <button
                            onClick={() => handleEditProfileInit(p)}
                            className="rounded p-1 text-text-muted hover:text-brand-green hover:bg-brand-green/10 border border-transparent hover:border-brand-green/20 transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(p.id)}
                            className="rounded p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB: ACADEMY EDITOR ── */}
        {activeSubTab === 'academy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: Modules list */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Academy Modules</h3>
              
              <div className="space-y-3.5">
                {academyModules.map((mod) => {
                  const isSelected = editingModuleId === mod.id;
                  
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        setEditingModuleId(mod.id);
                        setModuleDesc(mod.desc);
                      }}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-brand-green bg-bg-input shadow-md' 
                          : 'border-border-theme bg-bg-card hover:border-border-hover'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                          {mod.level}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">{mod.duration}</span>
                      </div>

                      <h4 className="text-xs font-bold text-text-primary mt-2">{mod.title}</h4>
                      <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Active Module Editor */}
            <div className="lg:col-span-7">
              {editingModuleId ? (
                <div className="rounded-xl border border-border-theme bg-bg-card p-6 space-y-5 glow-accent">
                  {(() => {
                    const courseMod = academyModules.find(m => m.id === editingModuleId);
                    if (!courseMod) return null;

                    return (
                      <>
                        <div className="flex justify-between items-start border-b border-border-theme/40 pb-3">
                          <div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">
                              {courseMod.level}
                            </span>
                            <h4 className="text-sm font-bold text-text-primary mt-1.5">{courseMod.title}</h4>
                          </div>
                          <button
                            onClick={() => setEditingModuleId(null)}
                            className="text-text-muted hover:text-text-primary transition-all cursor-pointer"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {/* Description Editor */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Module Description</label>
                          <textarea
                            value={moduleDesc}
                            onChange={(e) => setModuleDesc(e.target.value)}
                            className="w-full rounded-lg border border-border-theme bg-bg-input py-2 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none min-h-[80px]"
                          />
                          <button
                            onClick={() => handleSaveAcademyModule(courseMod.id)}
                            className="btn-primary text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="h-3 w-3" />
                            <span>Save Description</span>
                          </button>
                        </div>

                        {/* Lesson outlines List & Editor Form */}
                        <div className="space-y-4 pt-3 border-t border-border-theme/40">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Lessons Outline</label>
                          
                          <div className="space-y-2">
                            {courseMod.lessons.map((lesson, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg bg-bg-input/60 border border-border-theme/40 p-2.5 text-xs text-text-secondary"
                              >
                                <span className="truncate font-medium text-text-primary">{lesson.title}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditLessonInit(idx, lesson)}
                                    className="rounded text-text-muted hover:text-brand-green hover:bg-brand-green/10 p-1 cursor-pointer transition-all border border-transparent hover:border-brand-green/20"
                                    title="Edit Lesson Outline"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(courseMod.id, idx)}
                                    className="rounded text-text-muted hover:text-red-500 hover:bg-red-500/10 p-1 cursor-pointer transition-all border border-transparent hover:border-red-500/20"
                                    title="Delete Lesson Outline"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add/Edit Lesson Form */}
                          <div className="rounded-lg border border-border-theme/60 bg-bg-secondary/20 p-4 mt-2 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                                {editingLessonIdx !== null ? `✏️ Edit Lesson #${editingLessonIdx + 1}` : '➕ Add Lesson'}
                              </span>
                              {editingLessonIdx !== null && (
                                <button
                                  type="button"
                                  onClick={resetLessonForm}
                                  className="text-[9px] text-text-muted hover:text-text-primary font-bold uppercase"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Lesson Title</label>
                                <input
                                  type="text"
                                  value={lessonTitle}
                                  onChange={(e) => setLessonTitle(e.target.value)}
                                  placeholder="e.g. Session Volatility & Risk Stops"
                                  className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Description / Rich Text Content</label>
                                <textarea
                                  value={lessonContent}
                                  onChange={(e) => setLessonContent(e.target.value)}
                                  placeholder="Details, patterns, SMC definitions..."
                                  className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none min-h-[70px] resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Media Type</label>
                                  <select
                                    value={lessonMediaType}
                                    onChange={(e) => setLessonMediaType(e.target.value as 'image' | 'video')}
                                    className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-secondary focus:border-brand-green focus:outline-none"
                                  >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Media File</label>
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          alert('File exceeds 5MB size limit.');
                                          return;
                                        }
                                        const isVideo = file.type.startsWith('video/');
                                        setLessonMediaType(isVideo ? 'video' : 'image');

                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          if (typeof reader.result === 'string') {
                                            setLessonMedia(reader.result);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="mt-1 w-full text-[10px] text-text-secondary rounded-lg border border-border-theme bg-bg-input p-1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Or Media URL (Optional)</label>
                                <input
                                  type="text"
                                  value={lessonMedia}
                                  onChange={(e) => setLessonMedia(e.target.value)}
                                  placeholder="e.g. /feed-images/nepse-chart.png"
                                  className="mt-1 w-full rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none"
                                />
                              </div>

                              {lessonMedia && (
                                <div className="rounded border border-border-theme p-1 mt-1 max-w-[160px] bg-bg-secondary relative">
                                  {lessonMediaType === 'video' ? (
                                    <video src={lessonMedia} className="w-full h-16 object-cover rounded" />
                                  ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={lessonMedia} alt="Preview" className="w-full h-16 object-cover rounded" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setLessonMedia('')}
                                    className="absolute top-1 right-1 rounded bg-black/70 p-0.5 text-text-muted hover:text-red-400"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSaveLesson(courseMod.id)}
                                className="w-full rounded-lg bg-brand-green text-black font-bold uppercase tracking-wider text-[10px] py-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {editingLessonIdx !== null ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                <span>{editingLessonIdx !== null ? 'Save Lesson Outline' : 'Append Lesson Outline'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-full rounded-xl border border-dashed border-border-theme bg-bg-card/40 p-12 flex flex-col items-center justify-center text-center text-xs text-text-muted italic space-y-2">
                  <BookOpen className="h-7 w-7 text-text-subtle" />
                  <span>Select an academy module on the left side to edit lessons and descriptions.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── SUBTAB: REGISTERED USERS DIRECTORY ── */}
        {activeSubTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Registered Users Directory</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Manage registered client accounts, trace metadata details, and perform simulated delete actions.</p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search username or email..."
                  className="rounded-lg border border-border-theme bg-bg-input py-1.5 px-3 text-xs text-text-primary focus:border-brand-green focus:outline-none w-full sm:w-56"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-theme bg-bg-secondary text-text-muted uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 font-mono">Joined Date</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme/40 text-text-secondary">
                    {users.filter(u => 
                      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchUser.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-muted italic">No registered users matched your criteria.</td>
                      </tr>
                    ) : (
                      users
                        .filter(u => 
                          u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchUser.toLowerCase())
                        )
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-bg-hover/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-text-primary flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-bg-secondary border border-border-theme text-[10px] font-bold text-text-primary flex-shrink-0 uppercase">
                                {u.avatar || u.username.slice(0, 2)}
                              </span>
                              <span>{u.username}</span>
                            </td>
                            <td className="py-3 px-4 font-mono">{u.email}</td>
                            <td className="py-3 px-4 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                                u.username === 'admin'
                                  ? 'bg-red-500/10 text-red-500'
                                  : u.isDemo 
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : 'bg-brand-green/10 text-brand-green'
                              }`}>
                                {u.username === 'admin' ? 'Root Admin' : u.isDemo ? 'Demo simulation' : 'Pro Trader'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="rounded p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB: PREMIUM ACCESS MANAGEMENT ── */}
        {activeSubTab === 'premium' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-yellow-400" />
                Premium Subscription — eSewa Payment Verification
              </h3>
              <p className="text-[10px] text-text-muted mt-1">
                Review eSewa transaction IDs submitted by users for premium strategy access. Verify legitimate payments and reject invalid ones.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending</div>
                <div className="text-2xl font-black text-yellow-400 mt-1">{premiumAccessList.filter(a => a.status === 'pending').length}</div>
              </div>
              <div className="rounded-xl border border-brand-green/20 bg-brand-green/5 p-4 text-center">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Verified</div>
                <div className="text-2xl font-black text-brand-green mt-1">{premiumAccessList.filter(a => a.status === 'verified').length}</div>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Rejected</div>
                <div className="text-2xl font-black text-red-400 mt-1">{premiumAccessList.filter(a => a.status === 'rejected').length}</div>
              </div>
            </div>

            {/* Pending Requests */}
            {premiumAccessList.filter(a => a.status === 'pending').length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">⏳ Pending Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {premiumAccessList.filter(a => a.status === 'pending').map((access) => (
                    <div
                      key={`${access.username}-${access.requestedAt}`}
                      className="rounded-xl border border-yellow-500/20 bg-bg-card p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-text-primary">u/{access.username}</div>
                          <div className="text-[9px] text-text-muted mt-0.5">Requested: {new Date(access.requestedAt).toLocaleString()}</div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5">
                          Pending
                        </span>
                      </div>

                      <div className="rounded-lg bg-bg-secondary/60 border border-border-theme p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">eSewa Transaction ID</span>
                        </div>
                        <div className="text-sm font-mono font-bold text-yellow-400 tracking-wider break-all">
                          {access.esewaTransactionId}
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-border-theme/40">
                          <span className="text-[10px] text-text-muted">Amount: <strong className="text-text-primary">Rs 1,500</strong></span>
                          <span className="text-[10px] text-text-muted">Duration: <strong className="text-text-primary">3 Months</strong></span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await api.verifyPremiumAccess(access.username);
                            loadAllData();
                          }}
                          className="flex-1 rounded-lg bg-brand-green py-2 text-[10px] font-bold text-black uppercase tracking-wider hover:bg-brand-green/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Verify Payment</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Reject premium access for "${access.username}"?`)) return;
                            await api.rejectPremiumAccess(access.username);
                            loadAllData();
                          }}
                          className="flex-1 rounded-lg bg-red-950/20 border border-red-900/30 text-red-500 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black hover:border-red-500 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Access Records Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">All Subscription Records</h4>
              <div className="rounded-xl border border-border-theme bg-bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-theme bg-bg-secondary text-text-muted uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">eSewa Transaction ID</th>
                        <th className="py-3 px-4">Requested</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Verified At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-theme/40 text-text-secondary">
                      {premiumAccessList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-muted italic">No premium access requests found.</td>
                        </tr>
                      ) : (
                        premiumAccessList.map((access) => (
                          <tr key={`${access.username}-${access.requestedAt}`} className="hover:bg-bg-hover/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-text-primary">u/{access.username}</td>
                            <td className="py-3 px-4 font-mono text-yellow-400">{access.esewaTransactionId}</td>
                            <td className="py-3 px-4 font-mono">{new Date(access.requestedAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                                access.status === 'verified'
                                  ? 'bg-brand-green/10 text-brand-green'
                                  : access.status === 'pending'
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : 'bg-red-500/10 text-red-500'
                              }`}>
                                {access.status === 'verified' ? '✅ Verified' : access.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {access.verifiedAt ? new Date(access.verifiedAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
