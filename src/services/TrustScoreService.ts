// Trust Score Service - handles verification and trust score calculations
import { supabase } from '../config/supabase';
import { TrustScore } from '../types/profile';

export class TrustScoreService {
    /**
     * Calculate total trust score
     */
    static calculateScore(trustScore: TrustScore): number {
        let score = 0;

        if (trustScore.phone_verified) score += 20;
        if (trustScore.email_verified) score += 15;
        if (trustScore.photo_verified) score += 25;
        if (trustScore.profile_complete) score += 20;
        if (trustScore.facebook_linked) score += 10;
        if (trustScore.instagram_linked) score += 10;
        if (trustScore.linkedin_linked) score += 10;
        score += trustScore.account_age_bonus || 0;

        return Math.min(score, 100); // Cap at 100
    }

    /**
     * Get verification level based on score
     */
    static getVerificationLevel(score: number): 'L0' | 'L1' | 'L2' | 'L3' {
        if (score >= 80) return 'L3';
        if (score >= 60) return 'L2';
        if (score >= 30) return 'L1';
        return 'L0';
    }

    /**
     * Update phone verification
     */
    static async updatePhoneVerification(userId: string, verified: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('trust_scores')
                .update({ phone_verified: verified })
                .eq('user_id', userId);

            if (error) throw error;

            // Recalculate total score
            await this.recalculateScore(userId);
            return true;
        } catch (error) {
            console.error('Error updating phone verification:', error);
            return false;
        }
    }

    /**
     * Update email verification
     */
    static async updateEmailVerification(userId: string, verified: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('trust_scores')
                .update({ email_verified: verified })
                .eq('user_id', userId);

            if (error) throw error;

            await this.recalculateScore(userId);
            return true;
        } catch (error) {
            console.error('Error updating email verification:', error);
            return false;
        }
    }

    /**
     * Update photo verification
     */
    static async updatePhotoVerification(userId: string, verified: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('trust_scores')
                .update({ photo_verified: verified })
                .eq('user_id', userId);

            if (error) throw error;

            await this.recalculateScore(userId);
            return true;
        } catch (error) {
            console.error('Error updating photo verification:', error);
            return false;
        }
    }

    /**
     * Update profile completeness
     */
    static async updateProfileComplete(userId: string, complete: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('trust_scores')
                .update({ profile_complete: complete })
                .eq('user_id', userId);

            if (error) throw error;

            await this.recalculateScore(userId);
            return true;
        } catch (error) {
            console.error('Error updating profile completeness:', error);
            return false;
        }
    }

    /**
     * Link social media account
     */
    static async linkSocialMedia(
        userId: string,
        platform: 'facebook' | 'instagram' | 'linkedin',
        linked: boolean
    ): Promise<boolean> {
        try {
            const field = `${platform}_linked`;
            const { error } = await supabase
                .from('trust_scores')
                .update({ [field]: linked })
                .eq('user_id', userId);

            if (error) throw error;

            await this.recalculateScore(userId);
            return true;
        } catch (error) {
            console.error(`Error linking ${platform}:`, error);
            return false;
        }
    }

    /**
     * Recalculate and update total score
     */
    static async recalculateScore(userId: string): Promise<void> {
        try {
            // Get current trust score
            const { data: trustScore, error: fetchError } = await supabase
                .from('trust_scores')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (fetchError || !trustScore) throw fetchError;

            // Calculate new score
            const newScore = this.calculateScore(trustScore);
            const newLevel = this.getVerificationLevel(newScore);

            // Update in database
            const { error: updateError } = await supabase
                .from('trust_scores')
                .update({
                    total_score: newScore,
                    verification_level: newLevel,
                })
                .eq('user_id', userId);

            if (updateError) throw updateError;
        } catch (error) {
            console.error('Error recalculating score:', error);
        }
    }

    /**
     * Calculate account age bonus (up to 10 points)
     */
    static calculateAccountAgeBonus(accountCreatedAt: string): number {
        const createdDate = new Date(accountCreatedAt);
        const now = new Date();
        const daysSinceCreation = Math.floor(
            (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 1 point per 30 days, max 10 points (300 days)
        return Math.min(Math.floor(daysSinceCreation / 30), 10);
    }

    /**
     * Update account age bonus
     */
    static async updateAccountAgeBonus(userId: string, createdAt: string): Promise<void> {
        try {
            const bonus = this.calculateAccountAgeBonus(createdAt);

            const { error } = await supabase
                .from('trust_scores')
                .update({ account_age_bonus: bonus })
                .eq('user_id', userId);

            if (error) throw error;

            await this.recalculateScore(userId);
        } catch (error) {
            console.error('Error updating account age bonus:', error);
        }
    }

    /**
     * Get trust badge color based on level
     */
    static getBadgeColor(level: 'L0' | 'L1' | 'L2' | 'L3'): string {
        const colors = {
            L0: '#999999', // Gray
            L1: '#CD7F32', // Bronze
            L2: '#C0C0C0', // Silver
            L3: '#FFD700', // Gold
        };
        return colors[level];
    }

    /**
     * Get trust badge label
     */
    static getBadgeLabel(level: 'L0' | 'L1' | 'L2' | 'L3'): string {
        const labels = {
            L0: 'Unverified',
            L1: 'Basic Verified',
            L2: 'Verified',
            L3: 'Highly Verified',
        };
        return labels[level];
    }
}
