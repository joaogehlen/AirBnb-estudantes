import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Fragment, useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import '@/src/i18n';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { queryClient } from '@/src/lib/query-client';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const StripeProviderComponent =
  Platform.OS === 'web' ? Fragment : require('@stripe/stripe-react-native').StripeProvider;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const stripeProps =
    Platform.OS === 'web'
      ? {}
      : { publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder' };

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProviderComponent {...stripeProps}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </StripeProviderComponent>
    </QueryClientProvider>
  );
}
