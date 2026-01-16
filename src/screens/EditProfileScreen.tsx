import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import { supabase } from '../config/supabase';
import { ProfileService } from '../services/ProfileService';
import { UserProfile } from '../types/profile';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditProfileScreen() {
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
            const uploadUrl = await ProfileService.uploadPhoto(profile.id, result.assets[0].uri);
            if (uploadUrl) {
                const newPhotos = [...photos];
                if (index < newPhotos.length) {
                    newPhotos[index] = uploadUrl;
                } else {
                    newPhotos.push(uploadUrl);
                }
                setPhotos(newPhotos);
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
            Alert.alert('Success', 'Profile updated successfully');
        } else {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            enableOnAndroid={true}
        >
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photoGrid}>
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <TouchableOpacity 
                        key={idx} 
                        style={styles.photoBox}
                        onPress={() => handlePickImage(idx)}
                    >
                        {photos[idx] ? (
                            <>
                                <Image source={{ uri: photos[idx] }} style={styles.photo} />
                                <TouchableOpacity 
                                    style={styles.removeBtn}
                                    onPress={() => handleRemovePhoto(idx)}
                                >
                                    <Text style={styles.removeBtnText}>×</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={styles.addPhotoText}>+</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <TextInput
                    style={[styles.input, styles.bioInput]}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={bio}
                    onChangeText={setBio}
                />

                <Text style={styles.sectionTitle}>Occupation</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Graphic Designer, etc."
                    placeholderTextColor={COLORS.textSecondary}
                    value={occupation}
                    onChangeText={setOccupation}
                />

                <Text style={styles.sectionTitle}>Education</Text>
                <TextInput
                    style={styles.input}
                    placeholder="University of Mumbai, etc."
                    placeholderTextColor={COLORS.textSecondary}
                    value={education}
                    onChangeText={setEducation}
                />

                <Text style={styles.sectionTitle}>Height (cm)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="175"
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                    value={height}
                    onChangeText={setHeight}
                />
            </View>

            <TouchableOpacity 
                style={[styles.saveButton, saving && styles.disabledButton]} 
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    contentContainer: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundPrimary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 20,
        marginBottom: 10,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoBox: {
        width: '31%',
        aspectRatio: 0.8,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    addPhotoText: {
        fontSize: 32,
        color: COLORS.primary,
    },
    removeBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    inputSection: {
        marginTop: 10,
    },
    input: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 8,
        padding: 12,
        color: COLORS.textPrimary,
        fontSize: 16,
        marginBottom: 10,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
