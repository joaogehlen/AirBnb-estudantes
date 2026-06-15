// components/ui/index.tsx — Barrel + componentes utilitários do StudentNest

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants';

// Reexporta os componentes canônicos
export { Button } from './Button';
export { Input } from './Input';
export { Badge } from './Badge';

// ─── StarRating ───────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  totalReviews?: number;
}
export function StarRating({ rating, size = 14, showValue = true, totalReviews }: StarRatingProps) {
  return (
    <View style={styles.starRow}>
      <Ionicons name="star" size={size} color={COLORS.star} />
      {showValue && (
        <Text style={[styles.starText, { fontSize: size }]}>
          {rating?.toFixed(1) ?? '—'}
          {totalReviews != null && ` (${totalReviews})`}
        </Text>
      )}
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}
export function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityLabel={`Avatar de ${name ?? 'usuário'}`}
      />
    );
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}
export function Chip({ label, icon, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={label}
    >
      {icon && <Ionicons name={icon} size={15} color={selected ? COLORS.white : COLORS.text} />}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SectionHeader ────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}
export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`Ver todos de ${title}`}>
          <Text style={styles.seeAll}>Ver todos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────
interface EmptyStateProps {
  message: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}
export function EmptyState({ message, title, icon = 'sad-outline' }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={40} color={COLORS.textLight} />
      </View>
      {title && <Text style={styles.emptyTitle}>{title}</Text>}
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starText: { color: COLORS.text, fontWeight: '600' },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: COLORS.white, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.surface,
  },
  chipSelected: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  chipTextSelected: { color: COLORS.white },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  empty: { padding: SIZES.xl, alignItems: 'center' },
  emptyIcon: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.sm },
});
