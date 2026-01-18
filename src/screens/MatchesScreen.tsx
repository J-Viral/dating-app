// Matches Screen - Display all matched users
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';
import { COLORS } from '../constants/theme';
import { MatchingService } from '../services/MatchingService';
import { Match } from '../types/profile';

export default function MatchesScreen() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            await loadMatches(user.id);
        }
    };

    const loadMatches = async (uid: string) => {
        setLoading(true);
        const userMatches = await MatchingService.getMatches(uid);
        setMatches(userMatches);
        setLoading(false);
    };

    const renderMatchItem = ({ item }: { item: Match }) => {
        const otherUser = item.other_user;
        if (!otherUser) return null;

        return (
            <TouchableOpacity style={styles.matchCard}>
                <Image
                    source={{ uri: otherUser.profile_photo_url || otherUser.photos?.[0] }}
                    style={styles.matchImage}
                />
                <View style={styles.matchInfo}>
                    <Text style={styles.matchName}>{otherUser.full_name}</Text>
                    {otherUser.city && (
                        <Text style={styles.matchLocation}>📍 {otherUser.city}</Text>
                    )}
                    <Text style={styles.matchedDate}>
                        Matched {new Date(item.matched_at).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.actionIndicator}>
                    <Text style={styles.actionText}>Chat →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (matches.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matches yet</Text>
                <Text style={styles.emptySubtext}>Start swiping to find your matches!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={matches}
                renderItem={renderMatchItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundPrimary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundPrimary,
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    matchCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    matchImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    matchInfo: {
        flex: 1,
    },
    matchName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    matchLocation: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    matchedDate: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    actionIndicator: {
        paddingHorizontal: 12,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
