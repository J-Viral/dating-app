// Onboarding Flow Coordinator - manages flow between all onboarding screens
import React, { useState } from 'react';
import { View, StatusBar, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../config/supabase';
import { ProfileService } from '../../services/ProfileService';
import { TrustScoreService } from '../../services/TrustScoreService';
import { COLORS } from '../../constants/theme';

import WelcomeScreen from './WelcomeScreen';
import ProfileSetupScreen, { ProfileSetupData } from './ProfileSetupScreen';
import PhotoUploadScreen from './PhotoUploadScreen';
import BioInterestsScreen, { BioInterestsData } from './BioInterestsScreen';
import LocationScreen, { LocationData } from './LocationScreen';
import PreferencesScreen, { PreferencesData } from './PreferencesScreen';

export default function OnboardingFlowScreen() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data collection from each step
    const [profileData, setProfileData] = useState<ProfileSetupData | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [bioData, setBioData] = useState<BioInterestsData | null>(null);
    const [locationData, setLocationData] = useState<LocationData | null>(null);

    const handleWelcomeNext = () => {
        setCurrentStep(1);
    };

    const handleProfileSetup = (data: ProfileSetupData) => {
        setProfileData(data);
        setCurrentStep(2);
    };

    const handlePhotoUpload = (uploadedPhotos: string[]) => {
        setPhotos(uploadedPhotos);
        setCurrentStep(3);
    };

    const handleBioInterests = (data: BioInterestsData) => {
        setBioData(data);
        setCurrentStep(4);
    };

    const handleLocation = (data: LocationData) => {
        setLocationData(data);
        setCurrentStep(5);
    };

    const handleComplete = async (preferences: PreferencesData) => {
        if (!profileData || !bioData || !locationData) {
            Alert.alert('Error', 'Missing required profile data');
            return;
        }

        setLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Upload photos to Supabase Storage
            const uploadedPhotoUrls: string[] = [];
            for (const photoUri of photos) {
                const url = await ProfileService.uploadPhoto(user.id, photoUri);
                if (url) uploadedPhotoUrls.push(url);
            }

            // Create profile
            const profile = await ProfileService.createProfile(user.id, {
                full_name: profileData.fullName,
                date_of_birth: profileData.dateOfBirth,
                gender: profileData.gender,
                bio: bioData.bio,
                interests: bioData.interests,
                education: bioData.education,
                occupation: bioData.occupation,
                city: locationData.city,
                state: locationData.state,
                photos: uploadedPhotoUrls,
                profile_photo_url: uploadedPhotoUrls[0],
                looking_for: preferences.lookingFor,
                age_preference_min: preferences.ageMin,
                age_preference_max: preferences.ageMax,
                distance_preference_km: preferences.distanceKm,
                profile_completed: true,
            });

            if (!profile) {
                throw new Error('Failed to create profile');
            }

            // Update location if coordinates available
            if (locationData.latitude && locationData.longitude) {
                await ProfileService.updateLocation(
                    user.id,
                    locationData.latitude,
                    locationData.longitude,
                    locationData.city,
                    locationData.state
                );
            }

            // Update trust score - mark phone as verified (since they signed up with phone)
            await TrustScoreService.updatePhoneVerification(user.id, true);

            // Mark profile as complete
            const isComplete = ProfileService.isProfileComplete(profile);
            if (isComplete) {
                await TrustScoreService.updateProfileComplete(user.id, true);
            }

            // Success! The App.tsx will automatically navigate to main app
            // since profile_completed is now true
            
        } catch (error: any) {
            console.error('Onboarding error:', error);
            Alert.alert('Error', error.message || 'Failed to complete profile setup');
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundPrimary} />                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundPrimary} />
            {currentStep === 0 && <WelcomeScreen onNext={handleWelcomeNext} />}
            {currentStep === 1 && (
                <ProfileSetupScreen onNext={handleProfileSetup} onBack={handleBack} />
            )}
            {currentStep === 2 && (
                <PhotoUploadScreen onNext={handlePhotoUpload} onBack={handleBack} />
            )}
            {currentStep === 3 && (
                <BioInterestsScreen onNext={handleBioInterests} onBack={handleBack} />
            )}
            {currentStep === 4 && (
                <LocationScreen onNext={handleLocation} onBack={handleBack} />
            )}
            {currentStep === 5 && (
                <PreferencesScreen onComplete={handleComplete} onBack={handleBack} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
