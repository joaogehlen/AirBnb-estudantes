import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIZES } from '../../constants';
import { timeAgo } from '../../lib/helpers';

export default function MessagesScreen() {
  const { user } = useAuthStore();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
      ) : (
        <FlatList
          data={conversations}
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
            const other = user?.id === item.student_id ? item.host : item.student;
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => router.push(`/chat/${item.id}`)}
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
                  {item.property && (
                    <Text style={styles.propertyName} numberOfLines={1}>{item.property.title}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
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
  header: { padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  loader: { flex: 1, alignSelf: 'center', marginTop: 60 },
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
  propertyName: { fontSize: 12, color: COLORS.primaryLight },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
