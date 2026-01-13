
import { createClient } from '@supabase/supabase-js';

// Благодаря изменению в package.json, при билде переменные NEXT_PUBLIC_... 
// будут скопированы в REACT_APP_..., что позволит react-scripts их увидеть и вшить в код.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Environment Variables are missing! Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.");
}

// Используем плейсхолдеры, чтобы приложение не падало при инициализации, если ключей нет (например, при локальной разработке без .env)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
);
