import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { useMutation } from '@apollo/client';
import * as Haptics from 'expo-haptics';
import { GlassInput } from './GlassInput';
import { UPDATE_PASSWORD_MUTATION } from '../graphql/mutations';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { BLUR_INTENSITY } from '../styles/glassmorphism';

interface ResetPasswordViewProps {
    onComplete: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD_MUTATION, {
        onCompleted: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Your password has been updated. Please log in with your new password.', [
                { text: 'OK', onPress: onComplete }
            ]);
        },
        onError: (error: any) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        }
    });

    const handleUpdate = () => {
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updatePassword({ variables: { password } });
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={BLUR_INTENSITY} tint="dark" style={styles.card}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter your new password below</Text>

                <GlassInput
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <GlassInput
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.textPrimary} />
                    ) : (
                        <Text style={styles.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onComplete}>
                    <Text style={styles.cancelText}>Back to Login</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        overflow: 'hidden',
    },
    title: {
        ...TYPOGRAPHY.heading,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        color: COLORS.textSecondary,
    },
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    buttonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    cancelButton: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    cancelText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textDecorationLine: 'underline',
    },
});
