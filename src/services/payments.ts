import { hasSupabaseConfig, supabase } from '@/src/lib/supabase';

export const createReservationPayment = async (amount: number) => {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount },
  });

  if (error) {
    throw error;
  }

  return data;
};
