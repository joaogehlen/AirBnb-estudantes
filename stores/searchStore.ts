import { create } from 'zustand';
import { SearchFilters, PropertyType } from '../types';

interface SearchState {
  filters: SearchFilters;
  setCity: (city: string) => void;
  setType: (type: PropertyType | null) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  city: '',
  type: null,
  min_price: null,
  max_price: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  setCity: (city) => set((s) => ({ filters: { ...s.filters, city } })),
  setType: (type) => set((s) => ({ filters: { ...s.filters, type } })),
  setMinPrice: (min_price) => set((s) => ({ filters: { ...s.filters, min_price } })),
  setMaxPrice: (max_price) => set((s) => ({ filters: { ...s.filters, max_price } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
