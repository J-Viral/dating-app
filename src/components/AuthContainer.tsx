// AuthContainer Component - Sign Up and Login toggle with authentication logic
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { GlassInput } from './GlassInput';
import { supabase } from '../config/supabase';
import { AuthFormData, AuthMode } from '../types/auth';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';
import { BLUR_INTENSITY } from '../styles/glassmorphism';

export const AuthContainer: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: '',
        username: '',
    });
    const [loading, setLoading] = useState(false);

    const handleToggleMode = async () => {
        await Haptics.selectionAsync();
        setMode(mode === 'login' ? 'signup' : 'login');
        // Clear form when switching
        setFormData({ email: '', password: '', username: '' });
    };

    const validateForm = (): boolean => {
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }

        if (mode === 'signup' && !formData.username) {
            Alert.alert('Error', 'Please enter a username');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        // Password length check
        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }

        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                    },
                },
            });

            if (error) throw error;

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'Success!',
                'Account created successfully. Please check your email for verification.',
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Sign Up Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Login Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (mode === 'signup') {
            handleSignUp();
        } else {
            handleLogin();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cardContainer}>
                    <BlurView intensity={BLUR_INTENSITY} tint="light" style={styles.blurCard}>
                        {/* App Logo/Title */}
                        <Text style={styles.appName}>DesiDates</Text>
                        <Text style={styles.tagline}>Find Your Perfect Match</Text>

                        {/* Mode Toggle */}
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, mode === 'login' && styles.toggleButtonActive]}
                                onPress={mode === 'signup' ? handleToggleMode : undefined}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}
                                >
                                    Login
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, mode === 'signup' && styles.toggleButtonActive]}
                                onPress={mode === 'login' ? handleToggleMode : undefined}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}
                                >
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {mode === 'signup' && (
                                <GlassInput
                                    placeholder="Username"
                                    value={formData.username || ''}
                                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                                />
                            )}
                            <GlassInput
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                            <GlassInput
                                placeholder="Password"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                secureTextEntry
                                autoComplete="password"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <BlurView intensity={15} tint="light" style={styles.submitButtonBlur}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.glassText} />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {mode === 'login' ? 'Login' : 'Create Account'}
                                    </Text>
                                )}
                            </BlurView>
                        </TouchableOpacity>
                    </BlurView>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xxl,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.lg,
    },
    blurCard: {
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.xl,
        overflow: 'hidden',
    },
    appName: {
        ...TYPOGRAPHY.title,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    tagline: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.sm,
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(249, 115, 22, 0.3)',
    },
    toggleText: {
        ...TYPOGRAPHY.body,
        color: COLORS.glassPlaceholder,
    },
    toggleTextActive: {
        color: COLORS.glassText,
        fontWeight: '600',
    },
    formContainer: {
        marginBottom: SPACING.md,
    },
    submitButton: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    submitButtonBlur: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        overflow: 'hidden',
    },
    submitButtonText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.glassText,
    },
});
