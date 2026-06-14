import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 }, // 5 min cache
  },
});

// Usuário mock para desenvolvimento (remova ao integrar Supabase)
const MOCK_USER = {
  id: 'current_user',
  full_name: 'João Silva',
  avatar_url: 'https://i.pravatar.cc/150?img=12',
  user_type: 'student' as const,
  university_email: 'joao@usp.br',
  is_verified: true,
  bio: 'Estudante de Engenharia na USP.',
  phone: '11988887777',
  created_at: '2023-08-01',
};

function AuthGuard() {
  const { isAuthenticated, isLoading, setUser } = useAuthStore();
  const segments = useSegments();

  // Inicializa com usuário mock (simula sessão ativa)
  useEffect(() => {
    setUser(MOCK_USER);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="listing/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="host/dashboard"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="host/new-listing"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
