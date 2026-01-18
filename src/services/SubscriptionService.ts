// Subscription Service - handles payment tiers and features
import { supabase } from '../config/supabase';
import { UserSubscription, SubscriptionTier, SUBSCRIPTION_TIERS } from '../types/profile';

export class SubscriptionService {
    /**
     * Get user's current subscription
     */
    static async getUserSubscription(userId: string): Promise<UserSubscription> {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error || !data) {
                // Return free tier if no subscription
                return this.getDefaultFreeSubscription(userId);
            }

            // Check if subscription has expired
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                // Subscription expired, deactivate it
                await this.deactivateSubscription(data.id);
                return this.getDefaultFreeSubscription(userId);
            }

            return data;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            return this.getDefaultFreeSubscription(userId);
        }
    }

    /**
     * Get default free subscription
     */
    private static getDefaultFreeSubscription(userId: string): UserSubscription {
        return {
            id: 'free-default',
            user_id: userId,
            tier: 'free',
            is_active: true,
            auto_renew: false,
        };
    }

    /**
     * Create or upgrade subscription
     */
    static async createSubscription(
        userId: string,
        tier: SubscriptionTier,
        durationMonths: number = 1,
        paymentDetails?: {
            amount: number;
            transactionId: string;
            paymentMethod: string;
        }
    ): Promise<UserSubscription | null> {
        try {
            // Deactivate any existing active subscriptions
            await supabase
                .from('user_subscriptions')
                .update({ is_active: false })
                .eq('user_id', userId)
                .eq('is_active', true);

            // Calculate expiration date
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

            const subscriptionData: any = {
                user_id: userId,
                tier,
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                is_active: true,
                auto_renew: false,
            };

            if (paymentDetails) {
                subscriptionData.amount_paid = paymentDetails.amount;
                subscriptionData.transaction_id = paymentDetails.transactionId;
                subscriptionData.payment_method = paymentDetails.paymentMethod;
                subscriptionData.currency = 'INR';
            }

            const { data, error } = await supabase
                .from('user_subscriptions')
                .insert(subscriptionData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating subscription:', error);
            return null;
        }
    }

    /**
     * Deactivate a subscription
     */
    static async deactivateSubscription(subscriptionId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_subscriptions')
                .update({ is_active: false })
                .eq('id', subscriptionId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deactivating subscription:', error);
            return false;
        }
    }

    /**
     * Check if user has access to a feature
     */
    static async canAccessFeature(
        userId: string,
        feature: keyof typeof SUBSCRIPTION_TIERS.free
    ): Promise<boolean> {
        const subscription = await this.getUserSubscription(userId);
        const tierFeatures = SUBSCRIPTION_TIERS[subscription.tier];
        
        return tierFeatures[feature] as boolean;
    }

    /**
     * Get subscription tier details
     */
    static getTierDetails(tier: SubscriptionTier) {
        return SUBSCRIPTION_TIERS[tier];
    }

    /**
     * Get all available tiers
     */
    static getAllTiers() {
        return Object.values(SUBSCRIPTION_TIERS);
    }
}
