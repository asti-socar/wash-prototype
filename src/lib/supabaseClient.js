import { createClient } from '@supabase/supabase-js';

// .env에 적은 변수명과 동일하게 호출해야 합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);