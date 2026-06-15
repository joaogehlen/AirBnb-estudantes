import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants';

interface ToastCardProps {
  text1?: string;
  text2?: string;
  accent: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function ToastCard({ text1, text2, accent, tint, icon }: ToastCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.textWrap}>
        {!!text1 && <Text style={styles.title} numberOfLines={1}>{text1}</Text>}
        {!!text2 && <Text style={styles.message} numberOfLines={2}>{text2}</Text>}
      </View>
    </View>
  );
}

// Layouts customizados para cada tipo de toast
export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <ToastCard text1={text1} text2={text2} accent={COLORS.success} tint={COLORS.successLight} icon="checkmark-circle" />
  ),
  error: ({ text1, text2 }: any) => (
    <ToastCard text1={text1} text2={text2} accent={COLORS.error} tint={COLORS.errorLight} icon="alert-circle" />
  ),
  info: ({ text1, text2 }: any) => (
    <ToastCard text1={text1} text2={text2} accent={COLORS.primary} tint={COLORS.primaryTint} icon="information-circle" />
  ),
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  message: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
});
