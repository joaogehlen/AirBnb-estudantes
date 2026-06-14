import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, FlatList,
  TouchableOpacity, Dimensions, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { MOCK_PROPERTIES, MOCK_REVIEWS } from '../../lib/mockData';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency } from '../../lib/helpers';

const { width } = Dimensions.get('window');

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={14} color={COLORS.secondary} />
      ))}
    </View>
  );
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = MOCK_PROPERTIES.find((p) => p.id === id) || MOCK_PROPERTIES[0];
  const reviews = MOCK_REVIEWS.filter((r) => r.property_id === id).slice(0, 3);

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const fav = isFavorite(property.id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const photos = property.photos || [];
  const amenitiesList = ['Wi-Fi', 'Água inclusa', 'Mobiliado', 'Armário', 'Ventilador'];

  const handleShare = async () => {
    await Share.share({ message: `Veja este imóvel no StudentNest: ${property.title} por ${formatCurrency(property.price_per_month)}/mês` });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carrossel de fotos */}
        <View style={styles.carousel}>
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setPhotoIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.photo} resizeMode="cover" />
            )}
            ListEmptyComponent={
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Ionicons name="home-outline" size={60} color={COLORS.textLight} />
              </View>
            }
          />
          {/* Indicador de fotos */}
          {photos.length > 1 && (
            <View style={styles.dots}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Botões de ação sobrepostos */}
          <SafeAreaView style={styles.overlayButtons} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.overlayRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare} accessibilityLabel="Compartilhar imóvel">
                <Ionicons name="share-outline" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => toggleFavorite(property.id)} accessibilityLabel={fav ? 'Remover favorito' : 'Adicionar favorito'}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? COLORS.error : COLORS.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {/* Contador de fotos */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>{photoIndex + 1}/{Math.max(photos.length, 1)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Título e localização */}
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color={COLORS.textSecondary} />
            <Text style={styles.location}>{property.neighborhood}, {property.city} - {property.state}</Text>
          </View>

          {/* Avaliação */}
          {property.average_rating !== undefined && (
            <View style={styles.ratingRow}>
              <StarRating rating={property.average_rating} />
              <Text style={styles.ratingValue}>{property.average_rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({property.review_count} avaliações)</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Informações do anfitrião */}
          <View style={styles.hostCard}>
            {property.host?.avatar_url ? (
              <Image source={{ uri: property.host.avatar_url }} style={styles.hostAvatar} />
            ) : (
              <View style={styles.hostAvatarPlaceholder}>
                <Text style={styles.hostInitial}>{property.host?.full_name?.[0] || '?'}</Text>
              </View>
            )}
            <View style={styles.hostInfo}>
              <Text style={styles.hostLabel}>Anfitrião</Text>
              <Text style={styles.hostName}>{property.host?.full_name}</Text>
              {property.host?.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
                  <Text style={styles.verifiedText}>Verificado</Text>
                </View>
              )}
            </View>
            <Button label="Contatar" onPress={() => router.push('/(tabs)/messages')} variant="outline" size="sm" accessibilityLabel="Contatar anfitrião" />
          </View>

          <View style={styles.divider} />

          {/* Descrição */}
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description} numberOfLines={showFullDesc ? undefined : 3}>
            {property.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)} accessibilityLabel={showFullDesc ? 'Ver menos' : 'Ver mais'}>
            <Text style={styles.seeMore}>{showFullDesc ? 'Ver menos ▲' : 'Ver mais ▼'}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Comodidades */}
          <Text style={styles.sectionTitle}>Comodidades</Text>
          <View style={styles.amenitiesGrid}>
            {amenitiesList.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Informações de estadia */}
          <Text style={styles.sectionTitle}>Detalhes da estadia</Text>
          <View style={styles.detailsGrid}>
            {[
              { icon: 'calendar-outline', label: 'Estadia mínima', value: `${property.min_stay_months} meses` },
              { icon: 'people-outline', label: 'Capacidade', value: `${property.max_guests} pessoa${property.max_guests > 1 ? 's' : ''}` },
            ].map((d, i) => (
              <View key={i} style={styles.detailItem}>
                <Ionicons name={d.icon as any} size={20} color={COLORS.primary} />
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value}</Text>
              </View>
            ))}
          </View>

          {/* Regras */}
          {property.rules && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Regras da casa</Text>
              <View style={styles.rulesBox}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryLight} />
                <Text style={styles.rulesText}>{property.rules}</Text>
              </View>
            </>
          )}

          {/* Avaliações */}
          {reviews.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Avaliações recentes</Text>
              {reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    {r.reviewer?.avatar_url ? (
                      <Image source={{ uri: r.reviewer.avatar_url }} style={styles.reviewAvatar} />
                    ) : (
                      <View style={[styles.reviewAvatar, styles.reviewAvatarPlaceholder]}>
                        <Text style={{ color: COLORS.white, fontWeight: '700' }}>{r.reviewer?.full_name?.[0]}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{r.reviewer?.full_name}</Text>
                      <StarRating rating={r.rating} />
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer fixo com preço e botão reservar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>a partir de</Text>
          <Text style={styles.footerPrice}>{formatCurrency(property.price_per_month)}<Text style={styles.footerMonth}>/mês</Text></Text>
          <Text style={styles.footerMinStay}>Mín. {property.min_stay_months} meses</Text>
        </View>
        <Button
          label="Reservar"
          onPress={() => router.push(`/booking/${property.id}`)}
          style={styles.reserveBtn}
          accessibilityLabel="Reservar este imóvel"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  carousel: { height: 280, position: 'relative' },
  photo: { width, height: 280 },
  photoPlaceholder: { backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotActive: { width: 18, backgroundColor: COLORS.white },
  overlayButtons: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  overlayRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  photoCounter: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  photoCounterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  content: { padding: SIZES.lg },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  location: { fontSize: 14, color: COLORS.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  ratingCount: { fontSize: 13, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  hostCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hostAvatar: { width: 52, height: 52, borderRadius: 26 },
  hostAvatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  hostInitial: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  hostInfo: { flex: 1 },
  hostLabel: { fontSize: 12, color: COLORS.textSecondary },
  hostName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  verifiedText: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  seeMore: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600', marginTop: 6 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  amenityText: { fontSize: 13, color: COLORS.text },
  detailsGrid: { flexDirection: 'row', gap: 12 },
  detailItem: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: SIZES.radius, padding: 14, gap: 4 },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary },
  detailValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rulesBox: { flexDirection: 'row', gap: 10, backgroundColor: '#E8F4FD', borderRadius: SIZES.radius, padding: 14 },
  rulesText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAvatarPlaceholder: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  reviewerName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, padding: SIZES.lg, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    elevation: 16,
  },
  footerLabel: { fontSize: 12, color: COLORS.textSecondary },
  footerPrice: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  footerMonth: { fontSize: 13, fontWeight: '400', color: COLORS.textSecondary },
  footerMinStay: { fontSize: 11, color: COLORS.textLight },
  reserveBtn: { minWidth: 130 },
});
