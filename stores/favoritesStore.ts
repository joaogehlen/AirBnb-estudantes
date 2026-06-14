import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: Set<string>;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),

  toggleFavorite: (propertyId) => {
    const current = new Set(get().favoriteIds);
    if (current.has(propertyId)) {
      current.delete(propertyId);
    } else {
      current.add(propertyId);
    }
    set({ favoriteIds: current });
  },

  isFavorite: (propertyId) => get().favoriteIds.has(propertyId),
}));
