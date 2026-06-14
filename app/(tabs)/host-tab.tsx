// app/(tabs)/host-tab.tsx — Aba do anfitrião (atalho para dashboard)
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function HostTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/host/dashboard');
  }, []);
  return null;
}
