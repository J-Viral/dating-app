// Chat Room Screen - Real-time messaging interface
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../navigation/types';
import { ChatService } from '../services/ChatService';
import { Message } from '../types/profile';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { glassStyles } from '../styles/glassmorphism';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export default function ChatRoomScreen({ route, navigation }: any) {
    const { matchId, otherUserId, otherUserName, otherUserPhoto } = route.params;
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadMessages();
        
        // Subscribe to real-time messages
        const channel = ChatService.subscribeToMessages(matchId, (newMessage) => {
            setMessages(prev => [newMessage, ...prev]);
            // Mark as read if from other user
            if (newMessage.sender_id === otherUserId) {
                ChatService.markMessageAsRead(newMessage.id);
            }
        });

        return () => {
            // Unsubscribe is a function returned by subscribeToMessages
            if (typeof channel === 'function') {
                channel();
            }
        };
    }, [matchId, otherUserId]);

    const loadMessages = async () => {
        setLoading(true);
        const msgs = await ChatService.getMessages(matchId);
        if (msgs) {
            setMessages(msgs.reverse()); // Reverse to show newest at bottom
        }
        setLoading(false);
    };

    const handleSend = async () => {
        const text = messageText.trim();
        if (!text || sending) return;

        setSending(true);
        setMessageText('');

        const success = await ChatService.sendMessage(matchId, otherUserId, text);
        
        if (!success) {
            // Restore message if failed
            setMessageText(text);
        }
        
        setSending(false);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id !== otherUserId;
        
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                {isMe ? (
                    <LinearGradient
                        colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                        style={[styles.messageBubble, styles.myBubble]}
                    >
                        <Text style={[styles.messageText, styles.myMessageText]}>
                            {item.content}
                        </Text>
                    </LinearGradient>
                ) : (
                    <LinearGradient
                        colors={[COLORS.glassSurface, 'rgba(0,0,0,0.3)']}
                        style={[styles.messageBubble, styles.theirBubble]}
                    >
                        <Text style={[styles.messageText, styles.theirMessageText]}>
                            {item.content}
                        </Text>
                    </LinearGradient>
                )}
                
                <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                    {formatTime(item.created_at)}
                    {isMe && item.read_at ? (
                        <Text style={styles.readIndicator}> · Read</Text>
                    ) : null}
                </Text>
            </View>
        );
    };

    return (
        <ScreenBackground>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Glass Header */}
                <View style={[styles.header, glassStyles.glassCard, { borderRadius: 0, borderWidth: 0, borderBottomWidth: 1 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    {otherUserPhoto && (
                        <Image source={{ uri: otherUserPhoto }} style={styles.avatar} />
                    )}
                    <Text style={styles.headerTitle}>{otherUserName}</Text>
                    <TouchableOpacity style={styles.headerAction}>
                        <Ionicons name="ellipsis-vertical" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        inverted
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No messages yet</Text>
                                <Text style={styles.emptySubtext}>Say hi to start the conversation! 👋</Text>
                            </View>
                        }
                    />
                )}

                {/* Glass Input Bar */}
                <View style={[styles.inputContainer, glassStyles.glassCard, { borderRadius: 0, borderWidth: 0, borderTopWidth: 1 }]}>
                    <TouchableOpacity style={styles.attachButton}>
                         <Ionicons name="add-circle-outline" size={28} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="Type a message..."
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!messageText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <LinearGradient
                                colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                                style={styles.sendGradient}
                            >
                                <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 12,
        marginBottom: 0,
        backgroundColor: COLORS.glassBackground, // Fallback or override
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
    },
    headerAction: {
        padding: 4,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        transform: [{ scaleY: -1 }], // Counteract inverted list
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageBubble: {
        borderRadius: 20,
        padding: 12,
        paddingHorizontal: 16,
        ...SHADOWS.subtle,
    },
    myBubble: {
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        marginHorizontal: 4,
    },
    myTimestamp: {
        color: COLORS.textMuted,
        textAlign: 'right',
    },
    theirTimestamp: {
        color: COLORS.textMuted,
        textAlign: 'left',
    },
    readIndicator: {
        color: COLORS.textMuted,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    },
    attachButton: {
        padding: 8,
        marginRight: 4,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.glassSurface,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.textPrimary,
        maxHeight: 100,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    sendGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
