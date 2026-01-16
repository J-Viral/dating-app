// Location Screen - Request location permissions
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/theme';

interface LocationScreenProps {
    onNext: (data: LocationData) => void;
    onBack: () => void;
}

export interface LocationData {
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
}

export default function LocationScreen({ onNext, onBack }: LocationScreenProps) {
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);

    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'We need location access to find matches near you. You can also enter your city manually.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Reverse geocode to get city/state
            const geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (geocode && geocode.length > 0) {
                const address = geocode[0];
                setCity(address.city || address.district || '');
                setState(address.region || address.country || '');

                // Save coordinates for future use
                onNext({
                    city: address.city || address.district || '',
                    state: address.region || address.country || '',
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Could not get your location. Please enter manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!city.trim()) {
            Alert.alert('Required', 'Please enter your city');
            return;
        }

        if (!state.trim()) {
            Alert.alert('Required', 'Please enter your state');
            return;
        }

        onNext({
            city: city.trim(),
            state: state.trim(),
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Where are you located?</Text>
                <Text style={styles.subtitle}>
                    We'll use this to show you matches nearby
                </Text>

                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.locationIcon}>📍</Text>
                            <Text style={styles.locationButtonText}>Use Current Location</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or enter manually</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                        placeholder="e.g. Mumbai, Bangalore, Delhi"
                        placeholderTextColor={COLORS.textSecondary}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                        style={styles.input}
                        value={state}
                        onChangeText={setState}
                        placeholder="e.g. Maharashtra, Karnataka, Delhi"
                        placeholderTextColor={COLORS.textSecondary}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        🔒 Your exact location is never shared. We only show your city and approximate distance to potential matches.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.progressIndicator}>
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
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
    },
    locationButton: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    locationIcon: {
        fontSize: 24,
    },
    locationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderColor,
    },
    dividerText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    infoBox: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
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
    nextButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
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
