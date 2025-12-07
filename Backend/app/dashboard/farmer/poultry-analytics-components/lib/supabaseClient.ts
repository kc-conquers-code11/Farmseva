// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export type for use in components
export type TypedSupabaseClient = typeof supabase;
