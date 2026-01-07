// WelcomeView Component - Displays welcome screen after successful authentication
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { glassStyles, BLUR_INTENSITY } from '../styles/glassmorphism';
import { supabase } from '../config/supabase';

interface WelcomeViewProps {
    username: string;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ username }) => {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Smooth entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Navigate to main app flow
        console.log('Get Started pressed');
    };

    const handleLogout = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await supabase.auth.signOut();
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <BlurView intensity={BLUR_INTENSITY} tint="light" style={styles.blurCard}>
                    <Text style={styles.emoji}>🎉</Text>
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.subtitle}>Ready to find your perfect match?</Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <BlurView intensity={15} tint="light" style={styles.buttonBlur}>
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                        </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>Logout</Text>
                    </TouchableOpacity>
                </BlurView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.lg,
    },
    blurCard: {
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.xxl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    emoji: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.title,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    username: {
        ...TYPOGRAPHY.heading,
        color: COLORS.accent,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.glassPlaceholder,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    primaryButton: {
        width: '100%',
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    buttonBlur: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        overflow: 'hidden',
    },
    primaryButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.glassText,
    },
    secondaryButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    secondaryButtonText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.glassPlaceholder,
    },
});
