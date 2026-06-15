import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notifications:lastSeen';

interface NotificationsState {
  lastSeen: number;          // timestamp (ms) da última vez que os avisos foram abertos
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markAllSeen: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  lastSeen: 0,
  hydrated: false,
  hydrate: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      set({ lastSeen: value ? Number(value) : 0, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  markAllSeen: () => {
    const now = Date.now();
    set({ lastSeen: now });
    AsyncStorage.setItem(STORAGE_KEY, String(now)).catch(() => {});
  },
}));

// Carrega o valor persistido assim que o módulo é importado.
useNotificationsStore.getState().hydrate();
