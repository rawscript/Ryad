import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface CountReport {
  id?: string;
  created_at: string;
  men: number;
  women: number;
  children: number;
  total: number;
  duration_seconds: number;
}

export const saveReport = async (report: Omit<CountReport, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        ...report,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  return { data, error };
};
