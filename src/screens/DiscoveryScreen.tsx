// Discovery Screen - Swipe interface for finding matches
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { MatchingService } from '../services/MatchingService';
import { SubscriptionService } from '../services/SubscriptionService';
import { DiscoveryProfile } from '../types/profile';
import { ScreenBackground } from '../components/ui/ScreenBackground';

const { width, height } = Dimensions.get('window');

export default function DiscoveryScreen() {
    console.log('Rendering DiscoveryScreen'); // Debug log to confirm load
    const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [swipesRemaining, setSwipesRemaining] = useState(-1);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            await loadProfiles(user.id);
            await checkSwipeLimit(user.id);
        }
    };

    const loadProfiles = async (uid: string) => {
        setLoading(true);
        const discoveryProfiles = await MatchingService.getDiscoveryFeed(uid, 20);
        setProfiles(discoveryProfiles);
        setLoading(false);
    };

    const checkSwipeLimit = async (uid: string) => {
        const subscription = await SubscriptionService.getUserSubscription(uid);
        const { remaining } = await MatchingService.checkSwipeLimit(uid, subscription);
        setSwipesRemaining(remaining);
    };

    const handleSwipe = async (action: 'like' | 'pass' | 'super_like') => {
        if (!userId || currentIndex >= profiles.length) return;

        const currentProfile = profiles[currentIndex];

        // Check swipe limit
        const subscription = await SubscriptionService.getUserSubscription(userId);
        const { canSwipe } = await MatchingService.checkSwipeLimit(userId, subscription);

        if (!canSwipe) {
            Alert.alert(
                'Swipe Limit Reached',
                'Upgrade to Basic or higher to get unlimited swipes!',
                [{ text: 'OK' }]
            );
            return;
        }

        // Record swipe
        const success = await MatchingService.recordSwipe(userId, currentProfile.id, action);

        if (success) {
            await MatchingService.incrementSwipeCount(userId);
            setCurrentIndex(currentIndex + 1);
            await checkSwipeLimit(userId);

            // Check if matched (for like/super_like)
            if (action === 'like' || action === 'super_like') {
                const matched = await MatchingService.areMatched(userId, currentProfile.id);
                if (matched) {
                    Alert.alert('It\'s a Match! 🎉', `You matched with ${currentProfile.full_name}!`);
                }
            }
        }

        // Load more profiles if running low
        if (currentIndex >= profiles.length - 5 && userId) {
            loadProfiles(userId);
        }
    };

    if (loading) {
        return (
            <ScreenBackground style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding matches...</Text>
            </ScreenBackground>
        );
    }

    if (profiles.length === 0 || currentIndex >= profiles.length) {
        return (
            <ScreenBackground style={styles.emptyContainer}>
                <View style={styles.glassMessage}>
                    <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>No more profiles</Text>
                    <Text style={styles.emptySubtext}>Check back later or adjust your filters!</Text>
                </View>
            </ScreenBackground>
        );
    }

    const currentProfile = profiles[currentIndex];
    const age = currentProfile.age || 0;

    return (
        <ScreenBackground style={styles.container}>
            {/* Swipes remaining indicator */}
            {swipesRemaining >= 0 && (
                <View style={styles.swipesRemainingContainer}>
                    <Text style={styles.swipesRemainingText}>
                        {swipesRemaining} swipes remaining today
                    </Text>
                </View>
            )}

            {/* Profile Card */}
            <View style={styles.card}>
                <Image
                    source={{ uri: currentProfile.profile_photo_url || currentProfile.photos?.[0] }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />

                {/* Gradient Info Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                    style={styles.infoOverlay}
                >
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>
                            {currentProfile.full_name}, {age}
                        </Text>
                        {currentProfile.trust_score && (
                            <View style={styles.trustBadge}>
                                <Text style={styles.trustBadgeText}>
                                    {currentProfile.trust_score.verification_level}
                                </Text>
                            </View>
                        )}
                    </View>

                    {currentProfile.city && (
                        <Text style={styles.location}>
                             <Ionicons name="location-sharp" size={14} color={COLORS.primary} /> {currentProfile.city}
                        </Text>
                    )}

                    {currentProfile.bio && (
                        <Text style={styles.bio} numberOfLines={2}>
                            {currentProfile.bio}
                        </Text>
                    )}

                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                        <View style={styles.interestsContainer}>
                            {currentProfile.interests.slice(0, 3).map((interest, idx) => (
                                <View key={idx} style={styles.interestTag}>
                                    <Text style={styles.interestText}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButtonContainer}
                    onPress={() => handleSwipe('pass')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#4B5563', '#1F2937']} // Gray/Dark for pass
                        style={styles.actionButton}
                    >
                         <Ionicons name="close" size={32} color={COLORS.nope} />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButtonContainer, styles.superLikeCoords]}
                    onPress={() => handleSwipe('super_like')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                         colors={[COLORS.gradientSecondaryStart, COLORS.gradientSecondaryEnd]} // Blue/Cyan
                         style={styles.actionButtonSmall}
                    >
                        <Ionicons name="flash" size={24} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButtonContainer}
                    onPress={() => handleSwipe('like')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]} // Pink/Purple for Like
                        style={styles.actionButton}
                    >
                         <Ionicons name="heart" size={32} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 60, // Adjust for transparent header
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary,
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
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    emptyText: {
        fontSize: 24,
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
    swipesRemainingContainer: {
        backgroundColor: COLORS.glassSurface,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    swipesRemainingText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        width: width - 32,
        height: height * 0.62,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.medium,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingTop: 60, // Gradient fade start
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 30,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    trustBadge: {
        backgroundColor: COLORS.glassSurface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    trustBadgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    location: {
        fontSize: 16,
        color: '#E0E0E0',
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        color: '#DDDDDD',
        marginBottom: 16,
        lineHeight: 22,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    interestText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width - 60, // Wider for space
        marginTop: 24,
        paddingHorizontal: 20,
    },
    actionButtonContainer: {
        ...SHADOWS.glow,
    },
    superLikeCoords: {
        marginBottom: 20, // Sit higher
    },
    actionButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonSmall: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
