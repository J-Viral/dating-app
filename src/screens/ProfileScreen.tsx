// Profile Screen - User's own profile view
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { COLORS } from '../constants/theme';
import { ProfileService } from '../services/ProfileService';
import { TrustScoreService } from '../services/TrustScoreService';
import { SubscriptionService } from '../services/SubscriptionService';
import { UserProfile, TrustScore, UserSubscription } from '../types/profile';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            await loadProfile(user.id);
        }
    };

    const loadProfile = async (uid: string) => {
        setLoading(true);
        const userProfile = await ProfileService.getProfile(uid);
        const userTrustScore = await ProfileService.getTrustScore(uid);
        const userSubscription = await SubscriptionService.getUserSubscription(uid);

        setProfile(userProfile);
        setTrustScore(userTrustScore);
        setSubscription(userSubscription);
        setLoading(false);
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
                style: 'destructive',
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Profile not found</Text>
            </View>
        );
    }

    const tierInfo = subscription ? SubscriptionService.getTierDetails(subscription.tier) : null;
    const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Profile Header */}
            <View style={styles.header}>
                <Image
                    source={{ uri: profile.profile_photo_url || profile.photos?.[0] }}
                    style={styles.profileImage}
                />
                <Text style={styles.name}>{profile.full_name}, {age}</Text>
                {profile.city && (
                    <Text style={styles.location}>📍 {profile.city}</Text>
                )}
            </View>

            {/* Trust Score Section */}
            {trustScore && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trust Score</Text>
                    <View style={styles.trustScoreCard}>
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreText}>{trustScore.total_score}</Text>
                            <Text style={styles.scoreLabel}>/100</Text>
                        </View>
                        <View style={styles.scoreDetails}>
                            <Text style={styles.verificationLevel}>
                                {TrustScoreService.getBadgeLabel(trustScore.verification_level)}
                            </Text>
                            <TouchableOpacity style={styles.verifyButton}>
                                <Text style={styles.verifyButtonText}>Increase Score →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Subscription Section */}
            {subscription && tierInfo && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription</Text>
                    <View style={styles.subscriptionCard}>
                        <Text style={styles.tierName}>{tierInfo.name} Tier</Text>
                        <Text style={styles.tierPrice}>{tierInfo.priceDisplay}</Text>
                        {subscription.tier === 'free' && (
                            <TouchableOpacity style={styles.upgradeButton}>
                                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Bio Section */}
            {profile.bio && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bio}>{profile.bio}</Text>
                </View>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <View style={styles.interestsContainer}>
                        {profile.interests.map((interest, idx) => (
                            <View key={idx} style={styles.interestTag}>
                                <Text style={styles.interestText}>{interest}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.detailsContainer}>
                    {profile.education && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Education</Text>
                            <Text style={styles.detailValue}>{profile.education}</Text>
                        </View>
                    )}
                    {profile.occupation && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Occupation</Text>
                            <Text style={styles.detailValue}>{profile.occupation}</Text>
                        </View>
                    )}
                    {profile.height_cm && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Height</Text>
                            <Text style={styles.detailValue}>{profile.height_cm} cm</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Text style={styles.actionButtonText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                    <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    contentContainer: {
        paddingBottom: 40,
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
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: COLORS.backgroundSecondary,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    trustScoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    scoreText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    scoreDetails: {
        flex: 1,
    },
    verificationLevel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    verifyButton: {
        paddingVertical: 8,
    },
    verifyButtonText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    subscriptionCard: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
    },
    tierName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    tierPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    upgradeButton: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    bio: {
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    interestText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    detailsContainer: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    actionsSection: {
        padding: 20,
        gap: 12,
    },
    actionButton: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    logoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FF5A5F',
    },
    logoutText: {
        color: '#FF5A5F',
    },
});
