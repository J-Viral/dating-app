// Preferences Screen - Dating preferences (final onboarding step)
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../constants/theme';

interface PreferencesScreenProps {
    onComplete: (data: PreferencesData) => void;
    onBack: () => void;
}

export interface PreferencesData {
    lookingFor: 'male' | 'female' | 'everyone';
    ageMin: number;
    ageMax: number;
    distanceKm: number;
}

export default function PreferencesScreen({ onComplete, onBack }: PreferencesScreenProps) {
    const [lookingFor, setLookingFor] = useState<'male' | 'female' | 'everyone' | ''>('');
    const [ageMin, setAgeMin] = useState(18);
    const [ageMax, setAgeMax] = useState(35);
    const [distanceKm, setDistanceKm] = useState(50);

    const handleComplete = () => {
        if (!lookingFor) {
            Alert.alert('Required', 'Please select who you\'re looking for');
            return;
        }

        if (ageMin >= ageMax) {
            Alert.alert('Invalid Range', 'Minimum age must be less than maximum age');
            return;
        }

        onComplete({
            lookingFor,
            ageMin,
            ageMax,
            distanceKm,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Your preferences</Text>
                <Text style={styles.subtitle}>
                    Tell us what you're looking for (you can change this later)
                </Text>

                {/* Looking For */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>I'm interested in</Text>
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                lookingFor === 'male' && styles.optionButtonActive
                            ]}
                            onPress={() => setLookingFor('male')}
                        >
                            <Text style={[
                                styles.optionText,
                                lookingFor === 'male' && styles.optionTextActive
                            ]}>Men</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                lookingFor === 'female' && styles.optionButtonActive
                            ]}
                            onPress={() => setLookingFor('female')}
                        >
                            <Text style={[
                                styles.optionText,
                                lookingFor === 'female' && styles.optionTextActive
                            ]}>Women</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                lookingFor === 'everyone' && styles.optionButtonActive
                            ]}
                            onPress={() => setLookingFor('everyone')}
                        >
                            <Text style={[
                                styles.optionText,
                                lookingFor === 'everyone' && styles.optionTextActive
                            ]}>Everyone</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Age Range */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Age range</Text>
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderValue}>{ageMin}</Text>
                            <Text style={styles.sliderLabel}>-</Text>
                            <Text style={styles.sliderValue}>{ageMax}</Text>
                            <Text style={styles.sliderLabel}>years</Text>
                        </View>
                        <View style={styles.sliderRow}>
                            <View style={styles.sliderWrapper}>
                                <Text style={styles.sliderLabel}>Min:</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={18}
                                    maximumValue={100}
                                    step={1}
                                    value={ageMin}
                                    onValueChange={setAgeMin}
                                    minimumTrackTintColor={COLORS.primary}
                                    maximumTrackTintColor={COLORS.backgroundSecondary}
                                    thumbTintColor={COLORS.primary}
                                />
                            </View>
                            <View style={styles.sliderWrapper}>
                                <Text style={styles.sliderLabel}>Max:</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={18}
                                    maximumValue={100}
                                    step={1}
                                    value={ageMax}
                                    onValueChange={setAgeMax}
                                    minimumTrackTintColor={COLORS.primary}
                                    maximumTrackTintColor={COLORS.backgroundSecondary}
                                    thumbTintColor={COLORS.primary}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Distance */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Maximum distance</Text>
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderValue}>{distanceKm} km</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={200}
                            step={1}
                            value={distanceKm}
                            onValueChange={setDistanceKm}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={COLORS.backgroundSecondary}
                            thumbTintColor={COLORS.primary}
                        />
                        <Text style={styles.hint}>
                            Show me people within {distanceKm} km of my location
                        </Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>✨ These are just your initial preferences</Text>
                    <Text style={styles.infoText}>
                        You can change these anytime in Settings
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                        <Text style={styles.completeButtonText}>Complete Setup</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.progressIndicator}>
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionButton: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionButtonActive: {
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    optionTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    sliderContainer: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
    },
    sliderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sliderValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    sliderLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    sliderRow: {
        gap: 12,
    },
    sliderWrapper: {
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    hint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    backButton: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    completeButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    progressIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.backgroundSecondary,
    },
    progressDotActive: {
        backgroundColor: COLORS.primary,
        width: 24,
    },
});
