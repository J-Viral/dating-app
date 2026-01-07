// Glassmorphism style utilities for React Native
import { StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';

export const glassStyles = StyleSheet.create({
    // Glass card container
    glassCard: {
        backgroundColor: COLORS.glassBackground,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.lg,
        ...SHADOWS.glow,
    },

    // Glass input field
    glassInput: {
        backgroundColor: COLORS.glassBackground,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: 16,
        color: COLORS.glassText,
        ...SHADOWS.soft,
    },

    // Glass button
    glassButton: {
        backgroundColor: COLORS.glassBackground,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.glow,
    },

    // Glass button with accent
    glassButtonAccent: {
        backgroundColor: 'rgba(249, 115, 22, 0.2)', // Sunset Orange with transparency
        borderColor: COLORS.accent,
    },

    // Text styles
    glassButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.glassText,
    },
});

// Blur intensity constant
export const BLUR_INTENSITY = 10;
