import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && key && url.startsWith("http") && !url.includes("tu-proyecto")
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  client = createClient(url as string, key as string);
}

export const supabase = client;
