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
} from 'react-native';
import { supabase } from '../config/supabase';
import { COLORS } from '../constants/theme';
import { MatchingService } from '../services/MatchingService';
import { SubscriptionService } from '../services/SubscriptionService';
import { DiscoveryProfile } from '../types/profile';

const { width, height } = Dimensions.get('window');

export default function DiscoveryScreen() {
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding matches...</Text>
            </View>
        );
    }

    if (profiles.length === 0 || currentIndex >= profiles.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No more profiles to show</Text>
                <Text style={styles.emptySubtext}>Check back later for new matches!</Text>
            </View>
        );
    }

    const currentProfile = profiles[currentIndex];
    const age = currentProfile.age || 0;

    return (
        <View style={styles.container}>
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

                {/* Profile Info Overlay */}
                <View style={styles.infoOverlay}>
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
                        <Text style={styles.location}>📍 {currentProfile.city}</Text>
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
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => handleSwipe('pass')}
                >
                    <Text style={styles.actionButtonText}>✕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.superLikeButton]}
                    onPress={() => handleSwipe('super_like')}
                >
                    <Text style={styles.actionButtonText}>★</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={() => handleSwipe('like')}
                >
                    <Text style={styles.actionButtonText}>♡</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
        alignItems: 'center',
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
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
        backgroundColor: COLORS.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    swipesRemainingContainer: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    swipesRemainingText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    card: {
        width: width - 40,
        height: height * 0.65,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    trustBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trustBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    location: {
        fontSize: 14,
        color: '#EEEEEE',
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: '#DDDDDD',
        marginBottom: 12,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    interestText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: width - 80,
        marginTop: 24,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    passButton: {
        backgroundColor: '#FF5A5F',
    },
    likeButton: {
        backgroundColor: '#4CAF50',
    },
    superLikeButton: {
        backgroundColor: '#2196F3',
    },
    actionButtonText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
