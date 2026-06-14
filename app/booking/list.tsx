import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MOCK_BOOKINGS } from '../../lib/mockData';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/helpers';

export default function BookingListScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas reservas</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={MOCK_BOOKINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
            <Text style={styles.emptyText}>Suas reservas aparecerão aqui.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const color = getStatusColor(item.status);
          const cover = item.property?.photos?.[0]?.url;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/listing/${item.property_id}`)}
              accessibilityLabel={`Reserva em ${item.property?.title}`}
            >
              {cover && <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" />}
              <View style={styles.info}>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <Text style={[styles.statusText, { color }]}>{getStatusLabel(item.status)}</Text>
                </View>
                <Text style={styles.propertyTitle} numberOfLines={1}>{item.property?.title}</Text>
                <Text style={styles.city}>{item.property?.city}</Text>
                <Text style={styles.dates}>{formatDate(item.check_in)} → {formatDate(item.check_out)}</Text>
                <Text style={styles.price}>{formatCurrency(item.total_price)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  list: { padding: SIZES.lg, gap: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row' },
  image: { width: 90, height: 110 },
  info: { flex: 1, padding: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  propertyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  city: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  dates: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});
