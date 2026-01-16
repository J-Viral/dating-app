// Photo Upload Screen - Profile photos
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';

interface PhotoUploadScreenProps {
    onNext: (photos: string[]) => void;
    onBack: () => void;
}

export default function PhotoUploadScreen({ onNext, onBack }: PhotoUploadScreenProps) {
    const [photos, setPhotos] = useState<string[]>([]);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your photos to set up your profile');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            if (photos.length < 6) {
                setPhotos([...photos, result.assets[0].uri]);
            }
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera access to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            if (photos.length < 6) {
                setPhotos([...photos, result.assets[0].uri]);
            }
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (photos.length < 2) {
            Alert.alert('More Photos Needed', 'Please add at least 2 photos to continue');
            return;
        }
        onNext(photos);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Add your best photos</Text>
                <Text style={styles.subtitle}>
                    Upload at least 2 photos. Profiles with more photos get 3x more matches!
                </Text>

                <View style={styles.photosGrid}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <PhotoSlot
                            key={index}
                            photo={photos[index]}
                            index={index}
                            onAdd={pickImage}
                            onRemove={() => removePhoto(index)}
                            isPrimary={index === 0}
                        />
                    ))}
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                        <Text style={styles.actionButtonText}>📸 Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                        <Text style={styles.actionButtonText}>📷 Take Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Photo Tips:</Text>
                    <Text style={styles.tipText}>✓ Use clear, recent photos</Text>
                    <Text style={styles.tipText}>✓ Show your face clearly</Text>
                    <Text style={styles.tipText}>✓ Add photos doing activities you love</Text>
                    <Text style={styles.tipText}>✓ Avoid group photos as your main photo</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.nextButton, photos.length < 2 && styles.nextButtonDisabled]} 
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>
                            Continue ({photos.length}/6)
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.progressIndicator}>
                    <View style={styles.progressDot} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                </View>
            </View>
        </View>
    );
}

function PhotoSlot({ 
    photo, 
    index, 
    onAdd, 
    onRemove, 
    isPrimary 
}: { 
    photo?: string; 
    index: number; 
    onAdd: () => void; 
    onRemove: () => void;
    isPrimary: boolean;
}) {
    if (photo) {
        return (
            <TouchableOpacity style={styles.photoSlot} onPress={onRemove}>
                <Image source={{ uri: photo }} style={styles.photo} />
                {isPrimary && (
                    <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Main</Text>
                    </View>
                )}
                <View style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>✕</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.photoSlotEmpty} onPress={onAdd}>
            <Text style={styles.addIcon}>+</Text>
            {isPrimary && <Text style={styles.primaryLabel}>Main Photo</Text>}
        </TouchableOpacity>
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
        marginBottom: 24,
        lineHeight: 20,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    photoSlot: {
        width: '31%',
        aspectRatio: 3 / 4,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    photoSlotEmpty: {
        width: '31%',
        aspectRatio: 3 / 4,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.borderColor,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    addIcon: {
        fontSize: 32,
        color: COLORS.textSecondary,
    },
    primaryLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    primaryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    primaryBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    tipsContainer: {
        backgroundColor: COLORS.backgroundSecondary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 4,
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
    nextButtonDisabled: {
        opacity: 0.5,
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
