import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { supabase } from '../config/supabase';
import { ProfileService } from '../services/ProfileService';
import { UserProfile } from '../types/profile';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { glassStyles } from '../styles/glassmorphism';
import { GradientButton } from '../components/ui/GradientButton';

export default function EditProfileScreen({ navigation }: any) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bio, setBio] = useState('');
    const [occupation, setOccupation] = useState('');
    const [education, setEducation] = useState('');
    const [height, setHeight] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const userProfile = await ProfileService.getProfile(user.id);
            if (userProfile) {
                setProfile(userProfile);
                setBio(userProfile.bio || '');
                setOccupation(userProfile.occupation || '');
                setEducation(userProfile.education || '');
                setHeight(userProfile.height_cm?.toString() || '');
                setPhotos(userProfile.photos || []);
            }
        }
        setLoading(false);
    };

    const handlePickImage = async (index: number) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri && profile) {
            // Optimistic update for better UX
            const localUri = result.assets[0].uri;
            const newPhotos = [...photos];
            if (index < newPhotos.length) {
                newPhotos[index] = localUri;
            } else {
                newPhotos.push(localUri);
            }
            setPhotos(newPhotos);

            // Upload in background
            const uploadUrl = await ProfileService.uploadPhoto(profile.id, localUri);
            if (uploadUrl) {
                // Confirm with server URL
                const confirmedPhotos = [...photos];
                if (index < confirmedPhotos.length) {
                    confirmedPhotos[index] = uploadUrl;
                } else {
                    confirmedPhotos.push(uploadUrl);
                }
                setPhotos(confirmedPhotos);
            }
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);

        const updates = {
            bio,
            occupation,
            education,
            height_cm: height ? parseInt(height) : undefined,
            photos,
            profile_photo_url: photos[0] || undefined,
        };

        const success = await ProfileService.updateProfile(profile.id, updates);
        setSaving(false);

        if (success) {
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <ScreenBackground style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </ScreenBackground>
        );
    }

    return (
        <ScreenBackground>
            <KeyboardAwareScrollView 
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
            >
                {/* Photos Section */}
                <View style={[styles.section, glassStyles.glassCard]}>
                    <Text style={styles.sectionTitle}>
                         <Ionicons name="images" size={18} color={COLORS.primary} />  My Photos
                    </Text>
                    <Text style={styles.sectionSubtitle}>Add at least 2 photos to stand out</Text>
                    
                    <View style={styles.photoGrid}>
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={[styles.photoBox, !photos[idx] && styles.photoBoxEmpty]}
                                onPress={() => handlePickImage(idx)}
                            >
                                {photos[idx] ? (
                                    <>
                                        <Image source={{ uri: photos[idx] }} style={styles.photo} />
                                        <TouchableOpacity 
                                            style={styles.removeBtn}
                                            onPress={() => handleRemovePhoto(idx)}
                                        >
                                            <Ionicons name="close" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                        {idx === 0 && (
                                            <View style={styles.mainBadge}>
                                                <Text style={styles.mainBadgeText}>Main</Text>
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <Ionicons name="add" size={32} color={COLORS.textMuted} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Details Section */}
                <View style={[styles.section, glassStyles.glassCard]}>
                    <Text style={styles.sectionTitle}>
                         <Ionicons name="person" size={18} color={COLORS.primary} />  About Me
                    </Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us about your interests, hobbies..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={bio}
                            onChangeText={setBio}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Job Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Software Engineer"
                                placeholderTextColor={COLORS.textSecondary}
                                value={occupation}
                                onChangeText={setOccupation}
                            />
                        </View>
                        <View style={[styles.inputGroup, { width: 100 }]}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="175"
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.textSecondary}
                                value={height}
                                onChangeText={setHeight}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Education</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="University / College"
                            placeholderTextColor={COLORS.textSecondary}
                            value={education}
                            onChangeText={setEducation}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <GradientButton 
                        title={saving ? "Saving Changes..." : "Save Profile"}
                        onPress={handleSave}
                        disabled={saving}
                        icon="checkmark-circle"
                    />
                     <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={saving}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                     </TouchableOpacity>
                </View>

            </KeyboardAwareScrollView>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoBox: {
        width: '31%',
        aspectRatio: 0.8,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.subtle,
    },
    photoBoxEmpty: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1.5,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: COLORS.error,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    mainBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        alignItems: 'center',
    },
    mainBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: BORDER_RADIUS.lg,
        padding: 14,
        color: COLORS.textPrimary,
        fontSize: 16,
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    footer: {
        marginTop: 10,
        gap: 16,
    },
    cancelButton: {
        alignItems: 'center',
        padding: 12,
    },
    cancelButtonText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
});
