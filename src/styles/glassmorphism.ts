// Glassmorphism style utilities for React Native - Dark Theme
import { StyleSheet, Platform } from 'react-native';
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
        overflow: 'hidden', // Ensure blur doesn't leak if using ImageBackground parent
    },

    // Glass input field - dark theme
    glassInput: {
        backgroundColor: COLORS.glassSurface, // Darker background for inputs
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
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },

    // Active/Accent button (e.g. for primary actions)
    glassButtonAccent: {
        backgroundColor: 'rgba(217, 70, 239, 0.2)', // Pinkish glass
        borderColor: COLORS.primary,
        borderWidth: 1,
        ...SHADOWS.glow,
    },

    // Text styles
    glassButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.glassText,
    },
});

// Blur intensity constant
export const BLUR_INTENSITY = Platform.select({ ios: 30, android: 100 }); // High blur for iOS
