import { createClient } from "@supabase/supabase-js";

// Estos valores vendrán del archivo .env.local que debes crear con las credenciales de tu proyecto en Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tusupabaseurl.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "tu-super-secrete-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
