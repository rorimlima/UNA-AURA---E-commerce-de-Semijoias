import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lnydwisbmswxdbzyxvky.supabase.co';
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueWR3aXNibXN3eGRienl4dmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzUyODUsImV4cCI6MjA5MjQ1MTI4NX0.41cM-LsFdtfXknuRutW2pwISLquLcQ8Nf7b1nMtm7GE';

// @ts-ignore
export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

