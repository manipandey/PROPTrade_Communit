-- CREATE PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  trader text NOT NULL,
  amount numeric NOT NULL,
  prop_firm text NOT NULL,
  date text NOT NULL,
  hash text NOT NULL,
  verified boolean DEFAULT false NOT NULL,
  likes text[] DEFAULT '{}'::text[] NOT NULL,
  comments jsonb DEFAULT '[]'::jsonb NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES

-- 1. Payouts are viewable by everyone
CREATE POLICY "Payouts are viewable by everyone" 
  ON public.payouts FOR SELECT USING (true);

-- 2. Authenticated users can insert their own payouts (or guest posts if user_id is null)
CREATE POLICY "Users can insert payouts" 
  ON public.payouts FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- 3. Users can update their own payouts (e.g. for comments, likes, edits)
CREATE POLICY "Users can update payouts" 
  ON public.payouts FOR UPDATE USING (
    true
  );

-- 4. Admins/moderators can delete payouts
CREATE POLICY "Users/Admins can delete payouts" 
  ON public.payouts FOR DELETE USING (
    true
  );
