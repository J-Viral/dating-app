// Bio & Interests Screen - About me and interests
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

interface BioInterestsScreenProps {
    onNext: (data: BioInterestsData) => void;
    onBack: () => void;
}

export interface BioInterestsData {
    bio: string;
    interests: string[];
    education?: string;
    occupation?: string;
}

const INTEREST_OPTIONS = [
    'Travel', 'Music', 'Movies', 'Reading', 'Sports', 'Fitness',
    'Cooking', 'Photography', 'Art', 'Gaming', 'Dancing', 'Yoga',
    'Meditation', 'Cricket', 'Football', 'Hiking', 'Cycling',
    'Foodie', 'Coffee', 'Tea', 'Chai', 'Bollywood', 'Fashion',
];

export default function BioInterestsScreen({ onNext, onBack }: BioInterestsScreenProps) {
    const [bio, setBio] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [education, setEducation] = useState('');
    const [occupation, setOccupation] = useState('');

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            if (selectedInterests.length < 10) {
                setSelectedInterests([...selectedInterests, interest]);
            }
        }
    };

    const handleNext = () => {
        if (!bio.trim()) {
            Alert.alert('Required', 'Please write a short bio about yourself');
            return;
        }

        if (bio.trim().length < 20) {
            Alert.alert('Too Short', 'Please write at least 20 characters in your bio');
            return;
        }

        if (selectedInterests.length < 3) {
            Alert.alert('More Interests', 'Please select at least 3 interests');
            return;
        }

        onNext({
            bio: bio.trim(),
            interests: selectedInterests,
            education: education.trim() || undefined,
            occupation: occupation.trim() || undefined,
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Tell us about yourself</Text>
                <Text style={styles.subtitle}>Help others get to know you better</Text>

                {/* Bio */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>About Me</Text>
                    <TextInput
                        style={styles.textArea}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Write a short bio... What makes you unique? What are you passionate about?"
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        maxLength={300}
                        textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{bio.length}/300</Text>
                </View>

                {/* Interests */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Interests (Select at least 3)</Text>
                    <Text style={styles.hint}>{selectedInterests.length}/10 selected</Text>
                    <View style={styles.interestsGrid}>
                        {INTEREST_OPTIONS.map((interest) => (
                            <TouchableOpacity
                                key={interest}
                                style={[
                                    styles.interestChip,
                                    selectedInterests.includes(interest) && styles.interestChipSelected
                                ]}
                                onPress={() => toggleInterest(interest)}
                            >
                                <Text style={[
                                    styles.interestText,
                                    selectedInterests.includes(interest) && styles.interestTextSelected
                                ]}>
                                    {interest}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Education (Optional) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Education <Text style={styles.optional}>(Optional)</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={education}
                        onChangeText={setEducation}
                        placeholder="e.g. MBA, B.Tech, Bachelor's"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </View>

                {/* Occupation (Optional) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Occupation <Text style={styles.optional}>(Optional)</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={occupation}
                        onChangeText={setOccupation}
                        placeholder="e.g. Software Engineer, Doctor, Entrepreneur"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </View>

                <View style={{ height: 20 }} />
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
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
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
    optional: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.textSecondary,
    },
    input: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    textArea: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.textPrimary,
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: 4,
    },
    hint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestChip: {
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    interestChipSelected: {
        backgroundColor: COLORS.backgroundSecondary,
        borderColor: COLORS.primary,
    },
    interestText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    interestTextSelected: {
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
