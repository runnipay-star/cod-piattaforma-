import { createClient } from '@supabase/supabase-js';

// These variables should be configured in your environment.
// Do not hardcode them in the code.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Please provide SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
