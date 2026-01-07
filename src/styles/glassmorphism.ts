// Glassmorphism style utilities for React Native - Dark Theme
import { StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS } from '../constants/theme';

export const glassStyles = StyleSheet.create({
    // Glass card container - dark theme
    glassCard: {
        backgroundColor: COLORS.glassBackground,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.lg,
        ...SHADOWS.medium,
    },

    // Glass input field - dark theme
    glassInput: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)', // Darker input background
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: 16,
        color: COLORS.glassText,
        ...SHADOWS.subtle,
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
        ...SHADOWS.medium,
    },

    // Glass button with accent - blue theme
    glassButtonAccent: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
        ...SHADOWS.blue,
    },

    // Text styles
    glassButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.glassText,
    },
});

// Blur intensity constant
export const BLUR_INTENSITY = 20; // Increased for darker theme
