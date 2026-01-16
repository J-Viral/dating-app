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
import { MainStackParamList } from '../navigation/types';
import { ChatService } from '../services/ChatService';
import { Message } from '../types/profile';
import { COLORS } from '../constants/theme';

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
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                </View>
                <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                    {formatTime(item.created_at)}
                    {isMe && item.read_at && ' · Read'}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                {otherUserPhoto && (
                    <Image source={{ uri: otherUserPhoto }} style={styles.avatar} />
                )}
                <Text style={styles.headerTitle}>{otherUserName}</Text>
            </View>

            {/* Messages List */}
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

            {/* Input Bar */}
            <View style={styles.inputContainer}>
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
                        <Text style={styles.sendIcon}>📤</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: COLORS.backgroundSecondary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        marginRight: 12,
    },
    backIcon: {
        fontSize: 24,
        color: COLORS.textPrimary,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    messagesList: {
        padding: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
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
        borderRadius: 16,
        padding: 12,
        paddingHorizontal: 16,
    },
    myBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: COLORS.backgroundSecondary,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        marginHorizontal: 4,
    },
    myTimestamp: {
        color: COLORS.textSecondary,
        textAlign: 'right',
    },
    theirTimestamp: {
        color: COLORS.textSecondary,
        textAlign: 'left',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: COLORS.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.textPrimary,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendIcon: {
        fontSize: 20,
    },
});
