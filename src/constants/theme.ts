// Theme constants for DesiDates - Dark AuthKit-inspired design

export const COLORS = {
    // Background colors: Dark navy/black theme
    backgroundPrimary: '#0A0E1A', // Very dark navy
    backgroundSecondary: '#111827', // Slightly lighter navy
    backgroundTertiary: '#1F2937', // Card backgrounds

    // Glass component colors - darker tones
    glassBackground: 'rgba(31, 41, 55, 0.5)', // Dark blue with medium opacity
    glassBorder: 'rgba(59, 130, 246, 0.2)', // Subtle light blue border
    glassText: '#F9FAFB', // Almost white
    glassPlaceholder: 'rgba(156, 163, 175, 0.7)', // Gray placeholder

    // Accent colors - Light blue instead of orange
    accent: '#3B82F6', // Bright blue
    accentHover: '#2563EB', // Darker blue for hover
    accentLight: 'rgba(59, 130, 246, 0.1)', // Light blue background

    // Status colors
    error: '#EF4444',
    success: '#10B981',

    // Text colors
    textPrimary: '#F9FAFB', // Almost white
    textSecondary: '#9CA3AF', // Gray
    textMuted: '#6B7280', // Darker gray
};

export const SHADOWS = {
    subtle: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    blue: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
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
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    heading: {
        fontSize: 24,
        fontWeight: '600' as const,
        color: COLORS.textPrimary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: COLORS.textPrimary,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: COLORS.textSecondary,
    },
    small: {
        fontSize: 12,
        fontWeight: '400' as const,
        color: COLORS.textMuted,
    },
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};
