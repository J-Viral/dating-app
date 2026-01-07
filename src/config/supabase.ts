// Supabase client configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { UserMetadata } from '../types/auth';
import { SUPABASE_CONFIG } from './credentials';

// Import credentials from credentials.ts
// Edit src/config/credentials.ts to add your Supabase URL and anon key
const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Type-safe auth helpers
export type SupabaseSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
