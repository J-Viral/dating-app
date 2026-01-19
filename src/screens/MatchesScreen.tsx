// Matches Screen - Display all matched users
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { glassStyles } from '../styles/glassmorphism';
import { MatchingService } from '../services/MatchingService';
import { Match } from '../types/profile';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export default function MatchesScreen() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            await loadMatches(user.id);
        }
    };

    const loadMatches = async (uid: string) => {
        setLoading(true);
        const userMatches = await MatchingService.getMatches(uid);
        setMatches(userMatches);
        setLoading(false);
    };

    const renderMatchItem = ({ item }: { item: Match }) => {
        const otherUser = item.other_user;
        if (!otherUser) return null;

        return (
            <TouchableOpacity style={styles.matchCardContainer} activeOpacity={0.8}>
                 <LinearGradient
                    colors={[COLORS.glassSurface, 'rgba(0,0,0,0.4)']}
                    style={styles.matchCard}
                 >
                    <Image
                        source={{ uri: otherUser.profile_photo_url || otherUser.photos?.[0] }}
                        style={styles.matchImage}
                    />
                    <View style={styles.matchInfo}>
                        <Text style={styles.matchName}>{otherUser.full_name}</Text>
                        {otherUser.city && (
                            <Text style={styles.matchLocation}>
                                <Ionicons name="location-sharp" size={12} color={COLORS.textMuted} /> {otherUser.city}
                            </Text>
                        )}
                        <Text style={styles.matchedDate}>
                            Matched {new Date(item.matched_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.actionButton}>
                        <LinearGradient
                            colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                            style={styles.chatIcon}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                        </LinearGradient>
                    </View>
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

    if (matches.length === 0) {
        return (
            <ScreenBackground style={styles.emptyContainer}>
                <View style={[glassStyles.glassCard, { alignItems: 'center' }]}>
                    <Ionicons name="heart-dislike-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>No matches yet</Text>
                    <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
                </View>
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground style={styles.container}>
            <FlatList
                data={matches}
                renderItem={renderMatchItem}
                keyExtractor={(item) => item.id}
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
        padding: 20,
        paddingBottom: 100, // Space for tab bar
    },
    matchCardContainer: {
        marginBottom: 16,
        ...SHADOWS.medium,
        borderRadius: BORDER_RADIUS.lg,
    },
    matchCard: {
        flexDirection: 'row',
        borderRadius: BORDER_RADIUS.lg,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    matchImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    matchInfo: {
        flex: 1,
    },
    matchName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    matchLocation: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    matchedDate: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    actionButton: {
        marginLeft: 12,
    },
    chatIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.glow,
    },
});
