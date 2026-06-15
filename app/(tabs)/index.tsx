import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { PropertyCard } from '../../components/cards/PropertyCard';
import { useAuthStore } from '../../stores/authStore';
import { fetchProperties } from '../../lib/api';
import { COLORS, SIZES, STRINGS } from '../../constants';
import { Property } from '../../types';

const { width } = Dimensions.get('window');

function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.image} />
      <View style={skeletonStyles.line} />
      <View style={[skeletonStyles.line, { width: '60%' }]} />
    </View>
  );
}
const skeletonStyles = StyleSheet.create({
  card: { width: width * 0.62, marginRight: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.surface },
  image: { height: 170, backgroundColor: COLORS.border },
  line: { height: 12, backgroundColor: COLORS.border, margin: 12, borderRadius: 6 },
});

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data: allProperties = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['properties'],
    queryFn: () => fetchProperties(),
  });

  const topRated = [...allProperties]
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 3);
  const republics = allProperties.filter((p) => p.type === 'republic');
  const nearUniversity = allProperties.slice(0, 4);

  const handleSearch = () => {
    router.push({ pathname: '/(tabs)/search', params: { city: search } });
  };

  const renderSkeletons = () =>
    Array(3).fill(null).map((_, i) => <CardSkeleton key={i} />);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Olá, {user?.full_name?.split(' ')[0]} 👋</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationText}>Brasil</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn} accessibilityLabel="Notificações">
              <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cidade ou bairro..."
              placeholderTextColor={COLORS.textLight}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              accessibilityLabel="Campo de busca"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Limpar busca">
                <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Categorias rápidas */}
        <View style={styles.categoryRow}>
          {[
            { label: 'Quarto', icon: 'bed-outline', type: 'room' },
            { label: 'Kitnet', icon: 'home-outline', type: 'studio' },
            { label: 'República', icon: 'people-outline', type: 'republic' },
            { label: 'Apartamento', icon: 'business-outline', type: 'apartment' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.type}
              style={styles.categoryItem}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { type: cat.type } })}
              accessibilityLabel={`Buscar ${cat.label}`}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon as any} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção: Próximo à universidade */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{STRINGS.nearUniversity}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')} accessibilityLabel="Ver todos">
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={isLoading ? Array(3).fill(null) : nearUniversity}
            keyExtractor={(item, i) => item?.id || String(i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: SIZES.lg, paddingRight: SIZES.sm }}
            renderItem={({ item }) =>
              isLoading || !item ? <CardSkeleton /> : <PropertyCard property={item} horizontal />
            }
          />
        </View>

        {/* Seção: Mais avaliados */}
        {topRated.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{STRINGS.topRated}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')} accessibilityLabel="Ver todos">
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topRated}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: SIZES.lg, paddingRight: SIZES.sm }}
              renderItem={({ item }) => <PropertyCard property={item} horizontal />}
            />
          </View>
        )}

        {/* Seção: Repúblicas */}
        {republics.length > 0 && (
          <View style={[styles.section, { paddingBottom: 100 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{STRINGS.republics}</Text>
            </View>
            <View style={{ paddingHorizontal: SIZES.lg }}>
              {republics.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </View>
          </View>
        )}

        {allProperties.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Nenhum imóvel disponível ainda.</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB: apenas anfitriões */}
      {user?.user_type === 'host' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/host/new-listing')}
          accessibilityLabel={STRINGS.addProperty}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
          <Text style={styles.fabText}>{STRINGS.addProperty}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.lg, paddingBottom: 28, paddingTop: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  categoryRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  categoryItem: { alignItems: 'center', gap: 6 },
  categoryIcon: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.primaryTint,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryLabel: { fontSize: 11, color: COLORS.text, fontWeight: '500' },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLORS.primaryLight },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  fab: {
    position: 'absolute', bottom: 100, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radiusFull,
    paddingVertical: 14, paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  fabText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
