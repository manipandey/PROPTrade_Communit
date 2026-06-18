// src/components/InstrumentCommunities.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Image as ImageIcon, Video, Send, 
  TrendingUp, TrendingDown, Clock, MessageCircle, Heart, Share2, Upload, X
} from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change: string;
  isUp: boolean;
}

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  commentsCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

const INSTRUMENTS: Instrument[] = [
  { id: 'xauusd', name: 'Gold Spot', symbol: 'XAUUSD', icon: '🪙', price: '2,428.50', change: '-0.15%', isUp: false },
  { id: 'eurusd', name: 'EUR/USD', symbol: 'EURUSD', icon: '💱', price: '1.0842', change: '+0.24%', isUp: true },
  { id: 'btcusd', name: 'Bitcoin Spot', symbol: 'BTCUSD', icon: '🪙', price: '67,250.00', change: '+2.10%', isUp: true },
  { id: 'nas100', name: 'NASDAQ 100', symbol: 'NAS100', icon: '📈', price: '18,940.20', change: '+0.82%', isUp: true },
];

const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  xauusd: [
    { id: 'c1', author: 'Ishaan Ghimire', avatar: 'IG', text: 'Gold hitting support at 2420. Looking for SMC liquidity sweep before entering longs.', timestamp: '11:05 AM' },
    { id: 'c2', author: 'Anjali KC', avatar: 'AK', text: 'Daily candle looks bearish, might sweep down to 2408 first.', timestamp: '11:12 AM' },
    { id: 'c3', author: 'Samir R. Shah', avatar: 'SR', text: 'Fibs levels align perfectly. Ready to long if London session confirms structural shift.', timestamp: '11:15 AM' },
  ],
  eurusd: [
    { id: 'c4', author: 'Milan Thapa', avatar: 'MT', text: 'EURUSD is consolidation bound. NY session might break it out.', timestamp: '10:45 AM' },
    { id: 'c5', author: 'Sujata K.', avatar: 'SK', text: 'FVG fill on 4H chart completed. Looking bullish for the day.', timestamp: '11:00 AM' },
  ],
  btcusd: [
    { id: 'c6', author: 'Rojan Devkota', avatar: 'RD', text: 'BTC holding 67k nicely. Spot buying looking strong.', timestamp: '09:30 AM' },
    { id: 'c7', author: 'Prabin Bhattarai', avatar: 'PB', text: 'Bull flag forming on 1H chart. Target 68.5k.', timestamp: '10:15 AM' },
  ],
  nas100: [
    { id: 'c8', author: 'Arjun Adhikari', avatar: 'AA', text: 'Tech leading the Nasdaq rally today. Microsoft earnings hype.', timestamp: '11:20 AM' },
  ]
};

const INITIAL_POSTS: Record<string, CommunityPost[]> = {
  xauusd: [
    {
      id: 'p1',
      author: 'Ishaan Ghimire',
      avatar: 'IG',
      title: 'Gold 1H Order Block Entry Strategy',
      content: 'We swept the early London session lows. Price tapped into the 1-hour bullish order block. Looking for a displacement up towards 2445. Keep risk small as NY news is coming up.',
      bias: 'Bullish',
      mediaUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      likes: 18,
      commentsCount: 4,
      createdAt: '2 hours ago'
    }
  ],
  eurusd: [
    {
      id: 'p2',
      author: 'Sujata K.',
      avatar: 'SK',
      title: 'EURUSD liquidity sweep & bearish reversal pattern',
      content: 'Tapped into the 4H premium FVG and saw structural displacement on the 15M chart. Target is the sell-side liquidity at 1.0790.',
      bias: 'Bearish',
      likes: 12,
      commentsCount: 2,
      createdAt: '4 hours ago'
    }
  ],
  btcusd: [],
  nas100: []
};

interface InstrumentCommunitiesProps {
  currentUser: { username: string; loggedIn: boolean; avatar: string } | null;
  onOpenAuth: () => void;
}

