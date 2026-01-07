// Theme constants for DesiDates glassmorphism design

export const COLORS = {
    // Gradient colors: Deep Purple to Sunset Orange
    gradientStart: '#6B46C1', // Deep Purple
    gradientMiddle: '#9333EA', // Rich Purple
    gradientEnd: '#F97316', // Sunset Orange

    // Glass component colors
    glassBackground: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassText: '#FFFFFF',
    glassPlaceholder: 'rgba(255, 255, 255, 0.5)',

    // Accent colors
    accent: '#F97316',
    error: '#EF4444',
    success: '#10B981',
};

export const SHADOWS = {
    glow: {
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    soft: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    title: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: COLORS.glassText,
    },
    heading: {
        fontSize: 24,
        fontWeight: '600' as const,
        color: COLORS.glassText,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: COLORS.glassText,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: COLORS.glassPlaceholder,
    },
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
};
