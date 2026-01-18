// Safety Service - handles blocking, reporting, and safety features
import { supabase } from '../config/supabase';
import { BlockedUser, ReportedUser } from '../types/profile';

export class SafetyService {
    /**
     * Block a user
     */
    static async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<boolean> {
        try {
            const { error } = await supabase.from('blocked_users').insert({
                blocker_id: blockerId,
                blocked_id: blockedId,
                reason,
            });

            if (error) throw error;

            // Also unmatch if they were matched
            await this.unmatchUsers(blockerId, blockedId);

            return true;
        } catch (error) {
            console.error('Error blocking user:', error);
            return false;
        }
    }

    /**
     * Unblock a user
     */
    static async unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('blocked_users')
                .delete()
                .eq('blocker_id', blockerId)
                .eq('blocked_id', blockedId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error unblocking user:', error);
            return false;
        }
    }

    /**
     * Check if a user is blocked
     */
    static async isBlocked(user1Id: string, user2Id: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('blocked_users')
                .select('id')
                .or(
                    `and(blocker_id.eq.${user1Id},blocked_id.eq.${user2Id}),and(blocker_id.eq.${user2Id},blocked_id.eq.${user1Id})`
                )
                .limit(1);

            if (error) throw error;
            return (data?.length || 0) > 0;
        } catch (error) {
            console.error('Error checking if blocked:', error);
            return false;
        }
    }

    /**
     * Get list of blocked users
     */
    static async getBlockedUsers(userId: string): Promise<BlockedUser[]> {
        try {
            const { data, error } = await supabase
                .from('blocked_users')
                .select('*')
                .eq('blocker_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            return [];
        }
    }

    /**
     * Report a user
     */
    static async reportUser(
        reporterId: string,
        reportedId: string,
        reason: string,
        description?: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase.from('reported_users').insert({
                reporter_id: reporterId,
                reported_id: reportedId,
                reason,
                description,
                status: 'pending',
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error reporting user:', error);
            return false;
        }
    }

    /**
     * Unmatch users (helper function)
     */
    private static async unmatchUsers(user1Id: string, user2Id: string): Promise<void> {
        try {
            const [minId, maxId] = [user1Id, user2Id].sort();

            await supabase
                .from('matches')
                .update({ is_active: false })
                .eq('user1_id', minId)
                .eq('user2_id', maxId);
        } catch (error) {
            console.error('Error unmatching users:', error);
        }
    }

    /**
     * Get report reasons
     */
    static getReportReasons(): string[] {
        return [
            'Inappropriate content',
            'Fake profile',
            'Harassment',
            'Spam',
            'Underage user',
            'Offensive behavior',
            'Scam or fraud',
            'Other',
        ];
    }
}
