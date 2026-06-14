import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MOCK_CONVERSATIONS } from '../../lib/mockData';
import { COLORS, SIZES } from '../../constants';
import { timeAgo } from '../../lib/helpers';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
            <Text style={styles.emptyText}>Suas conversas com anfitriões aparecerão aqui.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const other = item.host;
          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/listing/${item.property_id}`)}
              accessibilityLabel={`Conversa com ${other?.full_name}`}
              activeOpacity={0.7}
            >
              {other?.avatar_url ? (
                <Image source={{ uri: other.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{other?.full_name?.[0] || '?'}</Text>
                </View>
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{other?.full_name}</Text>
                  <Text style={styles.itemTime}>{timeAgo(item.last_message_at)}</Text>
                </View>
                <Text style={styles.propertyName} numberOfLines={1}>{item.property?.title}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  list: { paddingBottom: 20 },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 82 },
  item: { flexDirection: 'row', alignItems: 'center', padding: SIZES.lg, backgroundColor: COLORS.surface, gap: 12 },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarPlaceholder: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  itemContent: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  itemTime: { fontSize: 12, color: COLORS.textLight },
  propertyName: { fontSize: 12, color: COLORS.primaryLight, marginBottom: 2 },
  lastMessage: { fontSize: 13, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
