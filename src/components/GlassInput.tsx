// GlassInput Component - Semi-transparent input with frosted glass effect
import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { glassStyles, BLUR_INTENSITY } from '../styles/glassmorphism';

interface GlassInputProps extends TextInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    ...props
}) => {
    return (
        <View style={styles.container}>
            <BlurView intensity={BLUR_INTENSITY} tint="dark" style={styles.blurContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.glassPlaceholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    {...props}
                />
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.md,
    },
    blurContainer: {
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: 16,
        color: COLORS.glassText,
        backgroundColor: 'transparent',
    },
});
