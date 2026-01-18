// Profile Setup Screen - Basic profile information
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { COLORS } from '../../constants/theme';

interface ProfileSetupScreenProps {
    onNext: (data: ProfileSetupData) => void;
    onBack: () => void;
}

export interface ProfileSetupData {
    fullName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
}

export default function ProfileSetupScreen({ onNext, onBack }: ProfileSetupScreenProps) {
    const [fullName, setFullName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

    const handleNext = () => {
        // Validation
        if (!fullName.trim()) {
            Alert.alert('Required', 'Please enter your full name');
            return;
        }

        if (!day || !month || !year) {
            Alert.alert('Required', 'Please enter your complete date of birth');
            return;
        }

        // Validate date
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        if (dayNum < 1 || dayNum > 31) {
            Alert.alert('Invalid Date', 'Please enter a valid day (1-31)');
            return;
        }

        if (monthNum < 1 || monthNum > 12) {
            Alert.alert('Invalid Date', 'Please enter a valid month (1-12)');
            return;
        }

        const currentYear = new Date().getFullYear();
        const age = currentYear - yearNum;

        if (age < 18) {
            Alert.alert('Age Requirement', 'You must be at least 18 years old to use DesiDates');
            return;
        }

        if (age > 100 || yearNum < 1900) {
            Alert.alert('Invalid Date', 'Please enter a valid year');
            return;
        }

        if (!gender) {
            Alert.alert('Required', 'Please select your gender');
            return;
        }

        // Format date as YYYY-MM-DD
        const dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        onNext({
            fullName: fullName.trim(),
            dateOfBirth,
            gender,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Let's start with the basics</Text>
                <Text style={styles.subtitle}>This information will be visible on your profile</Text>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor={COLORS.textSecondary}
                        autoCapitalize="words"
                    />
                </View>

                {/* Date of Birth */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <View style={styles.dateRow}>
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            value={day}
                            onChangeText={setDay}
                            placeholder="DD"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            value={month}
                            onChangeText={setMonth}
                            placeholder="MM"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                        <TextInput
                            style={[styles.input, styles.dateInput, { flex: 1.5 }]}
                            value={year}
                            onChangeText={setYear}
                            placeholder="YYYY"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="number-pad"
                            maxLength={4}
                        />
                    </View>
                    <Text style={styles.hint}>You must be 18 or older to use DesiDates</Text>
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={[styles.optionButton, gender === 'male' && styles.optionButtonActive]}
                            onPress={() => setGender('male')}
                        >
                            <Text style={[styles.optionText, gender === 'male' && styles.optionTextActive]}>
                                Male
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionButton, gender === 'female' && styles.optionButtonActive]}
                            onPress={() => setGender('female')}
                        >
                            <Text style={[styles.optionText, gender === 'female' && styles.optionTextActive]}>
                                Female
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionButton, gender === 'other' && styles.optionButtonActive]}
                            onPress={() => setGender('other')}
                        >
                            <Text style={[styles.optionText, gender === 'other' && styles.optionTextActive]}>
                                Other
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

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
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
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
    inputGroup: {
        marginBottom: 24,
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
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInput: {
        flex: 1,
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
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
        backgroundColor: COLORS.backgroundSecondary,
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
