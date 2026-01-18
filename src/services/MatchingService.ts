// Matching Service - handles swipes, matches, and discovery feed
import { supabase } from '../config/supabase';
import { DiscoveryProfile, Swipe, SwipeAction, Match, UserSubscription } from '../types/profile';

export class MatchingService {
    /**
     * Get discovery feed (potential matches)
     */
    static async getDiscoveryFeed(
        userId: string,
        limit: number = 20
    ): Promise<DiscoveryProfile[]> {
        try {
            // Get user's profile to know preferences
            const { data: userProfile, error: profileError } = await supabase
                .from('users_profile')
                .select('*, trust_scores(*)')
                .eq('id', userId)
                .single();

            if (profileError || !userProfile) throw profileError;

            // Get users already swiped on
            const { data: swipedUsers } = await supabase
                .from('swipes')
                .select('swiped_id')
                .eq('swiper_id', userId);

            const swipedIds = swipedUsers?.map((s) => s.swiped_id) || [];

            // Build query for potential matches
            let query = supabase
                .from('users_profile')
                .select('*, trust_scores(*)')
                .eq('is_active', true)
                .eq('profile_visible', true)
                .eq('is_banned', false)
                .neq('id', userId);

            // Filter by gender preference
            if (userProfile.looking_for && userProfile.looking_for !== 'everyone') {
                query = query.eq('gender', userProfile.looking_for);
            }

            // Filter by age preferences
            if (userProfile.age_preference_min && userProfile.age_preference_max) {
                const today = new Date();
                const maxDate = new Date(
                    today.getFullYear() - userProfile.age_preference_min,
                    today.getMonth(),
                    today.getDate()
                );
                const minDate = new Date(
                    today.getFullYear() - userProfile.age_preference_max,
                    today.getMonth(),
                    today.getDate()
                );

                query = query
                    .gte('date_of_birth', minDate.toISOString().split('T')[0])
                    .lte('date_of_birth', maxDate.toISOString().split('T')[0]);
            }

            // Exclude already swiped users
            if (swipedIds.length > 0) {
                query = query.not('id', 'in', `(${swipedIds.join(',')})`);
            }

            // Limit results
            query = query.limit(limit);

            const { data, error } = await query;

            if (error) throw error;

            // Calculate ages and format
            const profiles: DiscoveryProfile[] = (data || []).map((profile) => {
                const age = this.calculateAge(profile.date_of_birth);
                return {
                    ...profile,
                    age,
                    trust_score: profile.trust_scores,
                };
            });

            return profiles;
        } catch (error) {
            console.error('Error fetching discovery feed:', error);
            return [];
        }
    }

    /**
     * Record a swipe action
     */
    static async recordSwipe(
        swiperId: string,
        swipedId: string,
        action: SwipeAction
    ): Promise<boolean> {
        try {
            const { error } = await supabase.from('swipes').insert({
                swiper_id: swiperId,
                swiped_id: swipedId,
                action,
            });

            if (error) throw error;

            // The database trigger will automatically create a match if mutual like
            return true;
        } catch (error) {
            console.error('Error recording swipe:', error);
            return false;
        }
    }

    /**
     * Check daily swipe limit for free tier users
     */
    static async checkSwipeLimit(
        userId: string,
        subscription: UserSubscription
    ): Promise<{ canSwipe: boolean; remaining: number }> {
        // Unlimited swipes for paid tiers
        if (subscription.tier !== 'free') {
            return { canSwipe: true, remaining: -1 }; // -1 means unlimited
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            // Get today's swipe count
            const { data, error } = await supabase
                .from('daily_swipe_limits')
                .select('swipe_count')
                .eq('user_id', userId)
                .eq('date', today)
                .single();

            const currentCount = data?.swipe_count || 0;
            const limit = 10; // Free tier limit
            const remaining = Math.max(0, limit - currentCount);

            return {
                canSwipe: currentCount < limit,
                remaining,
            };
        } catch (error) {
            console.error('Error checking swipe limit:', error);
            return { canSwipe: true, remaining: 10 };
        }
    }

    /**
     * Increment daily swipe count
     */
    static async incrementSwipeCount(userId: string): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Upsert swipe count
            const { data: existing } = await supabase
                .from('daily_swipe_limits')
                .select('id, swipe_count')
                .eq('user_id', userId)
                .eq('date', today)
                .single();

            if (existing) {
                await supabase
                    .from('daily_swipe_limits')
                    .update({ swipe_count: existing.swipe_count + 1 })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('daily_swipe_limits')
                    .insert({ user_id: userId, swipe_count: 1, date: today });
            }
        } catch (error) {
            console.error('Error incrementing swipe count:', error);
        }
    }

    /**
     * Get all matches for a user
     */
    static async getMatches(userId: string): Promise<Match[]> {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*, user1:users_profile!user1_id(*), user2:users_profile!user2_id(*)')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .eq('is_active', true)
                .order('matched_at', { ascending: false });

            if (error) throw error;

            // Format to include the other user's profile
            const matches: Match[] = (data || []).map((match) => {
                const isUser1 = match.user1_id === userId;
                const otherUser = isUser1 ? match.user2 : match.user1;

                return {
                    ...match,
                    other_user: otherUser,
                };
            });

            return matches;
        } catch (error) {
            console.error('Error fetching matches:', error);
            return [];
        }
    }

    /**
     * Check if two users are matched
     */
    static async areMatched(user1Id: string, user2Id: string): Promise<boolean> {
        try {
            const [minId, maxId] = [user1Id, user2Id].sort();

            const { data, error } = await supabase
                .from('matches')
                .select('id')
                .eq('user1_id', minId)
                .eq('user2_id', maxId)
                .eq('is_active', true)
                .single();

            return !!data;
        } catch (error) {
            return false;
        }
    }

    /**
     * Unmatch with a user
     */
    static async unmatch(matchId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('matches')
                .update({ is_active: false })
                .eq('id', matchId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error unmatching:', error);
            return false;
        }
    }

    /**
     * Calculate age from date of birth
     */
    static calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Get users who liked me (premium feature)
     */
    static async getUsersWhoLikedMe(userId: string): Promise<DiscoveryProfile[]> {
        try {
            const { data, error } = await supabase
                .from('swipes')
                .select('swiper_id, users_profile!swiper_id(*, trust_scores(*))')
                .eq('swiped_id', userId)
                .in('action', ['like', 'super_like']);

            if (error) throw error;

            const profiles: DiscoveryProfile[] = (data || []).map((swipe: any) => {
                const profile = swipe.users_profile;
                const age = this.calculateAge(profile.date_of_birth);
                return {
                    ...profile,
                    age,
                    trust_score: profile.trust_scores,
                };
            });

            return profiles;
        } catch (error) {
            console.error('Error fetching users who liked me:', error);
            return [];
        }
    }
}
