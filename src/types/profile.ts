// Type definitions for user profiles and dating app entities

export interface UserProfile {
    id: string;
    phone_number?: string;
    email?: string;
    username?: string;
    full_name: string;
    date_of_birth: string; // ISO date string
    gender: 'male' | 'female' | 'other';
    bio?: string;
    interests?: string[];
    education?: string;
    occupation?: string;
    height_cm?: number;
    
    // Location
    city?: string;
    state?: string;
    country?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    
    // Photos
    photos?: string[];
    profile_photo_url?: string;
    
    // Preferences
    looking_for?: 'male' | 'female' | 'everyone';
    age_preference_min?: number;
    age_preference_max?: number;
    distance_preference_km?: number;
    
    // Privacy
    is_incognito?: boolean;
    profile_visible?: boolean;
    
    // Status
    is_active?: boolean;
    is_verified?: boolean;
    is_banned?: boolean;
    profile_completed?: boolean;
    
    // Metadata
    created_at?: string;
    updated_at?: string;
    last_active_at?: string;
}

export interface TrustScore {
    id: string;
    user_id: string;
    total_score: number;
    phone_verified: boolean;
    email_verified: boolean;
    photo_verified: boolean;
    profile_complete: boolean;
    facebook_linked: boolean;
    instagram_linked: boolean;
    linkedin_linked: boolean;
    account_age_bonus: number;
    verification_level: 'L0' | 'L1' | 'L2' | 'L3';
    created_at?: string;
    updated_at?: string;
}

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'custom';

export interface UserSubscription {
    id: string;
    user_id: string;
    tier: SubscriptionTier;
    amount_paid?: number;
    currency?: string;
    payment_method?: string;
    transaction_id?: string;
    started_at?: string;
    expires_at?: string;
    is_active: boolean;
    auto_renew: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Match {
    id: string;
    user1_id: string;
    user2_id: string;
    matched_at: string;
    is_active: boolean;
    last_message_at?: string;
    
    // Populated fields (from joins)
    other_user?: UserProfile;
    other_user_trust_score?: TrustScore;
}

export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type: 'text' | 'image' | 'video' | 'voice';
    media_url?: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    updated_at?: string;
}

export type SwipeAction = 'like' | 'pass' | 'super_like';

export interface Swipe {
    id: string;
    swiper_id: string;
    swiped_id: string;
    action: SwipeAction;
    created_at: string;
}

export interface FriendRequest {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at?: string;
    
    // Populated
    sender?: UserProfile;
}

export interface BlockedUser {
    id: string;
    blocker_id: string;
    blocked_id: string;
    reason?: string;
    created_at: string;
}

export interface ReportedUser {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
    created_at: string;
    updated_at?: string;
}

// Subscription tier features
export interface SubscriptionFeatures {
    tier: SubscriptionTier;
    name: string;
    price: number; // in INR
    priceDisplay: string;
    features: string[];
    swipesPerDay: number | 'unlimited';
    canSendMessages: boolean;
    canSendFriendRequests: boolean;
    canVideoCall: boolean;
    canSeeLikes: boolean;
    hasAdvancedFilters: boolean;
    hasPriorityMatching: boolean;
    hasPremiumUI: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
    free: {
        tier: 'free',
        name: 'Free',
        price: 0,
        priceDisplay: 'Free',
        features: [
            'View profiles',
            'Receive friend requests',
            'Accept friend requests',
            '10 swipes per day',
        ],
        swipesPerDay: 10,
        canSendMessages: false,
        canSendFriendRequests: false,
        canVideoCall: false,
        canSeeLikes: false,
        hasAdvancedFilters: false,
        hasPriorityMatching: false,
        hasPremiumUI: false,
    },
    basic: {
        tier: 'basic',
        name: 'Basic',
        price: 399,
        priceDisplay: '₹399/month',
        features: [
            'All Free features',
            'Unlimited swipes',
            'Send & receive messages',
            'Send friend requests',
            'Video calling',
        ],
        swipesPerDay: 'unlimited',
        canSendMessages: true,
        canSendFriendRequests: true,
        canVideoCall: true,
        canSeeLikes: false,
        hasAdvancedFilters: false,
        hasPriorityMatching: false,
        hasPremiumUI: false,
    },
    pro: {
        tier: 'pro',
        name: 'Pro',
        price: 799,
        priceDisplay: '₹799/month',
        features: [
            'All Basic features',
            'See who liked you',
            'Advanced filters',
            'Priority matching',
            'Premium UI',
            'No ads',
        ],
        swipesPerDay: 'unlimited',
        canSendMessages: true,
        canSendFriendRequests: true,
        canVideoCall: true,
        canSeeLikes: true,
        hasAdvancedFilters: true,
        hasPriorityMatching: true,
        hasPremiumUI: true,
    },
    custom: {
        tier: 'custom',
        name: 'Custom',
        price: 1999,
        priceDisplay: '₹1,999/month',
        features: [
            'All Pro features',
            'Custom UI themes',
            'Concierge service',
            'Dedicated relationship manager',
            'Priority support',
        ],
        swipesPerDay: 'unlimited',
        canSendMessages: true,
        canSendFriendRequests: true,
        canVideoCall: true,
        canSeeLikes: true,
        hasAdvancedFilters: true,
        hasPriorityMatching: true,
        hasPremiumUI: true,
    },
};

// Helper types for profile creation/editing
export interface ProfileUpdateData {
    full_name?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    interests?: string[];
    education?: string;
    occupation?: string;
    height_cm?: number;
    city?: string;
    state?: string;
    looking_for?: 'male' | 'female' | 'everyone';
    age_preference_min?: number;
    age_preference_max?: number;
    distance_preference_km?: number;
    photos?: string[];
    profile_photo_url?: string;
}

// Discovery feed item (enriched profile)
export interface DiscoveryProfile extends UserProfile {
    trust_score: TrustScore;
    distance_km?: number;
    age?: number;
}
