// AuthContainer Component - Sign Up and Login toggle with authentication logic
import React, { useState } from "react";
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
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useMutation } from '@apollo/client';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Linking from "expo-linking";

import { GlassInput } from "./GlassInput";
import {
  SIGN_IN_MUTATION,
  SIGN_UP_MUTATION,
  FORGOT_PASSWORD_MUTATION,
  SIGN_IN_WITH_GOOGLE_MUTATION,
} from "../graphql/mutations";
import { AuthFormData, AuthMode } from "../types/auth";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";
import { BLUR_INTENSITY } from "../styles/glassmorphism";

WebBrowser.maybeCompleteAuthSession();

export const AuthContainer: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    username: "",
  });

  // GraphQL Mutations
  const [signIn, { loading: loginLoading }] = useMutation(SIGN_IN_MUTATION);
  const [signUp, { loading: signupLoading }] = useMutation(SIGN_UP_MUTATION);
  const [forgotPassword, { loading: forgotLoading }] = useMutation(
    FORGOT_PASSWORD_MUTATION
  );
  const [signInWithGoogle, { loading: googleLoading }] = useMutation(
    SIGN_IN_WITH_GOOGLE_MUTATION
  );

  const loading =
    loginLoading || signupLoading || forgotLoading || googleLoading;

  const handleToggleMode = async () => {
    await Haptics.selectionAsync();
    if (forgotPasswordMode) {
      setForgotPasswordMode(false);
    } else {
      setMode(mode === "login" ? "signup" : "login");
    }
    setFormData({ email: "", password: "", username: "" });
  };

  const validateForm = (): boolean => {
    if (!formData.email) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }

    if (!forgotPasswordMode) {
      if (!formData.password) {
        Alert.alert("Error", "Please enter your password");
        return false;
      }

      if (mode === "signup" && !formData.username) {
        Alert.alert("Error", "Please enter a username");
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (forgotPasswordMode) {
        await forgotPassword({
          variables: {
            email: formData.email,
            redirectTo: Linking.createURL("reset-password", {
              queryParams: { type: "recovery" },
            }),
          },
        });
        Alert.alert("Success", "Password reset link sent to your email.");
        setForgotPasswordMode(false);
      } else if (mode === "login") {
        await signIn({
          variables: { email: formData.email, password: formData.password },
        });
      } else {
        await signUp({
          variables: {
            email: formData.email,
            password: formData.password,
            username: formData.username,
          },
        });
        Alert.alert(
          "Check Email",
          "Please verify your email to complete sign up."
        );
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Auth Error", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signInWithGoogle({
        variables: {
          redirectTo: Linking.createURL("google-auth"),
        },
      });
    } catch (error: any) {
      Alert.alert("Google Auth Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={styles.blurCard}
          >
            <Text style={styles.appName}>DesiDates</Text>
            <Text style={styles.tagline}>
              {forgotPasswordMode
                ? "Reset your password"
                : "Find Your Perfect Match"}
            </Text>

            {!forgotPasswordMode && (
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    mode === "login" && styles.toggleButtonActive,
                  ]}
                  onPress={mode === "signup" ? handleToggleMode : undefined}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "login" && styles.toggleTextActive,
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    mode === "signup" && styles.toggleButtonActive,
                  ]}
                  onPress={mode === "login" ? handleToggleMode : undefined}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      mode === "signup" && styles.toggleTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formContainer}>
              {mode === "signup" && !forgotPasswordMode && (
                <GlassInput
                  placeholder="Username"
                  value={formData.username || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                />
              )}
              <GlassInput
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {!forgotPasswordMode && (
                <GlassInput
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry
                />
              )}
            </View>

            {mode === "login" && !forgotPasswordMode && (
              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => setForgotPasswordMode(true)}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <View style={styles.submitButtonInner}>
                {loading && !googleLoading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {forgotPasswordMode
                      ? "Send Reset Link"
                      : mode === "login"
                        ? "Login"
                        : "Create Account"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {!forgotPasswordMode && (
              <>
                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.line} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <View style={styles.googleButtonInner}>
                    {googleLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}

            {forgotPasswordMode && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setForgotPasswordMode(false)}
              >
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  blurCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.xl,
    overflow: "hidden",
  },
  appName: {
    ...TYPOGRAPHY.title,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  tagline: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    marginBottom: SPACING.xl,
    color: COLORS.textSecondary,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: BORDER_RADIUS.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accentLight,
  },
  toggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  formContainer: { marginBottom: SPACING.md },
  forgotLink: { alignSelf: "flex-end", marginBottom: SPACING.lg },
  forgotText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: "500",
  },
  submitButton: {
    width: "100%",
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accent,
    overflow: "hidden",
  },
  submitButtonInner: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  submitButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  orText: {
    marginHorizontal: SPACING.md,
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  googleButton: {
    width: "100%",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  googleButtonInner: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  googleButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  backButton: { marginTop: SPACING.lg, alignItems: "center" },
  backText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
});