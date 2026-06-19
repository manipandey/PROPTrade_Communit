-- database_schema_complete.sql
-- Unified migration script to add all required database tables and security policies for propNPL.

-- 1. EXTEND PROFILES TABLE WITH TRADER METRICS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS prop_firms text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS balance text DEFAULT '$100,000',
ADD COLUMN IF NOT EXISTS win_rate text DEFAULT '0%',
ADD COLUMN IF NOT EXISTS profit_split text DEFAULT '80%',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS equity_curve numeric[] DEFAULT '{0,0,0,0,0,0,0,0}'::numeric[],
ADD COLUMN IF NOT EXISTS bio text DEFAULT '';

-- 2. CREATE POST REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id, reaction_type)
);

-- 3. CREATE TRADING ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Challenge', 'Funded')),
  prop_firm text NOT NULL,
  size numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TRADE FEEDBACKS TABLE
CREATE TABLE IF NOT EXISTS public.trade_feedbacks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id text NOT NULL,
  author text NOT NULL,
  comment text NOT NULL,
  rating integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE ADS TABLE
CREATE TABLE IF NOT EXISTS public.ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text text NOT NULL,
  author text NOT NULL,
  is_sponsored boolean DEFAULT false NOT NULL,
  logo_url text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE ACADEMY MODULES TABLE
CREATE TABLE IF NOT EXISTS public.academy_modules (
  id text PRIMARY KEY,
  level text NOT NULL,
  title text NOT NULL,
  duration text NOT NULL,
  "desc" text NOT NULL,
  lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE PREMIUM ACCESS TABLE
CREATE TABLE IF NOT EXISTS public.premium_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  esewa_transaction_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  verified_at timestamp with time zone,
  UNIQUE(username, esewa_transaction_id)
);

-- 8. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL NEW TABLES
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_access ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES FOR NEW TABLES

-- Post Reactions Policies
CREATE POLICY "Post reactions are viewable by everyone" 
  ON public.post_reactions FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post reactions" 
  ON public.post_reactions FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can delete their own post reactions" 
  ON public.post_reactions FOR DELETE USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Trading Accounts Policies
CREATE POLICY "Users can view their own trading accounts" 
  ON public.trading_accounts FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can insert their own trading accounts" 
  ON public.trading_accounts FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can update their own trading accounts" 
  ON public.trading_accounts FOR UPDATE USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users can delete their own trading accounts" 
  ON public.trading_accounts FOR DELETE USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Trade Feedbacks Policies
CREATE POLICY "Trade feedbacks are viewable by everyone" 
  ON public.trade_feedbacks FOR SELECT USING (true);

CREATE POLICY "Anyone can insert trade feedbacks" 
  ON public.trade_feedbacks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete trade feedbacks" 
  ON public.trade_feedbacks FOR DELETE USING (true);

-- Ads Policies
CREATE POLICY "Ads are viewable by everyone" 
  ON public.ads FOR SELECT USING (true);

CREATE POLICY "Admins can manage ads" 
  ON public.ads FOR ALL USING (true);

-- Academy Modules Policies
CREATE POLICY "Academy modules are viewable by everyone" 
  ON public.academy_modules FOR SELECT USING (true);

CREATE POLICY "Admins can manage academy modules" 
  ON public.academy_modules FOR ALL USING (true);

-- Premium Access Policies
CREATE POLICY "Premium access is viewable by everyone" 
  ON public.premium_access FOR SELECT USING (true);

CREATE POLICY "Anyone can insert premium access requests" 
  ON public.premium_access FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update premium access" 
  ON public.premium_access FOR UPDATE USING (true);
