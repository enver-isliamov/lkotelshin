
import { createClient } from '@supabase/supabase-js';

// Используем плейсхолдеры, чтобы сборка не падала, если ENV переменные отсутствуют в момент build-тайма.
// В Runtime (в браузере) переменные должны быть предоставлены Vercel.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
