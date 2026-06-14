import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyCard } from '../../components/cards/PropertyCard';
import { Button } from '../../components/ui/Button';
import { MOCK_PROPERTIES } from '../../lib/mockData';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { COLORS, SIZES } from '../../constants';
import { router } from 'expo-router';

export default function FavoritesScreen() {
  const { favoriteIds } = useFavoritesStore();
  const favorites = MOCK_PROPERTIES.filter((p) => favoriteIds.has(p.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.count}>{favorites.length} {favorites.length === 1 ? 'imóvel' : 'imóveis'}</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>Toque no coração de qualquer imóvel para salvá-lo aqui.</Text>
            <Button
              label="Explorar imóveis"
              onPress={() => router.push('/(tabs)/search')}
              variant="outline"
              style={{ marginTop: 20 }}
              accessibilityLabel="Ir para busca de imóveis"
            />
          </View>
        }
        renderItem={({ item }) => <PropertyCard property={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  count: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  list: { padding: SIZES.lg, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});
