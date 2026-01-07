// Main App Component - Root of DesiDates with auth state management
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContainer } from './src/components/AuthContainer';
import { WelcomeView } from './src/components/WelcomeView';
import { supabase, SupabaseSession } from './src/config/supabase';
import { COLORS } from './src/constants/theme';

export default function App() {
    const [session, setSession] = useState<SupabaseSession>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    // Get username from user metadata
    const username = session?.user?.user_metadata?.username || 'User';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Vibrant Gradient Background: Deep Purple to Sunset Orange */}
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Conditional Rendering based on session state */}
                {!loading && (
                    <>
                        {session ? (
                            <WelcomeView username={username} />
                        ) : (
                            <AuthContainer />
                        )}
                    </>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
});
