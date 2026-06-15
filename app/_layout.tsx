import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Stack, router, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../stores/authStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { supabase } from '../lib/supabase';
import { fetchProfile } from '../lib/api';
import { toastConfig } from '../components/ui/ToastConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

function AuthGuard() {
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();
  const { loadFavorites, clearFavorites } = useFavoritesStore();
  const segments = useSegments();

  useEffect(() => {
    // Verifica sessão existente ao abrir o app
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
          if (profile.user_type === 'student') {
            loadFavorites(session.user.id);
          }
        } catch {
          setUser(null);
        }
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
            if (profile.user_type === 'student') {
              loadFavorites(session.user.id);
            }
          } catch {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          clearFavorites();
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F7F8' } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="listing/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/[id]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="booking/list" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="host/dashboard" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="host/new-listing" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
          </Stack>
          <Toast config={toastConfig} topOffset={56} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
