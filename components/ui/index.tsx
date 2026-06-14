// components/ui/index.tsx — Componentes reutilizáveis do StudentNest

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  type TextInputProps,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { COLORS, SIZES, STRINGS } from '@/constants';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const bg =
    variant === 'primary'   ? COLORS.primary :
    variant === 'secondary' ? COLORS.neutral100 :
    variant === 'danger'    ? COLORS.danger :
    'transparent';

  const textColor =
    variant === 'primary' ? COLORS.white :
    variant === 'danger'  ? COLORS.white :
    variant === 'outline' ? COLORS.primary :
    COLORS.black;

  const border = variant === 'outline'
    ? { borderWidth: 1.5, borderColor: COLORS.primary }
    : {};

  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.6 : 1 },
        border,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.btnText, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? { borderColor: COLORS.danger } : {},
          style,
        ]}
        placeholderTextColor={COLORS.neutral500}
        accessibilityLabel={label}
        {...rest}
      />
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

export function Badge({ label, color = COLORS.primary100, textColor = COLORS.primary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  totalReviews?: number;
}

export function StarRating({ rating, size = 14, showValue = true, totalReviews }: StarRatingProps) {
  return (
    <View style={styles.starRow}>
      <Text style={{ fontSize: size, color: COLORS.accent }}>★</Text>
      {showValue && (
        <Text style={[styles.starText, { fontSize: size }]}>
          {rating?.toFixed(1) ?? '—'}
          {totalReviews != null && ` (${totalReviews})`}
        </Text>
      )}
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
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
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = SIZES.radiusSm, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius: radius },
        style,
      ]}
    />
  );
}

// ─── PropertyCardSkeleton ─────────────────────────────────────────────────────
export function PropertyCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={160} radius={SIZES.radius} />
      <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="45%" height={12} style={{ marginTop: 6 }} />
      <Skeleton width="30%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityLabel={`Ver todos de ${title}`}
          accessibilityRole="button"
        >
          <Text style={styles.seeAll}>{STRINGS.seeAll}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral700,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.neutral300,
    paddingHorizontal: SIZES.md,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  inputError: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starText: {
    color: COLORS.neutral700,
    fontWeight: '500',
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: COLORS.white,
    fontWeight: '700',
  },
  skeleton: {
    backgroundColor: COLORS.neutral200,
  },
  skeletonCard: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  empty: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.neutral600,
    fontSize: 15,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral200,
    marginVertical: SIZES.sm,
  },
});
