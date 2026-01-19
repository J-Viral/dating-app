import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Platform,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { supabase } from '../config/supabase';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { glassStyles } from '../styles/glassmorphism';

export default function SettingsScreen() {
    const [distance, setDistance] = useState([50]);
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [isIncognito, setIsIncognito] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
                style: 'destructive',
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your matches and messages will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            await supabase.from('users_profile').delete().eq('id', user.id);
                            await supabase.auth.signOut();
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <ScreenBackground>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                
                {/* Discovery Section */}
                <View style={glassStyles.glassCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="compass" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Discovery</Text>
                    </View>
                    
                    <View style={styles.preferenceItem}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Maximum Distance</Text>
                            <Text style={styles.valueText}>{distance[0]} km</Text>
                        </View>
                        <MultiSlider
                            values={distance}
                            sliderLength={280}
                            onValuesChange={setDistance}
                            min={1}
                            max={100}
                            step={1}
                            selectedStyle={{ backgroundColor: COLORS.primary }}
                            unselectedStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            containerStyle={{ height: 40 }}
                            trackStyle={{ height: 4 }}
                            markerStyle={{ 
                                backgroundColor: COLORS.primary, 
                                height: 24, 
                                width: 24,
                                borderWidth: 2,
                                borderColor: '#FFF',
                                ...SHADOWS.glow 
                            }}
                        />
                    </View>

                    <View style={styles.preferenceItem}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Age Range</Text>
                            <Text style={styles.valueText}>{ageRange[0]} - {ageRange[1]}</Text>
                        </View>
                        <MultiSlider
                            values={ageRange}
                            sliderLength={280}
                            onValuesChange={setAgeRange}
                            min={18}
                            max={80}
                            step={1}
                            allowOverlap={false}
                            snapped
                            selectedStyle={{ backgroundColor: COLORS.primary }}
                            unselectedStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            containerStyle={{ height: 40 }}
                            trackStyle={{ height: 4 }}
                            markerStyle={{ 
                                backgroundColor: COLORS.primary, 
                                height: 24, 
                                width: 24,
                                borderWidth: 2,
                                borderColor: '#FFF',
                                ...SHADOWS.glow 
                            }}
                        />
                    </View>
                </View>

                {/* Privacy Section */}
                <View style={[glassStyles.glassCard, styles.section]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Privacy</Text>
                    </View>
                    
                    <View style={[styles.preferenceItem, styles.row]}>
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Incognito Mode</Text>
                            <Text style={styles.description}>Only people you liked can see you</Text>
                        </View>
                        <Switch
                            value={isIncognito}
                            onValueChange={setIsIncognito}
                            trackColor={{ false: '#767577', true: COLORS.primary }}
                            thumbColor={Platform.OS === 'ios' ? '#FFF' : '#f4f3f4'}
                        />
                    </View>

                    <View style={[styles.preferenceItem, styles.row]}>
                        <View style={styles.flex1}>
                            <Text style={styles.label}>Ghost Mode</Text>
                            <Text style={styles.description}>Hide your location while active</Text>
                        </View>
                        <Switch
                            value={isGhostMode}
                            onValueChange={setIsGhostMode}
                            trackColor={{ false: '#767577', true: COLORS.primary }}
                            thumbColor={Platform.OS === 'ios' ? '#FFF' : '#f4f3f4'} 
                        />
                    </View>
                </View>

                {/* Account Section */}
                <View style={[glassStyles.glassCard, styles.section]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-circle" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Account</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} />
                        <Text style={styles.actionButtonText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]} 
                        onPress={handleDeleteAccount}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                    <Text style={styles.versionText}>Made with ❤️ in DesiDates</Text>
                </View>

            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    preferenceItem: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    valueText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    flex1: {
        flex: 1,
        marginRight: 15,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    deleteButton: {
        borderColor: 'rgba(255, 90, 95, 0.3)',
        backgroundColor: 'rgba(255, 90, 95, 0.05)',
    },
    deleteButtonText: {
        color: '#FF5A5F',
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 20,
        opacity: 0.6,
    },
    versionText: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
});
