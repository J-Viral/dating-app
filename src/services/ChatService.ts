// Chat Service - handles real-time messaging
import { supabase } from '../config/supabase';
import { Message, Match } from '../types/profile';

export class ChatService {
    /**
     * Send a message to a match
     */
    static async sendMessage(
        matchId: string,
        receiverId: string,
        content: string,
        messageType: 'text' | 'image' | 'video' | 'voice' = 'text',
        mediaUrl?: string
    ): Promise<boolean> {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    match_id: matchId,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    content,
                    message_type: messageType,
                    media_url: mediaUrl,
                })
                .select()
                .single();

            if (error) throw error;

            // Update match last_message_at
            await supabase
                .from('matches')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', matchId);

            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    /**
     * Get messages for a match
     */
    static async getMessages(matchId: string, limit: number = 50): Promise<Message[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('match_id', matchId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    /**
     * Subscribe to new messages in real-time
     */
    static subscribeToMessages(
        matchId: string,
        callback: (message: Message) => void
    ): () => void {
        const subscription = supabase
            .channel(`messages:${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `match_id=eq.${matchId}`,
                },
                (payload) => {
                    callback(payload.new as Message);
                }
            )
            .subscribe();

        // Return unsubscribe function
        return () => {
            subscription.unsubscribe();
        };
    }

    /**
     * Mark message as read
     */
    static async markAsRead(messageId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('messages')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                })
                .eq('id', messageId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking message as read:', error);
            return false;
        }
    }

    /**
     * Alias for markAsRead
     */
    static async markMessageAsRead(messageId: string): Promise<boolean> {
        return this.markAsRead(messageId);
    }

    /**
     * Mark all messages in a match as read
     */
    static async markAllAsRead(matchId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('messages')
                .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                })
                .eq('match_id', matchId)
                .eq('receiver_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking all messages as read:', error);
            return false;
        }
    }

    /**
     * Get unread message count for a match
     */
    static async getUnreadCount(matchId: string, userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('match_id', matchId)
                .eq('receiver_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Get all conversations with unread counts
     */
    static async getConversations(userId: string): Promise<any[]> {
        try {
            const { data: matches, error } = await supabase
                .from('matches')
                .select('*, messages(*)')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .eq('is_active', true)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Format conversations with unread counts
            const conversations = await Promise.all(
                (matches || []).map(async (match) => {
                    const unreadCount = await this.getUnreadCount(match.id, userId);
                    const lastMessage = match.messages?.[match.messages.length - 1];

                    return {
                        match,
                        unreadCount,
                        lastMessage,
                    };
                })
            );

            return conversations;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    /**
     * Delete a message (soft delete - only for sender within 5 minutes)
     */
    static async deleteMessage(messageId: string, senderId: string): Promise<boolean> {
        try {
            // Check if message belongs to sender and was sent recently
            const { data: message, error: fetchError } = await supabase
                .from('messages')
                .select('sender_id, created_at')
                .eq('id', messageId)
                .single();

            if (fetchError || !message) throw fetchError;

            if (message.sender_id !== senderId) {
                throw new Error('Not authorized to delete this message');
            }

            const createdAt = new Date(message.created_at);
            const now = new Date();
            const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

            if (minutesElapsed > 5) {
                throw new Error('Cannot delete messages older than 5 minutes');
            }

            // Delete the message
            const { error: deleteError } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (deleteError) throw deleteError;
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }
}
