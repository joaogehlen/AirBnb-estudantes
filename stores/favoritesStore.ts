import { create } from 'zustand';
import { addFavorite, fetchFavoriteIds, removeFavorite } from '../lib/api';
import { toast } from '../lib/toast';

interface FavoritesState {
  favoriteIds: Set<string>;
  userId: string | null;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  loadFavorites: (userId: string) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  userId: null,

  isFavorite: (propertyId) => get().favoriteIds.has(propertyId),

  clearFavorites: () => set({ favoriteIds: new Set(), userId: null }),

  loadFavorites: async (userId) => {
    set({ userId });
    try {
      const ids = await fetchFavoriteIds(userId);
      set({ favoriteIds: new Set(ids) });
    } catch {
      // ignore — user will see empty favorites
    }
  },

  toggleFavorite: async (propertyId) => {
    const { favoriteIds, userId } = get();
    if (!userId) return;

    const isFav = favoriteIds.has(propertyId);

    // Optimistic update
    set(() => {
      const next = new Set(get().favoriteIds);
      isFav ? next.delete(propertyId) : next.add(propertyId);
      return { favoriteIds: next };
    });

    try {
      if (isFav) {
        await removeFavorite(userId, propertyId);
      } else {
        await addFavorite(userId, propertyId);
      }
    } catch {
      // Reverte a atualização otimista em caso de erro
      set(() => {
        const next = new Set(get().favoriteIds);
        isFav ? next.add(propertyId) : next.delete(propertyId);
        return { favoriteIds: next };
      });
      toast.error('Ops!', 'Não foi possível atualizar seus favoritos.');
    }
  },
}));
