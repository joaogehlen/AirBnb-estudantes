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
import { COLORS, SIZES } from '../../constants';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { formatCurrency } from '../../lib/helpers';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: Property;
  horizontal?: boolean;
}

export function PropertyCard({ property, horizontal }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(property.id);
  const coverPhoto = property.photos?.find((p) => p.is_cover)?.url || property.photos?.[0]?.url;

  const handlePress = () => router.push(`/listing/${property.id}`);

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontal]}
      onPress={handlePress}
      accessibilityLabel={`Ver detalhes de ${property.title}`}
      activeOpacity={0.9}
    >
      <View style={[styles.imageWrapper, horizontal && styles.imageHorizontal]}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="home-outline" size={40} color={COLORS.textLight} />
          </View>
        )}
        {/* Botão de favorito */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggleFavorite(property.id)}
          accessibilityLabel={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? COLORS.error : COLORS.white} />
        </TouchableOpacity>
        {/* Badge tipo */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{property.type === 'room' ? 'Quarto' : property.type === 'republic' ? 'República' : property.type === 'studio' ? 'Kitnet' : 'Apt.'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.location} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
          {' '}{property.neighborhood}, {property.city}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.priceValue}>{formatCurrency(property.price_per_month)}</Text>
            <Text style={styles.priceLabel}>/mês</Text>
          </Text>
          {property.average_rating !== undefined && (
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={COLORS.secondary} />
              <Text style={styles.ratingText}>{property.average_rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({property.review_count})</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontal: {
    width: width * 0.62,
    marginRight: SIZES.md,
    marginBottom: 0,
  },
  imageWrapper: { position: 'relative' },
  imageHorizontal: {},
  image: { width: '100%', height: 170 },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 6,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(27,79,114,0.85)',
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  info: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  location: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: {},
  priceValue: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  priceLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '400' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  reviewCount: { fontSize: 11, color: COLORS.textSecondary },
});
