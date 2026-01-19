import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { glassStyles } from '../styles/glassmorphism';

// Mock Data for Date Ideas
const DATE_IDEAS = [
    {
        id: '1',
        title: 'Sunset at Marine Drive',
        category: 'Romantic',
        location: 'South Mumbai',
        image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 'Free',
        rating: 4.9,
    },
    {
        id: '2',
        title: 'Candlelight Dinner at Olive',
        category: 'Dining',
        location: 'Bandra West',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: '$$$',
        rating: 4.7,
    },
    {
        id: '3',
        title: 'Art Walk at Kala Ghoda',
        category: 'Culture',
        location: 'Fort',
        image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: 'Free',
        rating: 4.5,
    },
    {
        id: '4',
        title: 'Live Jazz at The Quarter',
        category: 'Nightlife',
        location: 'Opera House',
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        price: '$$',
        rating: 4.8,
    },
];

export default function DateIdeasScreen() {
    const renderItem = ({ item }: { item: typeof DATE_IDEAS[0] }) => (
        <TouchableOpacity activeOpacity={0.8} style={styles.cardContainer}>
            <View style={[glassStyles.glassCard, styles.card]}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardOverlay}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.badgeContainer}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        
                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
                            <Text style={styles.locationText}>{item.location}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenBackground>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Date Ideas 💡</Text>
                <Text style={styles.headerSubtitle}>Curated spots for your perfect date</Text>
            </View>
            
            <FlatList
                data={DATE_IDEAS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: 20,
        ...SHADOWS.medium,
    },
    card: {
        padding: 0, // Reset padding from glassCard
        height: 250,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: 16,
    },
    cardContent: {
        gap: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    categoryText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    dot: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    priceText: {
        color: COLORS.textHighlight,
        fontWeight: '600',
        fontSize: 14,
    },
});
