import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNotifications } from '../lib/notifications';
import { useNotificationsStore } from '../stores/notificationsStore';
import { COLORS, SIZES } from '../constants';
import { timeAgo } from '../lib/helpers';

export default function NotificationsScreen() {
  const { notifications, isLoading, isRefetching, refetch } = useNotifications();
  const markAllSeen = useNotificationsStore((s) => s.markAllSeen);
  const lastSeen = useNotificationsStore((s) => s.lastSeen);

  // Snapshot do "visto por último" no momento da abertura, para destacar os novos.
  const seenSnapshot = useRef(lastSeen);

  // Marca tudo como visto pouco depois de abrir (limpa o ponto na home).
  useEffect(() => {
    const t = setTimeout(() => markAllSeen(), 500);
    return () => clearTimeout(t);
  }, [markAllSeen]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avisos</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length === 0 ? styles.emptyWrap : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>{isLoading ? 'Carregando...' : 'Nenhum aviso por enquanto'}</Text>
            <Text style={styles.emptyText}>
              Reservas, confirmações e novas mensagens aparecem aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUnread = new Date(item.timestamp).getTime() > seenSnapshot.current;
          return (
            <TouchableOpacity
              style={[styles.item, isUnread && styles.itemUnread]}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={0.7}
              accessibilityLabel={item.title}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '1A' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  {isUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.itemSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                <Text style={styles.itemTime}>{timeAgo(item.timestamp)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  list: { padding: SIZES.md },
  emptyWrap: { flexGrow: 1 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemUnread: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  itemSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  itemTime: { fontSize: 11, color: COLORS.textLight, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
});
