import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { PropertyCard } from '../../components/cards/PropertyCard';
import { Button } from '../../components/ui/Button';
import { fetchProperties } from '../../lib/api';
import { COLORS, SIZES, PROPERTY_TYPES } from '../../constants';
import { PropertyType } from '../../types';
import { formatCurrency } from '../../lib/helpers';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  const [tempType, setTempType] = useState<PropertyType | null>(null);

  const { data: allProperties = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['properties'],
    queryFn: () => fetchProperties(),
  });

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const matchQuery = !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.city.toLowerCase().includes(query.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(query.toLowerCase());
      const matchType = !selectedType || p.type === selectedType;
      const matchPrice = !maxPrice || p.price_per_month <= maxPrice;
      return matchQuery && matchType && matchPrice;
    });
  }, [allProperties, query, selectedType, maxPrice]);

  const openFilters = () => {
    setTempType(selectedType);
    setTempMaxPrice(maxPrice ? String(maxPrice) : '');
    setShowFilters(true);
  };

  const applyFilters = () => {
    setSelectedType(tempType);
    setMaxPrice(tempMaxPrice ? Number(tempMaxPrice) : null);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedType(null);
    setMaxPrice(null);
    setTempType(null);
    setTempMaxPrice('');
    setShowFilters(false);
  };

  const activeFiltersCount = (selectedType ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cidade, bairro ou universidade..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            accessibilityLabel="Campo de busca de imóveis"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilters} accessibilityLabel="Abrir filtros">
          <Ionicons name="options-outline" size={22} color={COLORS.white} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tags de filtros ativos */}
      {(selectedType || maxPrice) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeTags} contentContainerStyle={{ gap: 8, paddingHorizontal: SIZES.lg }}>
          {selectedType && (
            <TouchableOpacity style={styles.tag} onPress={() => setSelectedType(null)}>
              <Text style={styles.tagText}>{PROPERTY_TYPES.find(t => t.value === selectedType)?.label}</Text>
              <Ionicons name="close" size={13} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {maxPrice && (
            <TouchableOpacity style={styles.tag} onPress={() => setMaxPrice(null)}>
              <Text style={styles.tagText}>Até {formatCurrency(maxPrice)}</Text>
              <Ionicons name="close" size={13} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Contador de resultados */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {isLoading ? 'Buscando...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>{isLoading ? 'Carregando...' : 'Nenhum imóvel encontrado'}</Text>
            <Text style={styles.emptyText}>Tente outros termos ou remova alguns filtros.</Text>
            {activeFiltersCount > 0 && (
              <Button label="Limpar filtros" onPress={clearFilters} variant="outline" style={{ marginTop: 16 }} />
            )}
          </View>
        }
        renderItem={({ item }) => <PropertyCard property={item} />}
      />

      {/* Modal de filtros */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setTempType(selectedType);
          setTempMaxPrice(maxPrice ? String(maxPrice) : '');
          setShowFilters(false);
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)} accessibilityLabel="Fechar filtros">
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.filterLabel}>Tipo de imóvel</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeOption, tempType === t.value && styles.typeSelected]}
                  onPress={() => setTempType(tempType === t.value ? null : t.value as PropertyType)}
                  accessibilityLabel={`Tipo ${t.label}`}
                >
                  <Ionicons name={t.icon as any} size={22} color={tempType === t.value ? COLORS.white : COLORS.primary} />
                  <Text style={[styles.typeLabel, tempType === t.value && styles.typeLabelSelected]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Preço máximo por mês</Text>
            <View style={styles.priceInput}>
              <Text style={styles.pricePreffix}>R$</Text>
              <TextInput
                style={styles.priceField}
                placeholder="Ex: 1500"
                placeholderTextColor={COLORS.textLight}
                value={tempMaxPrice}
                onChangeText={setTempMaxPrice}
                keyboardType="numeric"
                accessibilityLabel="Campo preço máximo"
              />
            </View>

            <View style={styles.pricePresets}>
              {[800, 1200, 1800, 2500].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.preset, tempMaxPrice === String(v) && styles.presetSelected]}
                  onPress={() => setTempMaxPrice(String(v))}
                >
                  <Text style={[styles.presetText, tempMaxPrice === String(v) && styles.presetTextSelected]}>Até {formatCurrency(v)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button label="Limpar tudo" onPress={clearFilters} variant="outline" style={{ flex: 1 }} />
            <Button label="Aplicar filtros" onPress={applyFilters} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { flexDirection: 'row', gap: 10, padding: SIZES.lg, paddingBottom: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surfaceSecondary, borderRadius: SIZES.radius, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filterBtn: { width: 44, height: 44, borderRadius: SIZES.radius, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  activeTags: { paddingVertical: 10, backgroundColor: COLORS.surface },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryTint, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  resultsHeader: { paddingHorizontal: SIZES.lg, paddingVertical: 10 },
  resultsCount: { fontSize: 13, color: COLORS.textSecondary },
  list: { paddingHorizontal: SIZES.lg, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalContent: { flex: 1, padding: SIZES.lg },
  filterLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: COLORS.surface },
  typeSelected: { backgroundColor: COLORS.primary },
  typeLabel: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  typeLabelSelected: { color: COLORS.white },
  priceInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 14, backgroundColor: COLORS.surface },
  pricePreffix: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary, marginRight: 6 },
  priceField: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 12 },
  pricePresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  preset: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.surface },
  presetSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  presetText: { fontSize: 13, color: COLORS.textSecondary },
  presetTextSelected: { color: COLORS.primary, fontWeight: '600' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: SIZES.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
});
