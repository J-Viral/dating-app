// Main App Navigator with bottom tabs
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { COLORS } from '../constants/theme';

// Screens
import DiscoveryScreen from '../screens/DiscoveryScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: COLORS.backgroundSecondary,
                    borderTopColor: COLORS.borderColor,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                headerStyle: {
                    backgroundColor: COLORS.backgroundPrimary,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.borderColor,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Discovery"
                component={DiscoveryScreen}
                options={{
                    title: 'Discover',
                    tabBarLabel: 'Discover',
                }}
            />
            <Tab.Screen
                name="Matches"
                component={MatchesScreen}
                options={{
                    title: 'Matches',
                    tabBarLabel: 'Matches',
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ConversationsScreen}
                options={{
                    title: 'Messages',
                    tabBarLabel: 'Messages',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}
