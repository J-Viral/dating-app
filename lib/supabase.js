import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpwbvjbvpllntceyssth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd2J2amJ2cGxsbnRjZXlzc3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjUyNDMsImV4cCI6MjA4MzM0MTI0M30.x0B27oni-NoWv_HCJhxTsWNLmKNe4--Yj1luRRCQkuI';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
