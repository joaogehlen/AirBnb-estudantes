import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { COLORS, SIZES, STRINGS } from '../../constants';
import { isUniversityEmail } from '../../lib/helpers';
import { UserType } from '../../types';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('student');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) { toast.error('Atenção', 'Informe seu nome completo.'); return false; }
    if (!email.trim()) { toast.error('Atenção', 'Informe seu e-mail.'); return false; }
    if (userType === 'student' && !isUniversityEmail(email)) {
      toast.error('E-mail institucional', 'Estudantes precisam usar e-mail @univates.br ou @universo.univates.br.');
      return false;
    }
    if (password.length < 6) { toast.error('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim(), user_type: userType },
      },
    });
    setLoading(false);
    if (error) {
      toast.error('Erro no cadastro', error.message);
    } else {
      toast.success('Cadastro realizado! 🎉', 'Verifique seu e-mail para confirmar a conta.');
      setTimeout(() => router.replace('/(auth)/login'), 800);
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
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="home" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>{STRINGS.appName}</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>{STRINGS.registerTitle}</Text>
          <Text style={styles.subtitle}>{STRINGS.registerSubtitle}</Text>

          {/* Seleção do tipo de conta */}
          <Text style={styles.typeLabel}>Você é...</Text>
          <View style={styles.typeRow}>
            {(['student', 'host'] as UserType[]).map((t) => {
              const selected = userType === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, selected && styles.typeSelected]}
                  onPress={() => setUserType(t)}
                  activeOpacity={0.85}
                  accessibilityLabel={t === 'student' ? 'Sou estudante' : 'Sou anfitrião'}
                >
                  <Ionicons
                    name={t === 'student' ? 'school' : 'key'}
                    size={24}
                    color={selected ? COLORS.white : COLORS.primary}
                  />
                  <Text style={[styles.typeText, selected && styles.typeTextSelected]}>
                    {t === 'student' ? 'Estudante' : 'Anfitrião'}
                  </Text>
                  <Text style={[styles.typeHint, selected && styles.typeHintSelected]}>
                    {t === 'student' ? 'Procuro moradia' : 'Quero anunciar'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label={STRINGS.nameLabel} placeholder="Seu nome completo" value={name} onChangeText={setName} icon="person-outline" accessibilityLabel="Campo nome completo" />
          <Input
            label={STRINGS.emailLabel}
            placeholder={userType === 'student' ? 'seu@universo.univates.br' : 'seu@email.com'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            accessibilityLabel="Campo de e-mail"
          />
          {userType === 'student' && (
            <View style={styles.hint}>
              <Ionicons name="information-circle" size={15} color={COLORS.primary} />
              <Text style={styles.hintText}>Use seu e-mail institucional (@univates.br ou @universo.univates.br)</Text>
            </View>
          )}
          <Input
            label={STRINGS.passwordLabel}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
            accessibilityLabel="Campo de senha"
          />

          <Button label={STRINGS.registerBtn} onPress={handleRegister} loading={loading} size="lg" style={styles.btn} accessibilityLabel="Botão criar conta" />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{STRINGS.hasAccount}</Text>
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Ir para login">
              <Text style={styles.loginLink}>{STRINGS.signIn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 34,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  backBtn: { position: 'absolute', top: 54, left: 20, padding: 4, zIndex: 2 },
  logoCircle: {
    width: 58, height: 58, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    padding: SIZES.lg,
    paddingTop: 30,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 22 },
  typeLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  typeOption: {
    flex: 1, alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radiusMd,
    paddingVertical: 16, backgroundColor: COLORS.surface,
  },
  typeSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  typeTextSelected: { color: COLORS.white },
  typeHint: { fontSize: 11, color: COLORS.textSecondary },
  typeHintSelected: { color: 'rgba(255,255,255,0.85)' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 14 },
  hintText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  btn: { marginTop: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});
