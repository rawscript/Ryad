import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cxwxjssfjvtvailyqyph.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4d3hqc3NmanZ0dmFpbHlxeXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDYyMDgsImV4cCI6MjA5MDUyMjIwOH0.Z9aJ-eThVl1wZMlG4KO5ZNAzjmqrjQEVZM7MUDonQU0';

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
