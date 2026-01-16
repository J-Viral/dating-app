// Conversations Screen - List of all chats
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { COLORS } from '../constants/theme';
import { ChatService } from '../services/ChatService';

type NavigationProp = StackNavigationProp<MainStackParamList, 'ChatRoom'>;

export default function ConversationsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            await loadConversations(user.id);
        }
    };

    const loadConversations = async (uid: string) => {
        setLoading(true);
        const convos = await ChatService.getConversations(uid);
        setConversations(convos);
        setLoading(false);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const renderConversationItem = ({ item }: { item: any }) => {
        const match = item.match;
        const otherUser = userId === match.user1_id ? match.user2 : match.user1;
        const lastMessage = item.lastMessage;
        const unreadCount = item.unreadCount;

        const handlePress = () => {
            navigation.navigate('ChatRoom', {
                matchId: match.id,
                otherUserId: otherUser?.id || '',
                otherUserName: otherUser?.full_name || 'Match',
                otherUserPhoto: otherUser?.profile_photo_url || otherUser?.photos?.[0],
            });
        };

        return (
            <TouchableOpacity style={styles.conversationCard} onPress={handlePress}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: otherUser?.profile_photo_url || otherUser?.photos?.[0] }}
                        style={styles.avatar}
                    />
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.conversationInfo}>
                    <View style={styles.headerRow}>
                        <Text style={styles.userName}>{otherUser?.full_name || 'Unknown'}</Text>
                        {lastMessage && (
                            <Text style={styles.timestamp}>
                                {formatTime(lastMessage.created_at)}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {lastMessage?.content || 'Say hi!'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Match with someone to start chatting!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.match.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundPrimary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundPrimary,
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    listContainer: {
        paddingVertical: 8,
    },
    conversationCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.backgroundPrimary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    unreadBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    conversationInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
