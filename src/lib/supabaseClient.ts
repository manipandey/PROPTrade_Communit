import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (typeof window !== 'undefined' && supabaseUrl.includes('placeholder')) {
  console.warn(
    'Warning: Supabase client is initialized with placeholder credentials. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Environment Variables and redeploy.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
