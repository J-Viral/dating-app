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
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../navigation/types';
import { supabase } from '../config/supabase';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { glassStyles } from '../styles/glassmorphism';
import { ProfileService } from '../services/ProfileService';
import { TrustScoreService } from '../services/TrustScoreService';
import { SubscriptionService } from '../services/SubscriptionService';
import { UserProfile, TrustScore, UserSubscription } from '../types/profile';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { GradientButton } from '../components/ui/GradientButton';
import { AudioPrompt } from '../components/profile/AudioPrompt';

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
            <ScreenBackground style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </ScreenBackground>
        );
    }

    if (!profile) {
        return (
            <ScreenBackground style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Profile not found</Text>
            </ScreenBackground>
        );
    }

    const tierInfo = subscription ? SubscriptionService.getTierDetails(subscription.tier) : null;
    const age = profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 0;

    return (
        <ScreenBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Profile Header */}
                <View style={[styles.header, glassStyles.glassCard, { marginTop: 20 }]}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: profile.profile_photo_url || profile.photos?.[0] }}
                            style={styles.profileImage}
                        />
                        <View style={styles.editIcon}>
                             <Ionicons name="pencil" size={16} color="#FFF" />
                        </View>
                    </View>
                    
                    <Text style={styles.name}>{profile.full_name}, {age}</Text>
                    {profile.city && (
                        <Text style={styles.location}>
                             <Ionicons name="location-sharp" size={14} color={COLORS.textSecondary} /> {profile.city}
                        </Text>
                    )}
                </View>

                {/* Trust Score Section */}
                {trustScore && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trust Score</Text>
                        <LinearGradient
                             colors={[COLORS.glassSurface, 'rgba(0,0,0,0.5)']}
                             style={[styles.trustScoreCard, styles.cardBorder]}
                        >
                            <LinearGradient
                                colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                                style={styles.scoreCircle}
                            >
                                <Text style={styles.scoreText}>{trustScore.total_score}</Text>
                                <Text style={styles.scoreLabel}>/100</Text>
                            </LinearGradient>
                            <View style={styles.scoreDetails}>
                                <Text style={styles.verificationLevel}>
                                    {TrustScoreService.getBadgeLabel(trustScore.verification_level)}
                                </Text>
                                <TouchableOpacity style={styles.verifyButton}>
                                    <Text style={styles.verifyButtonText}>Increase Score →</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* Subscription Section */}
                {subscription && tierInfo && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Subscription</Text>
                        <View style={[glassStyles.glassCard]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={styles.tierName}>{tierInfo.name} Tier</Text>
                                    <Text style={styles.tierPrice}>{tierInfo.priceDisplay}</Text>
                                </View>
                                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
                            </View>
                            
                            {subscription.tier === 'free' && (
                                <GradientButton
                                    title="Upgrade Plan"
                                    onPress={() => {}}
                                    containerStyle={{ marginTop: 12 }}
                                />
                            )}
                        </View>
                    </View>
                )}

                {/* Bio Section */}
                {profile.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <View style={[glassStyles.glassCard]}>
                            <Text style={styles.bio}>{profile.bio}</Text>
                        </View>
                    </View>
                )}

                {/* Audio Prompt Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Voice Intro</Text>
                    <AudioPrompt 
                        isEditable={true}
                        audioUrl={null} // TODO: Link to real profile column
                        onRecordingComplete={(uri) => Alert.alert("Recorded!", "This would be uploaded to your profile.")}
                        onDelete={() => Alert.alert("Deleted", "Voice intro removed.")}
                    />
                </View>

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
                    <View style={[glassStyles.glassCard, { gap: 12 }]}>
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
                    <GradientButton 
                        title="Edit Profile" 
                        onPress={() => navigation.navigate('EditProfile')}
                        colors={[COLORS.backgroundSecondary, COLORS.backgroundSecondary]}
                        textStyle={{ color: COLORS.textPrimary }}
                        containerStyle={{ borderWidth: 1, borderColor: COLORS.glassBorder }}
                        icon={<Ionicons name="pencil" size={18} color={COLORS.textPrimary} style={{ marginRight: 8 }} />}
                    />
                    
                    <GradientButton 
                        title="Settings" 
                        onPress={() => navigation.navigate('Settings')}
                        colors={[COLORS.backgroundSecondary, COLORS.backgroundSecondary]}
                        textStyle={{ color: COLORS.textPrimary }}
                        containerStyle={{ borderWidth: 1, borderColor: COLORS.glassBorder }}
                        icon={<Ionicons name="settings-sharp" size={18} color={COLORS.textPrimary} style={{ marginRight: 8 }} />}
                    />

                    <TouchableOpacity style={[styles.logoutButton]} onPress={handleLogout}>
                        <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingBottom: 100, // Space for tab bar
        paddingHorizontal: 20,
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
    },
    emptyText: {
        fontSize: 18,
        color: COLORS.textSecondary,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: 24,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    editIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.backgroundSecondary,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        marginLeft: 4,
    },
    cardBorder: {
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    trustScoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: BORDER_RADIUS.lg,
    },
    scoreCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        ...SHADOWS.glow,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scoreLabel: {
        fontSize: 10,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    scoreDetails: {
        flex: 1,
    },
    verificationLevel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    verifyButton: {
        paddingVertical: 4,
    },
    verifyButtonText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    tierName: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    tierPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    bio: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: COLORS.glassSurface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    interestText: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    actionsSection: {
        gap: 16,
        marginBottom: 20,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    logoutButton: {
        padding: 16,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.nope,
        marginTop: 8,
    },
    logoutText: {
        color: COLORS.nope,
    },
});
