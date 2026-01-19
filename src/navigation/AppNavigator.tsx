// Main App Navigator with bottom tabs
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

// Screens
import DiscoveryScreen from '../screens/DiscoveryScreen';
import MatchesScreen from '../screens/MatchesScreen';
import DateIdeasScreen from '../screens/DateIdeasScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarBackground = () => {
    return (
        <BlurView
            intensity={Platform.select({ ios: 40, android: 100 })}
            tint="dark"
            style={StyleSheet.absoluteFill}
        />
    );
};

export function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => <TabBarBackground />,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Discovery') {
                        iconName = focused ? 'card' : 'card-outline';
                    } else if (route.name === 'Matches') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'DateIdeas') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'ellipse';
                    }

                    return (
                        <View style={[
                            styles.iconContainer,
                            focused && styles.iconContainerFocused
                        ]}>
                            <Ionicons name={iconName} size={24} color={color} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    );
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                headerTransparent: true,
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 20,
                },
                headerBackground: () => (
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                ),
            })}
        >
            <Tab.Screen
                name="Discovery"
                component={DiscoveryScreen}
                options={{
                    title: 'Discover',
                }}
            />
            <Tab.Screen
                name="Matches"
                component={MatchesScreen}
                options={{
                    title: 'Your Matches',
                }}
            />
            <Tab.Screen
                name="DateIdeas"
                component={DateIdeasScreen}
                options={{
                    title: 'Date Ideas',
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ConversationsScreen}
                options={{
                    title: 'Messages',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'My Profile',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 32,
        borderTopWidth: 0,
        backgroundColor: 'transparent', // Important for BlurView
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.medium,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        top: Platform.OS === 'ios' ? 12 : 0, 
    },
    iconContainerFocused: {
        // transform: [{ scale: 1.1 }], // Simple animation via style if reanimated not used here
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        marginTop: 4,
    },
});
