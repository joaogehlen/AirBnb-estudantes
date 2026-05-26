import { useQuery } from '@tanstack/react-query';

import { hasSupabaseConfig, supabase } from '@/src/lib/supabase';
import type { Listing } from '@/src/types/listing';

const fallbackListings: Listing[] = [
  {
    id: '1',
    title: 'Quarto compartilhado',
    university: 'UFPE',
    price: 750,
    latitude: -8.050951,
    longitude: -34.951151,
  },
  {
    id: '2',
    title: 'Studio mobiliado',
    university: 'UFRGS',
    price: 1400,
    latitude: -30.03306,
    longitude: -51.23,
  },
];

export const useListings = () =>
  useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!hasSupabaseConfig) {
        return fallbackListings;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('id, title, university, price, latitude, longitude')
        .limit(10);

      if (error || !data?.length) {
        return fallbackListings;
      }

      return data as Listing[];
    },
    staleTime: 1000 * 60,
  });
