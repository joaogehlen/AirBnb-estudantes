import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Substitua pelas suas credenciais do Supabase
const SUPABASE_URL = 'https://dhkutzfaksxixqmktcvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DsqdT48E7-ouIfxxxTSGog_NIaOzGng';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
