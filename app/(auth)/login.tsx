import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { COLORS, SIZES, STRINGS, SHADOWS } from '../../constants';

export default function LoginScreen() {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__loginRenders = ((globalThis as any).__loginRenders || 0) + 1;
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(
        'Não foi possível entrar',
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message === 'Email not confirmed'
          ? 'Confirme seu e-mail antes de entrar.'
          : error.message,
      );
    } else {
      toast.success('Bem-vindo de volta! 👋', 'Login realizado com sucesso.');
      // Redirecionamento tratado pelo onAuthStateChange em _layout.tsx
    }
  };

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {/* Header com gradiente */}
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImg}
              resizeMode="cover"
              accessibilityLabel="Logo do StudentNest"
            />
          </View>
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
            icon="mail-outline"
            accessibilityLabel="Campo de e-mail"
          />
          <Input
            label={STRINGS.passwordLabel}
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            accessibilityLabel="Campo de senha"
          />

          <Button
            label={STRINGS.loginBtn}
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
            accessibilityLabel="Botão entrar"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerCard}
            onPress={() => router.push('/(auth)/register')}
            accessibilityLabel="Ir para cadastro"
            activeOpacity={0.85}
          >
            <Text style={styles.registerText}>{STRINGS.noAccount}</Text>
            <Text style={styles.registerLink}>{STRINGS.signUp}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1 },
  header: {
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 84, height: 84, borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    ...SHADOWS.md,
  },
  logoImg: { width: 64, height: 64, borderRadius: 16 },
  appName: { fontSize: 30, fontWeight: '800', color: COLORS.white, letterSpacing: 0.3 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: SIZES.lg,
    paddingTop: 32,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },
  loginBtn: { marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.textLight },
  registerCard: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    paddingVertical: 16, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  registerLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});