export default function InstrumentCommunities({ currentUser, onOpenAuth }: InstrumentCommunitiesProps) {
  const [selectedInst, setSelectedInst] = useState<Instrument>(INSTRUMENTS[0]);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'forum'>('chat');
  
  // Dynamic Sentiment States
  const [votes, setVotes] = useState<Record<string, { bullish: number; bearish: number }>>({});
  const [userVote, setUserVote] = useState<Record<string, 'bullish' | 'bearish' | null>>({});

  // Chat/Forum list states
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [posts, setPosts] = useState<Record<string, CommunityPost[]>>(INITIAL_POSTS);

  // Message Form States
  const [chatInput, setChatInput] = useState('');
  
  // Post Form States
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postBias, setPostBias] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postMediaType, setPostMediaType] = useState<'image' | 'video'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize sentiment votes from localStorage
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedVotes = localStorage.getItem('propnepal_inst_votes');
    const savedUserVote = localStorage.getItem('propnepal_inst_user_votes');
    
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    } else {
      const initial: Record<string, { bullish: number; bearish: number }> = {
        xauusd: { bullish: 65, bearish: 35 },
        eurusd: { bullish: 48, bearish: 52 },
        btcusd: { bullish: 72, bearish: 28 },
        nas100: { bullish: 80, bearish: 20 },
      };
      setVotes(initial);
      localStorage.setItem('propnepal_inst_votes', JSON.stringify(initial));
    }

    if (savedUserVote) {
      setUserVote(JSON.parse(savedUserVote));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Scroll to bottom of chat whenever messages load or active tab changes
  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedInst, activeSubTab]);

  const handleVote = (type: 'bullish' | 'bearish') => {
    if (!currentUser?.loggedIn) {
      onOpenAuth();
      return;
    }

    const currentInstId = selectedInst.id;
    const previousVote = userVote[currentInstId];

    if (previousVote === type) return; // already voted this direction

    setVotes(prev => {
      const instVotes = prev[currentInstId] || { bullish: 10, bearish: 10 };
      let newBullish = instVotes.bullish;
      let newBearish = instVotes.bearish;

      if (type === 'bullish') {
        newBullish += 1;
        if (previousVote === 'bearish') newBearish -= 1;
      } else {
        newBearish += 1;
        if (previousVote === 'bullish') newBullish -= 1;
      }

      const updated = {
        ...prev,
        [currentInstId]: { bullish: newBullish, bearish: newBearish }
      };
      localStorage.setItem('propnepal_inst_votes', JSON.stringify(updated));
      return updated;
    });

    setUserVote(prev => {
      const updated = {
        ...prev,
        [currentInstId]: type
      };
      localStorage.setItem('propnepal_inst_user_votes', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSendChatMessage = () => {
    if (!currentUser?.loggedIn) {
      onOpenAuth();
      return;
    }
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      author: currentUser.username,
      avatar: currentUser.avatar || '👤',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => {
      const list = prev[selectedInst.id] || [];
      const updated = {
        ...prev,
        [selectedInst.id]: [...list, newMsg]
      };
      return updated;
    });

    setChatInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPostMediaUrl(reader.result as string);
      setPostMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.loggedIn) {
      onOpenAuth();
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: CommunityPost = {
      id: Math.random().toString(),
      author: currentUser.username,
      avatar: currentUser.avatar || '👤',
      title: postTitle.trim(),
      content: postContent.trim(),
      bias: postBias,
      mediaUrl: postMediaUrl || undefined,
      mediaType: postMediaUrl ? postMediaType : undefined,
      likes: 0,
      commentsCount: 0,
      createdAt: 'Just now'
    };

    setPosts(prev => {
      const list = prev[selectedInst.id] || [];
      const updated = {
        ...prev,
        [selectedInst.id]: [newPost, ...list]
      };
      return updated;
    });

    // Reset Form
    setPostTitle('');
    setPostContent('');
    setPostBias('Neutral');
    setPostMediaUrl('');
    setIsCreatingPost(false);
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser?.loggedIn) {
      onOpenAuth();
      return;
    }

    setPosts(prev => {
      const list = prev[selectedInst.id] || [];
      const updated = list.map(p => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            likes: hasLiked ? p.likes + 1 : p.likes - 1,
            hasLiked
          };
        }
        return p;
      });
      return {
        ...prev,
        [selectedInst.id]: updated
      };
    });
  };

  // Compute sentiment stats
  const currentVotes = votes[selectedInst.id] || { bullish: 50, bearish: 50 };
  const totalVotes = currentVotes.bullish + currentVotes.bearish;
  const bullishPercent = totalVotes > 0 ? Math.round((currentVotes.bullish / totalVotes) * 100) : 50;
  const bearishPercent = 100 - bullishPercent;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Header Info */}
      <div className="text-center space-y-1 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
          Instrument <span className="text-brand-green">Groups</span>
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary">
          Join dedicated groups, vote on live market bias, upload chart analysis, and discuss trading setups in real-time.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Instruments List */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-1 mb-2">Select Community Group</div>
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInst.id === inst.id;
            return (
              <div
                key={inst.id}
                onClick={() => setSelectedInst(inst)}
                className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-accent-light border-brand-green/30 text-text-primary' 
                    : 'bg-bg-card border-border-theme text-text-secondary hover:border-border-hover hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-lg bg-bg-input p-1.5 rounded-lg border border-border-theme">{inst.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">{inst.name}</div>
                    <div className="text-[9px] text-text-muted font-mono">{inst.symbol}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold font-mono">${inst.price}</div>
                  <span className={`text-[9px] font-bold font-mono ${inst.isUp ? 'text-brand-green' : 'text-red-500'}`}>
                    {inst.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center/Right Section: Community Channels */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Active Instrument Stats & Sentiment Header */}
          <div className="bg-bg-card border border-border-theme rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-radial-accent pointer-events-none opacity-5" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                  Active Community
                </span>
                <h3 className="text-lg sm:text-xl font-black text-text-primary mt-1.5 flex items-center gap-2">
                  <span>{selectedInst.icon}</span> {selectedInst.name} ({selectedInst.symbol})
                </h3>
              </div>

              {/* Vote Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleVote('bullish')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all ${
                    userVote[selectedInst.id] === 'bullish'
                      ? 'bg-green-950/20 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                      : 'border-border-theme bg-bg-secondary text-text-secondary hover:border-green-800/40 hover:text-green-400'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Bullish</span>
                </button>
                <button
                  onClick={() => handleVote('bearish')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all ${
                    userVote[selectedInst.id] === 'bearish'
                      ? 'bg-red-950/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'border-border-theme bg-bg-secondary text-text-secondary hover:border-red-800/40 hover:text-red-400'
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>Bearish</span>
                </button>
              </div>
            </div>

            {/* Sentiment Consensus Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center border-t border-border-theme/40 pt-4">
              <div className="md:col-span-3 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Consensus bias</span>
                <span className={`text-base font-black uppercase mt-1 ${bullishPercent >= 55 ? 'text-brand-green' : bearishPercent >= 55 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {bullishPercent >= 65 ? 'Strong Bullish' : bullishPercent >= 55 ? 'Moderate Bullish' : bearishPercent >= 65 ? 'Strong Bearish' : bearishPercent >= 55 ? 'Moderate Bearish' : 'Neutral'}
                </span>
                <span className="text-[9px] text-text-muted mt-0.5">{totalVotes} votes cast</span>
              </div>
              
              <div className="md:col-span-9 space-y-2">
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-brand-green">BULLISH: {bullishPercent}%</span>
                  <span className="text-red-500">BEARISH: {bearishPercent}%</span>
                </div>
                {/* Sentiment Gauge Bar */}
                <div className="h-3.5 w-full bg-bg-secondary border border-border-theme rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-brand-green shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-500" 
                    style={{ width: `${bullishPercent}%` }} 
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-500" 
                    style={{ width: `${bearishPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SubTab Toggles: Chat Rooms / Forum Feed */}
          <div className="flex border-b border-border-theme gap-6">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`pb-3.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'chat'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>Group Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSubTab('forum')}
              className={`pb-3.5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                activeSubTab === 'forum'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Community Analysis</span>
              </div>
            </button>
          </div>

          {/* SUBTAB CONTENT: CHAT LOG */}
          {activeSubTab === 'chat' && (
            <div className="bg-bg-card border border-border-theme rounded-2xl flex flex-col h-[480px] overflow-hidden shadow-sm">
              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {(chats[selectedInst.id] || []).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-muted text-xs italic">
                    No chats yet. Be the first to start the conversation!
                  </div>
                ) : (
                  (chats[selectedInst.id] || []).map((msg) => {
                    const isSelf = currentUser?.loggedIn && msg.author === currentUser.username;
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isSelf ? 'justify-end' : ''}`}>
                        {!isSelf && (
                          <div className="h-8.5 w-8.5 rounded-lg bg-accent-light border border-brand-green/20 text-brand-green flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {msg.avatar}
                          </div>
                        )}
                        <div className={`space-y-1 max-w-[70%] ${isSelf ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 justify-start">
                            <span className="text-[10px] font-black text-text-primary">{msg.author}</span>
                            <span className="text-[8px] text-text-muted">{msg.timestamp}</span>
                          </div>
                          <div className={`p-3 text-xs leading-relaxed rounded-2xl ${
                            isSelf 
                              ? 'bg-brand-green text-black rounded-tr-none font-bold' 
                              : 'bg-bg-secondary border border-border-theme rounded-tl-none text-text-secondary'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Box */}
              <div className="border-t border-border-theme bg-bg-secondary/45 p-4 flex gap-2 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder={currentUser?.loggedIn ? "Type message, share setup..." : "Sign in to join chat..."}
                  disabled={!currentUser?.loggedIn}
                  className="flex-1 t-input px-4 py-2.5 text-xs bg-bg-input"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!currentUser?.loggedIn || !chatInput.trim()}
                  className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">SEND</span>
                </button>
              </div>
            </div>
          )}

          {/* SUBTAB CONTENT: FORUM FEED & UPLOADS */}
          {activeSubTab === 'forum' && (
            <div className="space-y-5">
              
              {/* Trigger Creation Form */}
              {!isCreatingPost ? (
                <button
                  onClick={() => {
                    if (!currentUser?.loggedIn) {
                      onOpenAuth();
                    } else {
                      setIsCreatingPost(true);
                    }
                  }}
                  className="w-full border-2 border-dashed border-border-theme rounded-2xl py-6 hover:border-brand-green/30 text-text-muted hover:text-brand-green transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-3 bg-bg-secondary group-hover:bg-brand-green/10 rounded-xl border border-border-theme transition-colors">
                    <Upload className="h-5 w-5 text-text-muted group-hover:text-brand-green" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Upload Analysis & Charts</span>
                </button>
              ) : (
                <form onSubmit={handleSubmitPost} className="bg-bg-card border border-border-theme rounded-2xl p-5 space-y-4 shadow-lg animate-fade-in text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-border-theme/40">
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">Publish Technical Analysis</h4>
                    <button type="button" onClick={() => setIsCreatingPost(false)} className="text-text-muted hover:text-text-primary">
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="e.g. Gold Double Top 15M Sweep"
                          className="w-full t-input px-3.5 py-2 text-xs bg-bg-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">Direction Bias</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Bullish', 'Bearish', 'Neutral'] as const).map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setPostBias(b)}
                              className={`py-2 px-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border transition-all ${
                                postBias === b
                                  ? b === 'Bullish' ? 'bg-green-950/20 border-green-500 text-green-400'
                                    : b === 'Bearish' ? 'bg-red-950/20 border-red-500 text-red-400'
                                    : 'bg-zinc-800 border-zinc-600 text-zinc-300'
                                  : 'bg-bg-input border-border-theme text-text-muted hover:border-border-hover'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Media upload grid section */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">Upload Media (Chart Screenshot or Video)</label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {postMediaUrl ? (
                          <div className="relative border border-border-theme bg-bg-input rounded-xl p-2 h-24 flex items-center justify-between group overflow-hidden">
                            {postMediaType === 'video' ? (
                              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                                <Video className="h-5 w-5 text-brand-green" />
                                <span>Attached Video File</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={postMediaUrl} className="h-full w-20 object-cover rounded-lg" alt="Upload preview" />
                            )}
                            <button
                              type="button"
                              onClick={() => setPostMediaUrl('')}
                              className="bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white rounded-full p-1 border border-zinc-700/60"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border border-dashed border-border-theme hover:border-brand-green/30 bg-bg-input rounded-xl h-24 flex flex-col items-center justify-center text-text-muted hover:text-brand-green transition-colors gap-1.5"
                          >
                            <ImageIcon className="h-5 w-5" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Click to Select File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1">Analysis / Thesis</label>
                    <textarea
                      required
                      rows={3}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Describe your target levels, structural biases, FVG gaps, drawdown controls..."
                      className="w-full t-input px-3.5 py-2 text-xs bg-bg-input resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border-theme/40 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingPost(false)}
                      className="px-4 py-2 border border-border-theme hover:bg-bg-hover text-text-muted rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-green text-black border border-brand-green hover:bg-transparent hover:text-brand-green px-5 py-2 rounded-xl text-xs font-black transition-all"
                    >
                      Publish Idea
                    </button>
                  </div>
                </form>
              )}

              {/* Forum Post Cards */}
              <div className="space-y-4">
                {(posts[selectedInst.id] || []).length === 0 ? (
                  <div className="bg-bg-card border border-border-theme rounded-2xl p-10 text-center text-text-muted text-xs italic">
                    No technical analysis has been posted yet for {selectedInst.symbol}. Start by posting one!
                  </div>
                ) : (
                  (posts[selectedInst.id] || []).map((post) => (
                    <div key={post.id} className="bg-bg-card border border-border-theme rounded-2xl p-5 space-y-4 text-left shadow-sm hover:border-border-hover transition-colors">
                      {/* Author Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 bg-accent-light border border-brand-green/25 text-brand-green flex items-center justify-center rounded-lg text-xs font-black">
                            {post.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-text-primary">{post.author}</div>
                            <div className="flex items-center gap-1.5 text-[9px] text-text-muted mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{post.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bias Tag */}
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                          post.bias === 'Bullish' ? 'bg-green-950/20 border-green-500/30 text-green-400'
                            : post.bias === 'Bearish' ? 'bg-red-950/20 border-red-500/30 text-red-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        }`}>
                          {post.bias} Idea
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-black text-text-primary leading-snug">{post.title}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Attached media display */}
                      {post.mediaUrl && (
                        <div className="border border-border-theme/60 rounded-xl overflow-hidden bg-bg-secondary max-h-[360px] flex justify-center">
                          {post.mediaType === 'video' ? (
                            <video 
                              src={post.mediaUrl} 
                              controls 
                              className="w-full h-full max-h-[360px] object-contain"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={post.mediaUrl} 
                              alt="Chart analysis" 
                              className="w-full h-full max-h-[360px] object-cover"
                            />
                          )}
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="flex items-center gap-5 border-t border-border-theme/40 pt-3">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider transition-colors ${
                            post.hasLiked ? 'text-green-500' : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${post.hasLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes} LIKES</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-text-muted hover:text-text-primary">
                          <MessageCircle className="h-4.5 w-4.5" />
                          <span>{post.commentsCount} COMMENTS</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-text-muted hover:text-text-primary ml-auto">
                          <Share2 className="h-4.5 w-4.5" />
                          <span>SHARE</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
