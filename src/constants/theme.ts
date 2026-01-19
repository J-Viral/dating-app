// Theme constants for DesiDates - Modern Purple/Pink Glassmorphism
// Inspired by the UI-0 artifacts (Deep Purple gradient, Glass cards, Vibrant accents)

export const COLORS = {
    // Background colors
    backgroundPrimary: '#120E16', // Very dark purple/black
    backgroundSecondary: '#1E1629', // Slightly lighter purple/black
    
    // Gradients (Start/End convention usually handled in components, but defining keys here)
    gradientPrimaryStart: '#D946EF', // Pink
    gradientPrimaryEnd: '#8B5CF6',   // Purple
    
    gradientSecondaryStart: '#3B82F6', // Blue
    gradientSecondaryEnd: '#06B6D4',   // Cyan

    gradientBackgroundStart: '#2E1065', // Deep Violet
    gradientBackgroundEnd: '#000000',   // Black

    // Glass component colors
    glassBackground: 'rgba(255, 255, 255, 0.08)', // Light, transparent white for glass effect
    glassBorder: 'rgba(224, 231, 255, 0.2)', // Subtle light border
    glassText: '#FFFFFF',
    glassPlaceholder: 'rgba(255, 255, 255, 0.5)',
    glassSurface: 'rgba(30, 27, 33, 0.7)', // Darker glass for cards

    // Accent colors
    primary: '#D946EF', // Main Pink
    secondary: '#8B5CF6', // Main Purple
    tertiary: '#F472B6', // Light Pink
    
    // Functional Colors
    like: '#EC4899', // Pink/Red for heart
    nope: '#EF4444', // Red for X
    superlike: '#8B5CF6', // Purple for Star/Lightning
    online: '#10B981', // Green dot

    // Status colors
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',

    // Text colors
    textPrimary: '#FFFFFF', 
    textSecondary: '#E5E7EB', // Gray-200
    textMuted: '#9CA3AF', // Gray-400
    textHighlight: '#D946EF', // Pink text
};

export const SHADOWS = {
    subtle: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    glow: { // For active elements
        shadowColor: '#D946EF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    tabBarHeight: 80,
};

export const TYPOGRAPHY = {
    titleLarge: {
        fontSize: 34,
        fontWeight: '700' as const,
        color: COLORS.textPrimary,
        letterSpacing: -1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    heading: {
        fontSize: 22,
        fontWeight: '600' as const,
        color: COLORS.textPrimary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: COLORS.textMuted,
    },
    small: {
        fontSize: 12,
        fontWeight: '500' as const,
        color: COLORS.textMuted,
    },
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
};
