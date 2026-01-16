-- DesiDates Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE,
    email TEXT,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    bio TEXT,
    interests TEXT[], -- Array of interest tags
    education TEXT,
    occupation TEXT,
    height_cm INTEGER,
    
    -- Location data
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    location GEOGRAPHY(POINT), -- PostGIS point for geolocation
    
    -- Profile media
    photos TEXT[], -- Array of photo URLs
    profile_photo_url TEXT,
    
    -- Preferences
    looking_for TEXT CHECK (looking_for IN ('male', 'female', 'everyone')),
    age_preference_min INTEGER DEFAULT 18,
    age_preference_max INTEGER DEFAULT 100,
    distance_preference_km INTEGER DEFAULT 50,
    
    -- Privacy settings
    is_incognito BOOLEAN DEFAULT FALSE,
    profile_visible BOOLEAN DEFAULT TRUE,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRUST SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Score breakdown (0-100 total)
    total_score INTEGER DEFAULT 0,
    phone_verified BOOLEAN DEFAULT FALSE, -- +20
    email_verified BOOLEAN DEFAULT FALSE, -- +15
    photo_verified BOOLEAN DEFAULT FALSE, -- +25
    profile_complete BOOLEAN DEFAULT FALSE, -- +20
    
    -- Social verification
    facebook_linked BOOLEAN DEFAULT FALSE, -- +10
    instagram_linked BOOLEAN DEFAULT FALSE, -- +10
    linkedin_linked BOOLEAN DEFAULT FALSE, -- +10
    
    -- Account longevity bonus
    account_age_bonus INTEGER DEFAULT 0, -- up to +10 based on account age
    
    -- Verification level (L1, L2, L3)
    verification_level TEXT DEFAULT 'L0' CHECK (verification_level IN ('L0', 'L1', 'L2', 'L3')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Subscription tier
    tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'custom')),
    
    -- Payment details
    amount_paid DECIMAL(10, 2),
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    transaction_id TEXT,
    
    -- Subscription period
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SWIPES/LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Swipe action
    action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one swipe per pair
    UNIQUE(swiper_id, swiped_id)
);

-- ============================================
-- MATCHES TABLE (Mutual Likes)
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Match metadata
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Last interaction
    last_message_at TIMESTAMPTZ,
    
    -- Ensure user1_id < user2_id to avoid duplicates
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice')),
    media_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRIEND REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(sender_id, receiver_id)
);

-- ============================================
-- BLOCKED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id)
);

-- ============================================
-- REPORTED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reported_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY SWIPE LIMITS TABLE (for free tier)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_swipe_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    
    swipe_count INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    
    UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_profile_location ON users_profile USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_users_profile_gender ON users_profile(gender);
CREATE INDEX IF NOT EXISTS idx_users_profile_active ON users_profile(is_active);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trust_scores_user ON trust_scores(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users_profile
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users_profile
    FOR UPDATE USING (auth.uid() = id);

-- Users can view active, visible profiles (for discovery)
CREATE POLICY "Users can view active profiles" ON users_profile
    FOR SELECT USING (is_active = true AND profile_visible = true AND is_banned = false);

-- Trust scores readable by profile viewers
CREATE POLICY "Trust scores public read" ON trust_scores
    FOR SELECT USING (true);

-- Users can update own trust score
CREATE POLICY "Users can update own trust score" ON trust_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages readable by sender or receiver
CREATE POLICY "Messages readable by participants" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Messages writable by sender
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Matches readable by participants
CREATE POLICY "Matches readable by participants" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_scores_updated_at BEFORE UPDATE ON trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    ts RECORD;
BEGIN
    SELECT * INTO ts FROM trust_scores WHERE user_id = user_uuid;
    
    IF ts IS NOT NULL THEN
        IF ts.phone_verified THEN score := score + 20; END IF;
        IF ts.email_verified THEN score := score + 15; END IF;
        IF ts.photo_verified THEN score := score + 25; END IF;
        IF ts.profile_complete THEN score := score + 20; END IF;
        IF ts.facebook_linked THEN score := score + 10; END IF;
        IF ts.instagram_linked THEN score := score + 10; END IF;
        IF ts.linkedin_linked THEN score := score + 10; END IF;
        
        score := score + COALESCE(ts.account_age_bonus, 0);
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to create match when mutual like occurs
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
    mutual_like BOOLEAN;
    match_user1 UUID;
    match_user2 UUID;
BEGIN
    -- Only proceed if this is a 'like' or 'super_like'
    IF NEW.action IN ('like', 'super_like') THEN
        -- Check if the other user also liked this user
        SELECT EXISTS(
            SELECT 1 FROM swipes 
            WHERE swiper_id = NEW.swiped_id 
            AND swiped_id = NEW.swiper_id 
            AND action IN ('like', 'super_like')
        ) INTO mutual_like;
        
        IF mutual_like THEN
            -- Ensure user1_id < user2_id for consistency
            IF NEW.swiper_id < NEW.swiped_id THEN
                match_user1 := NEW.swiper_id;
                match_user2 := NEW.swiped_id;
            ELSE
                match_user1 := NEW.swiped_id;
                match_user2 := NEW.swiper_id;
            END IF;
            
            -- Create match (if not already exists)
            INSERT INTO matches (user1_id, user2_id, matched_at)
            VALUES (match_user1, match_user2, NOW())
            ON CONFLICT (user1_id, user2_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create matches
CREATE TRIGGER auto_create_match AFTER INSERT ON swipes
    FOR EACH ROW EXECUTE FUNCTION check_and_create_match();

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- No seed data needed for now
