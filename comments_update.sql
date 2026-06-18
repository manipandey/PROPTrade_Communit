-- 1. Add parent_id to comments for nested replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id uuid references public.comments(id) ON DELETE CASCADE;

-- 2. Create comment_reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- 3. Enable RLS on comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Policies for comment_reactions
CREATE POLICY "Comment reactions are viewable by everyone." 
  ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comment reactions." 
  ON public.comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment reactions." 
  ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);
