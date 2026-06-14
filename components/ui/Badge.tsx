import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull },
  text: { fontSize: 11, fontWeight: '600' },
  primary: { backgroundColor: '#E3F0FF' },
  text_primary: { color: COLORS.primaryLight },
  success: { backgroundColor: COLORS.successLight },
  text_success: { color: COLORS.success },
  warning: { backgroundColor: COLORS.warningLight },
  text_warning: { color: '#B7770D' },
  error: { backgroundColor: COLORS.errorLight },
  text_error: { color: COLORS.error },
  neutral: { backgroundColor: COLORS.surfaceSecondary },
  text_neutral: { color: COLORS.textSecondary },
});
