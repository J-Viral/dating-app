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
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ChatService } from '../services/ChatService';
import { ScreenBackground } from '../components/ui/ScreenBackground';

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
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.cardContainer}>
                 <LinearGradient
                    colors={[COLORS.glassSurface, 'rgba(0,0,0,0.2)']}
                    style={styles.conversationCard}
                 >
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: otherUser?.profile_photo_url || otherUser?.photos?.[0] }}
                            style={styles.avatar}
                        />
                        {unreadCount > 0 && (
                            <LinearGradient
                                colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                                style={styles.unreadBadge}
                            >
                                <Text style={styles.unreadText}>{unreadCount}</Text>
                            </LinearGradient>
                        )}
                    </View>
                    <View style={styles.conversationInfo}>
                        <View style={styles.headerRow}>
                            <Text style={styles.userName}>{otherUser?.full_name || 'Unknown'}</Text>
                            <Text style={styles.timestamp}>
                                {lastMessage ? formatTime(lastMessage.created_at) : ''}
                            </Text>
                        </View>
                        <Text 
                            style={[
                                styles.lastMessage, 
                                unreadCount > 0 && styles.lastMessageUnread
                            ]} 
                            numberOfLines={1}
                        >
                            {lastMessage?.content || 'Say hi!'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                 </LinearGradient>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <ScreenBackground style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </ScreenBackground>
        );
    }

    if (conversations.length === 0) {
        return (
            <ScreenBackground style={styles.emptyContainer}>
                <View style={[styles.glassMessage, { alignItems: 'center' }]}>
                    <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>No messages yet</Text>
                    <Text style={styles.emptySubtext}>Match with someone to start chatting!</Text>
                </View>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground style={styles.container}>
            <FlatList
                data={conversations}
                renderItem={renderConversationItem}
                keyExtractor={(item) => item.match.id}
                contentContainerStyle={styles.listContainer}
            />
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    glassMessage: {
        padding: 40,
        backgroundColor: COLORS.glassBackground,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.medium,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    listContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        paddingBottom: 100, // Tab bar space
    },
    cardContainer: {
        marginBottom: 12,
        ...SHADOWS.subtle,
    },
    conversationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    unreadBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: COLORS.backgroundSecondary,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    conversationInfo: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    lastMessageUnread: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
});
