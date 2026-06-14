import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, SIZES, STRINGS } from '../../constants';
import { isUniversityEmail } from '../../lib/helpers';
import { UserType } from '../../types';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('student');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const validate = () => {
    if (!name.trim()) { Alert.alert('Atenção', 'Informe seu nome completo.'); return false; }
    if (!email.trim()) { Alert.alert('Atenção', 'Informe seu e-mail.'); return false; }
    if (userType === 'student' && !isUniversityEmail(email)) {
      Alert.alert('E-mail universitário', 'Estudantes precisam usar e-mail com domínio .edu.br (ex: joao@usp.br).');
      return false;
    }
    if (password.length < 6) { Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    // Simula cadastro — substitua pela chamada ao Supabase
    setTimeout(() => {
      setUser({
        id: 'current_user',
        full_name: name,
        avatar_url: null,
        user_type: userType,
        university_email: userType === 'student' ? email : null,
        is_verified: false,
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
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Ionicons name="school-outline" size={40} color={COLORS.white} />
          <Text style={styles.appName}>{STRINGS.appName}</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>{STRINGS.registerTitle}</Text>
          <Text style={styles.subtitle}>{STRINGS.registerSubtitle}</Text>

          {/* Seleção do tipo de conta */}
          <Text style={styles.typeLabel}>Tipo de conta</Text>
          <View style={styles.typeRow}>
            {(['student', 'host'] as UserType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, userType === t && styles.typeSelected]}
                onPress={() => setUserType(t)}
                accessibilityLabel={t === 'student' ? 'Sou estudante' : 'Sou anfitrião'}
              >
                <Ionicons
                  name={t === 'student' ? 'book-outline' : 'key-outline'}
                  size={22}
                  color={userType === t ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.typeText, userType === t && styles.typeTextSelected]}>
                  {t === 'student' ? 'Estudante' : 'Anfitrião'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label={STRINGS.nameLabel} placeholder="Seu nome completo" value={name} onChangeText={setName} accessibilityLabel="Campo nome completo" />
          <Input
            label={STRINGS.emailLabel}
            placeholder={userType === 'student' ? 'seu@usp.br' : 'seu@email.com'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Campo de e-mail"
          />
          {userType === 'student' && (
            <View style={styles.hint}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.primaryLight} />
              <Text style={styles.hintText}>Use seu e-mail universitário (.edu.br)</Text>
            </View>
          )}
          <Input
            label={STRINGS.passwordLabel}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Campo de senha"
          />

          <Button label={STRINGS.registerBtn} onPress={handleRegister} loading={loading} style={styles.btn} accessibilityLabel="Botão criar conta" />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{STRINGS.hasAccount}</Text>
            <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Ir para login">
              <Text style={styles.loginLink}>{STRINGS.signIn}</Text>
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
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  backBtn: { position: 'absolute', top: 50, left: 20, padding: 4 },
  appName: { fontSize: 26, fontWeight: '700', color: COLORS.white },
  form: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: SIZES.lg,
    paddingTop: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  typeLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: SIZES.radius,
    paddingVertical: 12, backgroundColor: COLORS.surface,
  },
  typeSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  typeTextSelected: { color: COLORS.white },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -10, marginBottom: 14 },
  hintText: { fontSize: 12, color: COLORS.primaryLight },
  btn: { marginTop: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
