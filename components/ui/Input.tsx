import React, { memo, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'search' | 'send';
  accessibilityLabel?: string;
}

export const Input = memo(function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  error,
  icon,
  multiline,
  numberOfLines,
  style,
  autoCapitalize,
  onSubmitEditing,
  returnKeyType,
  accessibilityLabel,
}: InputProps) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        collapsable={false}
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={19}
            color={focused ? COLORS.primary : COLORS.textLight}
            style={styles.icon}
            pointerEvents="none"
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize={autoCapitalize || 'sentences'}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          selectionColor={COLORS.primary}
          accessibilityLabel={accessibilityLabel || label}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            accessibilityLabel={showPass ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: SIZES.md },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 7 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
  },
  multilineContainer: { alignItems: 'flex-start', paddingVertical: 4 },
  focused: { borderColor: COLORS.primary },
  icon: { marginRight: 8 },
  errorBorder: { borderColor: COLORS.error },
  input: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 13 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  error: { fontSize: 12, color: COLORS.error, marginTop: 5, marginLeft: 2 },
});
