import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { MOCK_PROPERTIES } from '../../lib/mockData';
import { COLORS, SIZES } from '../../constants';
import { formatCurrency, addMonths, formatDate } from '../../lib/helpers';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = MOCK_PROPERTIES.find((p) => p.id === id) || MOCK_PROPERTIES[0];

  const [months, setMonths] = useState(property.min_stay_months);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const checkOut = addMonths(today, months);
  const totalPrice = property.price_per_month * months;
  const serviceFee = totalPrice * 0.05; // 5% taxa de serviço
  const totalWithFee = totalPrice + serviceFee;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Solicitação enviada!',
        `Sua solicitação foi enviada para ${property.host?.full_name}. Você receberá uma confirmação em breve.`,
        [{ text: 'Ver minhas reservas', onPress: () => router.replace('/booking/list') }],
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar reserva</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo do imóvel */}
        <View style={styles.propertyCard}>
          {property.photos?.[0] && (
            <Image source={{ uri: property.photos[0].url }} style={styles.propertyImage} resizeMode="cover" />
          )}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={2}>{property.title}</Text>
            <Text style={styles.propertyLocation}>{property.neighborhood}, {property.city}</Text>
            {property.average_rating !== undefined && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={COLORS.secondary} />
                <Text style={styles.ratingText}>{property.average_rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Seletor de duração */}
        <Text style={styles.sectionTitle}>Duração da estadia</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={[styles.monthBtn, months <= property.min_stay_months && styles.monthBtnDisabled]}
            onPress={() => setMonths((m) => Math.max(property.min_stay_months, m - 1))}
            disabled={months <= property.min_stay_months}
            accessibilityLabel="Diminuir meses"
          >
            <Ionicons name="remove" size={22} color={months <= property.min_stay_months ? COLORS.textLight : COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.monthCount}>
            <Text style={styles.monthValue}>{months}</Text>
            <Text style={styles.monthLabel}>meses</Text>
          </View>
          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => setMonths((m) => Math.min(24, m + 1))}
            accessibilityLabel="Aumentar meses"
          >
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.minStayNote}>Estadia mínima: {property.min_stay_months} meses</Text>

        <View style={styles.divider} />

        {/* Datas */}
        <Text style={styles.sectionTitle}>Período</Text>
        <View style={styles.datesRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Entrada</Text>
            <Text style={styles.dateValue}>{formatDate(today)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Saída prevista</Text>
            <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Resumo de preços */}
        <Text style={styles.sectionTitle}>Resumo de valores</Text>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>{formatCurrency(property.price_per_month)} × {months} meses</Text>
            <Text style={styles.priceRowValue}>{formatCurrency(totalPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Taxa de serviço (5%)</Text>
            <Text style={styles.priceRowValue}>{formatCurrency(serviceFee)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalValue}>{formatCurrency(totalWithFee)}</Text>
          </View>
        </View>

        {/* Aviso de política */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryLight} />
          <Text style={styles.noticeText}>
            Ao confirmar, você envia uma solicitação ao anfitrião. O pagamento será combinado diretamente após a confirmação.
          </Text>
        </View>

        <Button
          label="Enviar solicitação de reserva"
          onPress={handleConfirm}
          loading={loading}
          style={styles.confirmBtn}
          accessibilityLabel="Confirmar reserva"
        />
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: SIZES.lg },
  propertyCard: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  propertyImage: { width: 90, height: 90 },
  propertyInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  propertyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  propertyLocation: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  monthBtn: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  monthBtnDisabled: { borderColor: COLORS.border },
  monthCount: { alignItems: 'center' },
  monthValue: { fontSize: 32, fontWeight: '700', color: COLORS.primary },
  monthLabel: { fontSize: 13, color: COLORS.textSecondary },
  minStayNote: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginTop: 10 },
  datesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  dateBox: { alignItems: 'center', backgroundColor: COLORS.surfaceSecondary, borderRadius: SIZES.radius, padding: 14, flex: 1 },
  dateLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  dateValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  priceBreakdown: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceRowLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceRowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  priceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  priceTotalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  priceTotalValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: '#E8F4FD', borderRadius: SIZES.radius, padding: 14, marginTop: 16, marginBottom: 20 },
  noticeText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  confirmBtn: {},
});
