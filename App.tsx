// Main App Component - Root of DesiDates with auth state management
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { client } from './src/graphql/client';
import { AuthContainer } from './src/components/AuthContainer';
import { WelcomeView } from './src/components/WelcomeView';
import { ResetPasswordView } from './src/components/ResetPasswordView';
import { supabase, SupabaseSession } from './src/config/supabase';
import { COLORS } from './src/constants/theme';
import * as Linking from 'expo-linking';

export default function App() {
    const [session, setSession] = useState<SupabaseSession>(null);
    const [loading, setLoading] = useState(true);
    const [resetPasswordMode, setResetPasswordMode] = useState(false);

    useEffect(() => {
        // Check for existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);

            // If we get a PASSWORD_RECOVERY event, switch to reset password mode
            if (event === 'PASSWORD_RECOVERY') {
                setResetPasswordMode(true);
            }
        });

        // Handle deep links (for password reset)
        const handleDeepLink = (event: { url: string }) => {
            const { queryParams } = Linking.parse(event.url);
            if (queryParams?.type === 'recovery') {
                setResetPasswordMode(true);
            }
        };

        const subscription_link = Linking.addEventListener('url', handleDeepLink);

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
            subscription_link.remove();
        };
    }, []);

    // Get username from user metadata
    const username = session?.user?.user_metadata?.username || 'User';

    const renderContent = () => {
        if (loading) return null;

        if (resetPasswordMode) {
            return <ResetPasswordView onComplete={() => setResetPasswordMode(false)} />;
        }

        if (session) {
            return <WelcomeView username={username} />;
        }

        return <AuthContainer />;
    };

    return (
        <ApolloProvider client={client}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundPrimary} />

                {/* Dark Navy Background - AuthKit inspired */}
                <View style={styles.darkBackground}>
                    {renderContent()}
                </View>
            </View>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    darkBackground: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
});
