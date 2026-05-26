import { create } from 'zustand';

import type { Listing } from '@/src/types/listing';

type AppState = {
  locale: 'pt-BR' | 'en-US';
  favoriteListings: Listing[];
  setLocale: (locale: 'pt-BR' | 'en-US') => void;
  setFavoriteListings: (listings: Listing[]) => void;
};

export const useAppStore = create<AppState>((set) => ({
  locale: 'pt-BR',
  favoriteListings: [],
  setLocale: (locale) => set({ locale }),
  setFavoriteListings: (favoriteListings) => set({ favoriteListings }),
}));
