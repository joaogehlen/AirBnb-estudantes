import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { fetchHostProperties, fetchHostBookings, updateBookingStatus } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../lib/toast';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../lib/helpers';

export default function HostDashboardScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: myProperties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['hostProperties', user?.id],
    queryFn: () => fetchHostProperties(user!.id),
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['hostBookings', user?.id],
    queryFn: () => fetchHostBookings(user!.id),
    enabled: !!user,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' }) =>
      updateBookingStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostBookings', user?.id] });
      if (variables.status === 'confirmed') {
        toast.success('Reserva confirmada ✅', 'O estudante foi notificado.');
      } else {
        toast.info('Reserva recusada', 'A solicitação foi cancelada.');
      }
    },
    onError: () => {
      toast.error('Erro', 'Não foi possível atualizar a reserva.');
    },
  });

  const handleAccept = (bookingId: string) => {
    Alert.alert('Confirmar reserva', 'Deseja confirmar esta solicitação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => changeStatus({ id: bookingId, status: 'confirmed' }) },
    ]);
  };

  const handleReject = (bookingId: string) => {
    Alert.alert('Recusar reserva', 'Deseja recusar esta solicitação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Recusar', style: 'destructive', onPress: () => changeStatus({ id: bookingId, status: 'cancelled' }) },
    ]);
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const isLoading = loadingProps || loadingBookings;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel do Anfitrião</Text>
        <TouchableOpacity onPress={() => router.push('/host/new-listing')} accessibilityLabel="Adicionar imóvel">
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Estatísticas */}
          <View style={styles.stats}>
            {[
              { label: 'Imóveis ativos', value: myProperties.filter(p => p.is_active).length, icon: 'home-outline', color: COLORS.primary },
              { label: 'Pendentes', value: pendingCount, icon: 'time-outline', color: COLORS.warning },
              { label: 'Confirmadas', value: confirmedCount, icon: 'checkmark-circle-outline', color: COLORS.success },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={24} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Meus imóveis */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meus imóveis</Text>
              <TouchableOpacity onPress={() => router.push('/host/new-listing')} accessibilityLabel="Adicionar novo imóvel">
                <Text style={styles.seeAll}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>
            {myProperties.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum imóvel cadastrado ainda.</Text>
            ) : (
              myProperties.map((p) => {
                const cover = p.photos?.find(ph => ph.is_cover)?.url ?? p.photos?.[0]?.url;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.propertyCard}
                    onPress={() => router.push(`/listing/${p.id}`)}
                    accessibilityLabel={`Ver imóvel ${p.title}`}
                  >
                    {cover && <Image source={{ uri: cover }} style={styles.propertyImage} resizeMode="cover" />}
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>{p.title}</Text>
                      <Text style={styles.propertyCity}>{p.neighborhood}, {p.city}</Text>
                      <Text style={styles.propertyPrice}>{formatCurrency(p.price_per_month)}<Text style={styles.perMonth}>/mês</Text></Text>
                      <View style={[styles.activeBadge, p.is_active && styles.activeBadgeOn]}>
                        <Text style={[styles.activeBadgeText, p.is_active && styles.activeBadgeTextOn]}>
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Solicitações de reserva */}
          <View style={[styles.section, { paddingBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Solicitações de reserva</Text>
            {bookings.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma solicitação recebida ainda.</Text>
            ) : (
              bookings.map((booking) => {
                const color = getStatusColor(booking.status);
                return (
                  <View key={booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      {booking.student?.avatar_url ? (
                        <Image source={{ uri: booking.student.avatar_url }} style={styles.studentAvatar} />
                      ) : (
                        <View style={styles.studentAvatarPlaceholder}>
                          <Text style={styles.studentInitial}>{booking.student?.full_name?.[0]}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{booking.student?.full_name}</Text>
                        <Text style={styles.bookingProperty} numberOfLines={1}>{booking.property?.title}</Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.statusPillText, { color }]}>{getStatusLabel(booking.status)}</Text>
                      </View>
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingDates}>{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</Text>
                      <Text style={styles.bookingTotal}>{formatCurrency(booking.total_price)}</Text>
                    </View>
                    {booking.status === 'pending' && (
                      <View style={styles.bookingActions}>
                        <Button label="Recusar" onPress={() => handleReject(booking.id)} variant="outline" size="sm" style={{ flex: 1 }} />
                        <Button label="Aceitar" onPress={() => handleAccept(booking.id)} size="sm" style={{ flex: 1 }} />
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  loader: { flex: 1, alignSelf: 'center', marginTop: 60 },
  stats: { flexDirection: 'row', gap: 10, padding: SIZES.lg },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: SIZES.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLORS.primaryLight },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, paddingBottom: 16 },
  propertyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  propertyImage: { width: 80, height: 80 },
  propertyInfo: { flex: 1, padding: 10 },
  propertyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  propertyCity: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  propertyPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  perMonth: { fontSize: 11, fontWeight: '400', color: COLORS.textSecondary },
  activeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: COLORS.errorLight },
  activeBadgeOn: { backgroundColor: COLORS.successLight },
  activeBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.error },
  activeBadgeTextOn: { color: COLORS.success },
  bookingCard: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  bookingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20 },
  studentAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  studentInitial: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  studentName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  bookingProperty: { fontSize: 12, color: COLORS.textSecondary },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 12, fontWeight: '600' },
  bookingInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bookingDates: { fontSize: 13, color: COLORS.textSecondary },
  bookingTotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  bookingActions: { flexDirection: 'row', gap: 10 },
});
