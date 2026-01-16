import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS } from '../constants/theme';
import { supabase } from '../config/supabase';

export default function SettingsScreen() {
    const [distance, setDistance] = useState(50);
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
                        // In production, also delete from Supabase user auth
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
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Discovery Preferences</Text>
                
                <View style={styles.preferenceItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Maximum Distance</Text>
                        <Text style={styles.valueText}>{distance} km</Text>
                    </View>
                    <MultiSlider
                        values={[distance]}
                        sliderLength={300}
                        onValuesChange={(vals) => setDistance(vals[0])}
                        min={1}
                        max={100}
                        step={1}
                        selectedStyle={{ backgroundColor: COLORS.primary }}
                        markerStyle={{ backgroundColor: COLORS.primary, height: 20, width: 20 }}
                    />
                </View>

                <View style={styles.preferenceItem}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Age Range</Text>
                        <Text style={styles.valueText}>{ageRange[0]} - {ageRange[1]}</Text>
                    </View>
                    <MultiSlider
                        values={[ageRange[0], ageRange[1]]}
                        sliderLength={300}
                        onValuesChange={setAgeRange}
                        min={18}
                        max={80}
                        step={1}
                        allowOverlap={false}
                        snapped
                        selectedStyle={{ backgroundColor: COLORS.primary }}
                        markerStyle={{ backgroundColor: COLORS.primary, height: 20, width: 20 }}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                
                <View style={[styles.preferenceItem, styles.row]}>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>Incognito Mode</Text>
                        <Text style={styles.description}>Only people you liked can see you</Text>
                    </View>
                    <Switch
                        value={isIncognito}
                        onValueChange={setIsIncognito}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
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
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                    <Text style={styles.actionButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    preferenceItem: {
        marginBottom: 25,
        backgroundColor: COLORS.backgroundSecondary,
        padding: 15,
        borderRadius: 12,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    },
    flex1: {
        flex: 1,
        marginRight: 15,
    },
    description: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    actionButton: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    deleteButton: {
        borderColor: '#FF5A5F',
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    deleteButtonText: {
        color: '#FF5A5F',
    },
});
