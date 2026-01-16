import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/client';
import { client } from './src/graphql/client';
import { AuthContainer } from './src/components/AuthContainer';
import { MainTabNavigator } from './src/navigation/AppNavigator';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingFlowScreen from './src/screens/onboarding/OnboardingFlowScreen';
import { supabase, SupabaseSession } from './src/config/supabase';
import { ProfileService } from './src/services/ProfileService';
import { COLORS } from './src/constants/theme';

import { MainStackParamList } from './src/navigation/types';

const Stack = createStackNavigator<any>();

export default function App() {
    const [session, setSession] = useState<SupabaseSession>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [profileComplete, setProfileComplete] = useState<boolean>(false);

    useEffect(() => {
        // Check for existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                checkProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session?.user) {
                checkProfile(session.user.id);
            } else {
                setLoading(false);
                setProfileComplete(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkProfile = async (userId: string) => {
        setLoading(true);
        const profile = await ProfileService.getProfile(userId);
        
        if (profile) {
            const isComplete = ProfileService.isProfileComplete(profile);
            // Ensure it's definitely a boolean
            setProfileComplete(Boolean(isComplete));
        } else {
            setProfileComplete(false);
        }
        
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundPrimary} />
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ApolloProvider client={client}>
            <NavigationContainer>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundPrimary} />
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: COLORS.backgroundPrimary },
                    }}
                >
                    {!session ? (
                        // Not logged in - show auth screens
                        <Stack.Screen name="Auth" component={AuthContainer} />
                    ) : !profileComplete ? (
                        // Logged in but profile incomplete - show onboarding
                        <Stack.Screen name="Onboarding" component={OnboardingFlowScreen} />
                    ) : (
                        // Logged in and profile complete - show main app
                        <>
                            <Stack.Screen name="MainApp" component={MainTabNavigator} />
                            <Stack.Screen 
                                name="ChatRoom" 
                                component={ChatRoomScreen}
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen 
                                name="EditProfile" 
                                component={EditProfileScreen}
                                options={{ 
                                    headerShown: true,
                                    title: 'Edit Profile',
                                    headerStyle: { backgroundColor: COLORS.backgroundPrimary },
                                    headerTintColor: COLORS.textPrimary,
                                }}
                            />
                            <Stack.Screen 
                                name="Settings" 
                                component={SettingsScreen}
                                options={{ 
                                    headerShown: true,
                                    title: 'Settings',
                                    headerStyle: { backgroundColor: COLORS.backgroundPrimary },
                                    headerTintColor: COLORS.textPrimary,
                                }}
                            />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
