import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

interface AudioPromptProps {
    audioUrl?: string | null;
    isEditable?: boolean;
    onRecordingComplete?: (uri: string) => void;
    onDelete?: () => void;
}

export const AudioPrompt: React.FC<AudioPromptProps> = ({
    audioUrl,
    isEditable = false,
    onRecordingComplete,
    onDelete,
}) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('0:00');
    const [position, setPosition] = useState('0:00');
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const startRecording = async () => {
        try {
            if (!hasPermission) return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        
        if (uri && onRecordingComplete) {
            onRecordingComplete(uri);
        }
    };

    const playSound = async () => {
        if (!audioUrl) return;

        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setDuration(formatTime(status.durationMillis || 0));
                    setPosition(formatTime(status.positionMillis));
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error playing sound', error);
        }
    };

    const stopSound = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
        }
    };

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    // Fake visualizer bars
    const renderVisualizer = () => {
        return (
            <View style={styles.visualizer}>
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <View
                        key={i}
                        style={[
                            styles.bar,
                            { 
                                height: h * 4 + (isPlaying ? Math.random() * 10 : 0),
                                backgroundColor: isPlaying ? COLORS.primary : COLORS.textMuted
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    if (!audioUrl && !isEditable) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Ionicons name="mic-outline" size={20} color={COLORS.primary} />
                <Text style={styles.title}>Voice Prompt</Text>
            </View>
            
            <View style={styles.cardContent}>
                {!audioUrl && isEditable ? (
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <LinearGradient
                            colors={recording ? [COLORS.error, '#991B1B'] : [COLORS.primary, COLORS.secondary]}
                            style={styles.recordGradient}
                        >
                            <Ionicons 
                                name={recording ? "stop" : "mic"} 
                                size={24} 
                                color="#FFF" 
                            />
                        </LinearGradient>
                        <Text style={styles.recordText}>
                            {recording ? "Recording..." : "Tap to Record Intro"}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.playerContainer}>
                        <TouchableOpacity
                            onPress={isPlaying ? stopSound : playSound}
                            style={styles.playButton}
                        >
                            <Ionicons 
                                name={isPlaying ? "pause" : "play"} 
                                size={24} 
                                color={COLORS.primary} 
                            />
                        </TouchableOpacity>

                        <View style={styles.waveformContainer}>
                            {renderVisualizer()}
                        </View>

                        {isEditable && (
                            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    cardContent: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    recordButton: {
        alignItems: 'center',
        padding: 10,
    },
    recordGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        ...SHADOWS.glow,
    },
    recordText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    playerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    waveformContainer: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
    },
    visualizer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 30,
    },
    bar: {
        width: 4,
        borderRadius: 2,
    },
    deleteButton: {
        padding: 8,
    },
});
