import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIZES, STRINGS } from '../../constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    // Simula autenticação — substitua pela chamada ao Supabase
    setTimeout(() => {
      setUser({
        id: 'current_user',
        full_name: 'João Silva',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        user_type: 'student',
        university_email: email,
        is_verified: true,
        bio: null,
        phone: null,
        created_at: new Date().toISOString(),
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header com gradiente */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
          <Ionicons name="school-outline" size={48} color={COLORS.white} />
          <Text style={styles.appName}>{STRINGS.appName}</Text>
          <Text style={styles.tagline}>{STRINGS.tagline}</Text>
        </LinearGradient>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.title}>{STRINGS.loginTitle}</Text>
          <Text style={styles.subtitle}>{STRINGS.loginSubtitle}</Text>

          <Input
            label={STRINGS.emailLabel}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Campo de e-mail"
          />
          <Input
            label={STRINGS.passwordLabel}
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Campo de senha"
          />

          <Button
            label={STRINGS.loginBtn}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
            accessibilityLabel="Botão entrar"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{STRINGS.noAccount}</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              accessibilityLabel="Ir para cadastro"
            >
              <Text style={styles.registerLink}>{STRINGS.signUp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 8,
  },
  appName: { fontSize: 32, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: SIZES.lg,
    paddingTop: 32,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },
  loginBtn: { marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.textSecondary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  registerLink: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
