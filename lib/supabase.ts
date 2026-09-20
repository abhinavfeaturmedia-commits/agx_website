import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://lgvqkumqjmeyycqvgycv.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndnFrdW1xam1leXljcXZneWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjcyMDgsImV4cCI6MjEwMjgwMzIwOH0.-_fV2jVv-mKm4z4BTVCWhT35ixYo0yOrUlhrOdngtlU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
