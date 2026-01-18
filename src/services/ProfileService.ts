// Profile Service - handles all profile-related operations
import { supabase } from '../config/supabase';
import { UserProfile, ProfileUpdateData, TrustScore } from '../types/profile';

export class ProfileService {
    /**
     * Create a new user profile after authentication
     */
    static async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('users_profile')
                .insert({
                    id: userId,
                    ...profileData,
                })
                .select()
                .single();

            if (error) throw error;

            // Also create initial trust score
            await this.initializeTrustScore(userId);

            return data;
        } catch (error) {
            console.error('Error creating profile:', error);
            return null;
        }
    }

    /**
     * Get user profile by ID
     */
    static async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('users_profile')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, updates: ProfileUpdateData): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('users_profile')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }

    /**
     * Upload profile photo
     */
    static async uploadPhoto(userId: string, photoUri: string): Promise<string | null> {
        try {
            // Convert photo URI to blob
            const response = await fetch(photoUri);
            const blob = await response.blob();

            const fileName = `${userId}_${Date.now()}.jpg`;
            const filePath = `profiles/${userId}/${fileName}`;

            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Error uploading photo:', error);
            return null;
        }
    }

    /**
     * Add photo to profile photos array
     */
    static async addPhotoToProfile(userId: string, photoUrl: string): Promise<boolean> {
        try {
            const profile = await this.getProfile(userId);
            if (!profile) return false;

            const photos = profile.photos || [];
            photos.push(photoUrl);

            // If this is the first photo, also set as profile photo
            const updates: any = { photos };
            if (!profile.profile_photo_url) {
                updates.profile_photo_url = photoUrl;
            }

            return await this.updateProfile(userId, updates);
        } catch (error) {
            console.error('Error adding photo:', error);
            return false;
        }
    }

    /**
     * Update user location
     */
    static async updateLocation(
        userId: string,
        latitude: number,
        longitude: number,
        city?: string,
        state?: string
    ): Promise<boolean> {
        try {
            // PostGIS point format: POINT(longitude latitude)
            const { error } = await supabase.rpc('update_user_location', {
                user_uuid: userId,
                lat: latitude,
                lng: longitude,
                user_city: city,
                user_state: state,
            });

            if (error) {
                // If RPC doesn't exist, do manual update
                const { error: updateError } = await supabase
                    .from('users_profile')
                    .update({
                        city,
                        state,
                        // location will be set via PostGIS function if available
                    })
                    .eq('id', userId);

                if (updateError) throw updateError;
            }

            return true;
        } catch (error) {
            console.error('Error updating location:', error);
            return false;
        }
    }

    /**
     * Initialize trust score for new user
     */
    static async initializeTrustScore(userId: string): Promise<void> {
        try {
            await supabase.from('trust_scores').insert({
                user_id: userId,
                total_score: 0,
                verification_level: 'L0',
            });
        } catch (error) {
            console.error('Error initializing trust score:', error);
        }
    }

    /**
     * Get user trust score
     */
    static async getTrustScore(userId: string): Promise<TrustScore | null> {
        try {
            const { data, error } = await supabase
                .from('trust_scores')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching trust score:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('Error fetching trust score:', error);
            return null;
        }
    }

    /**
     * Check if profile is complete
     */
    static isProfileComplete(profile: UserProfile): boolean {
        const complete = !!(
            profile.full_name &&
            profile.date_of_birth &&
            profile.gender &&
            profile.bio &&
            profile.photos &&
            profile.photos.length >= 2 &&
            profile.city &&
            profile.interests &&
            profile.interests.length > 0
        );
        // Explicitly return boolean to avoid any type coercion issues
        return Boolean(complete);
    }

    /**
     * Update last active timestamp
     */
    static async updateLastActive(userId: string): Promise<void> {
        try {
            await supabase
                .from('users_profile')
                .update({ last_active_at: new Date().toISOString() })
                .eq('id', userId);
        } catch (error) {
            console.error('Error updating last active:', error);
        }
    }
}
