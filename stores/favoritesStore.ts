import { create } from 'zustand';
import { addFavorite, fetchFavoriteIds, removeFavorite } from '../lib/api';
import { toast } from '../lib/toast';

interface FavoritesState {
  favoriteIds: string[];
  userId: string | null;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  loadFavorites: (userId: string) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  userId: null,

  isFavorite: (propertyId) => get().favoriteIds.includes(propertyId),

  clearFavorites: () => set({ favoriteIds: [], userId: null }),

  loadFavorites: async (userId) => {
    set({ userId });
    try {
      const ids = await fetchFavoriteIds(userId);
      set({ favoriteIds: ids });
    } catch {
      // ignore — user will see empty favorites
    }
  },

  toggleFavorite: async (propertyId) => {
    const { favoriteIds, userId } = get();
    if (!userId) return;

    const isFav = favoriteIds.includes(propertyId);

    // Optimistic update
    set({ favoriteIds: isFav ? favoriteIds.filter((id) => id !== propertyId) : [...favoriteIds, propertyId] });

    try {
      if (isFav) {
        await removeFavorite(userId, propertyId);
      } else {
        await addFavorite(userId, propertyId);
      }
    } catch {
      // Reverte a atualização otimista em caso de erro
      const current = get().favoriteIds;
      set({ favoriteIds: isFav ? [...current, propertyId] : current.filter((id) => id !== propertyId) });
      toast.error('Ops!', 'Não foi possível atualizar seus favoritos.');
    }
  },
}));
