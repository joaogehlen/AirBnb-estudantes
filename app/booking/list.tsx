import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentBookings } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIZES, SHADOWS } from '../../constants';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/helpers';

export default function BookingListScreen() {
  const { user } = useAuthStore();

  const { data: bookings = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['studentBookings', user?.id],
    queryFn: () => fetchStudentBookings(user!.id),
    enabled: !!user,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas reservas</Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
              <Text style={styles.emptyText}>Quando você reservar um imóvel, ele aparece aqui com o status do pedido.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const color = getStatusColor(item.status);
            const cover = item.property?.photos?.find((p: any) => p.is_cover)?.url ?? item.property?.photos?.[0]?.url;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/listing/${item.property_id}`)}
                accessibilityLabel={`Reserva em ${item.property?.title}`}
                activeOpacity={0.9}
              >
                {cover ? (
                  <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Ionicons name="home-outline" size={28} color={COLORS.textLight} />
                  </View>
                )}
                <View style={styles.info}>
                  <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={[styles.statusText, { color }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                  <Text style={styles.propertyTitle} numberOfLines={1}>{item.property?.title}</Text>
                  <Text style={styles.city}>{item.property?.neighborhood}, {item.property?.city}</Text>
                  <View style={styles.datesRow}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.dates}>{formatDate(item.check_in)} → {formatDate(item.check_out)}</Text>
                  </View>
                  <Text style={styles.price}>{formatCurrency(item.total_price)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  loader: { flex: 1, alignSelf: 'center', marginTop: 60 },
  list: { padding: SIZES.lg, gap: 14, flexGrow: 1 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, overflow: 'hidden', flexDirection: 'row', ...SHADOWS.sm },
  image: { width: 104, height: 124 },
  imagePlaceholder: { backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, padding: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull, marginBottom: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  propertyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  city: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  dates: { fontSize: 12, color: COLORS.textSecondary },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
