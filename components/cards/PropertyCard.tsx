import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Property } from '../../types';
import { COLORS, SIZES, SHADOWS } from '../../constants';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { formatCurrency } from '../../lib/helpers';

const { width } = Dimensions.get('window');

const TYPE_LABELS: Record<string, string> = {
  room: 'Quarto',
  republic: 'República',
  studio: 'Kitnet',
  apartment: 'Apartamento',
};

interface PropertyCardProps {
  property: Property;
  horizontal?: boolean;
}

export function PropertyCard({ property, horizontal }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(property.id);
  const coverPhoto = property.photos?.find((p) => p.is_cover)?.url || property.photos?.[0]?.url;
  const hasRating = property.average_rating !== undefined && property.average_rating > 0;

  const handlePress = () => router.push(`/listing/${property.id}`);

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontal]}
      onPress={handlePress}
      accessibilityLabel={`Ver detalhes de ${property.title}`}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrapper}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="home-outline" size={40} color={COLORS.textLight} />
          </View>
        )}

        {/* Coração de favorito */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggleFavorite(property.id)}
          accessibilityLabel={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={22}
            color={fav ? COLORS.primary : COLORS.white}
          />
        </TouchableOpacity>

        {/* Selo de tipo */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{TYPE_LABELS[property.type] ?? 'Imóvel'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
          {hasRating && (
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={COLORS.star} />
              <Text style={styles.ratingText}>{property.average_rating!.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>{property.neighborhood}, {property.city}</Text>
        </View>

        <Text style={styles.price}>
          <Text style={styles.priceValue}>{formatCurrency(property.price_per_month)}</Text>
          <Text style={styles.priceLabel}> /mês</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.lg,
    ...SHADOWS.sm,
  },
  horizontal: {
    width: width * 0.72,
    marginRight: SIZES.md,
    marginBottom: 4,
  },
  imageWrapper: {
    position: 'relative',
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 200 },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  info: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, marginBottom: 8 },
  location: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  price: {},
  priceValue: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  priceLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '400' },
});
