
import { createClient } from '@supabase/supabase-js';

// Пытаемся получить ключи. Приоритет у REACT_APP_, так как CRA поддерживает только их.
// NEXT_PUBLIC_ добавлены на случай, если проект будет мигрирован на Vite/Next.js, 
// но в текущей сборке CRA они скорее всего будут undefined.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Environment Variables are missing! Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel settings.");
}

// Используем плейсхолдеры, чтобы приложение не падало при инициализации, если ключей нет
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
);
