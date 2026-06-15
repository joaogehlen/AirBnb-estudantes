import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../lib/toast';
import { COLORS, SIZES, STRINGS } from '../../constants';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
}
function MenuItem({ icon, label, onPress, badge, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} accessibilityLabel={label}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon as any} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(STRINGS.confirmLogout, '', [
      { text: STRINGS.cancel, style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          toast.success('Até logo! 👋', 'Você saiu da sua conta.');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const comingSoon = () => toast.info('Em breve 🚧', 'Esta função ainda está em construção.');

  const isHost = user?.user_type === 'host';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card do perfil */}
        <View style={styles.profileCard}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.full_name?.[0] || '?'}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.university_email || 'E-mail não informado'}</Text>
          <View style={styles.tags}>
            <View style={[styles.tag, isHost ? styles.tagHost : styles.tagStudent]}>
              <Ionicons name={isHost ? 'key-outline' : 'book-outline'} size={12} color={COLORS.white} />
              <Text style={styles.tagText}>{isHost ? 'Anfitrião' : 'Estudante'}</Text>
            </View>
            {user?.is_verified && (
              <View style={styles.tagVerified}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                <Text style={styles.tagVerifiedText}>Verificado</Text>
              </View>
            )}
          </View>
          {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha conta</Text>
          <View style={styles.card}>
            <MenuItem icon="create-outline" label="Editar perfil" onPress={comingSoon} />
            {!isHost && (
              <MenuItem icon="calendar-outline" label={STRINGS.myBookings} onPress={() => router.push('/booking/list')} />
            )}
            {isHost && (
              <>
                <MenuItem icon="business-outline" label={STRINGS.myProperties} onPress={() => router.push('/host/dashboard')} />
                <MenuItem icon="add-circle-outline" label={STRINGS.newProperty} onPress={() => router.push('/host/new-listing')} />
              </>
            )}
            <MenuItem icon="heart-outline" label="Favoritos" onPress={() => router.push('/(tabs)/favorites')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.card}>
            <MenuItem icon="help-circle-outline" label="Central de ajuda" onPress={comingSoon} />
            <MenuItem icon="flag-outline" label="Fazer uma denúncia" onPress={comingSoon} />
            <MenuItem icon="document-text-outline" label="Termos de uso" onPress={comingSoon} />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.card}>
            <MenuItem icon="log-out-outline" label={STRINGS.logout} onPress={handleLogout} danger />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  profileCard: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: { width: 84, height: 84, borderRadius: 42, marginBottom: 12 },
  avatarPlaceholder: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, marginBottom: 10 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagStudent: { backgroundColor: COLORS.primaryLight },
  tagHost: { backgroundColor: COLORS.accent },
  tagText: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  tagVerified: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.successLight, borderRadius: 12 },
  tagVerifiedText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  bio: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 },
  section: { marginTop: 20, paddingHorizontal: SIZES.lg },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  menuIconDanger: { backgroundColor: COLORS.errorLight },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  menuLabelDanger: { color: COLORS.error },
  badge: { backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: COLORS.white, fontWeight: '700' },
});
