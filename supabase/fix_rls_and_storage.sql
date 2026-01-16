-- RUN THIS IN SUPABASE SQL EDITOR TO FIX STORAGE AND RLS ISSUES

-- 1. Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'profile-photos'
-- Allow public to view photos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');

-- Allow users to upload to their own folder (profiles/{userId}/*)
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND 
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own photos
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'profile-photos' AND 
    (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Fix Missing RLS INSERT Policies for public tables
-- users_profile table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_profile;
CREATE POLICY "Users can insert own profile" ON public.users_profile 
FOR INSERT WITH CHECK (auth.uid() = id);

-- trust_scores table
DROP POLICY IF EXISTS "Users can insert own trust score" ON public.trust_scores;
CREATE POLICY "Users can insert own trust score" ON public.trust_scores 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_subscriptions table (initial free tier creation)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions 
FOR INSERT WITH CHECK (auth.uid() = user_id);
