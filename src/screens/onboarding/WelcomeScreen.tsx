// Welcome Screen - First screen in onboarding flow
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/theme';

interface WelcomeScreenProps {
    onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.emoji}>💘</Text>
                <Text style={styles.title}>Welcome to DesiDates</Text>
                <Text style={styles.subtitle}>
                    Find meaningful connections with verified profiles
                </Text>

                <View style={styles.featuresContainer}>
                    <FeatureItem icon="✓" text="Verified Trust Scores" />
                    <FeatureItem icon="🔒" text="Safe & Private" />
                    <FeatureItem icon="🎯" text="Smart Matching" />
                    <FeatureItem icon="💬" text="Real-time Chat" />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={onNext}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>
                    Let's set up your profile in just a few steps
                </Text>
            </View>
        </View>
    );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    featuresContainer: {
        width: '100%',
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    featureText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footerText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
