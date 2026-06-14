import React, { useState } from 'react';
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
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  accessibilityLabel?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  error,
  multiline,
  numberOfLines,
  style,
  autoCapitalize,
  accessibilityLabel,
}: InputProps) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, focused && styles.focused, error && styles.errorBorder]}>
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize={autoCapitalize || 'sentences'}
          accessibilityLabel={accessibilityLabel || label}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            accessibilityLabel={showPass ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SIZES.md },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  focused: { borderColor: COLORS.primary },
  errorBorder: { borderColor: COLORS.error },
  input: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 12 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  error: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});
