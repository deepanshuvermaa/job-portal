import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client with service role key (for backend operations)
export const supabase: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client with anon key (for auth operations)
export const supabaseAuth: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

export default supabase;
