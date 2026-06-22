import { createClient, SupabaseClient } from "@supabase/supabase-js";

// The demo runs fully on local mock data so it works the instant it's deployed,
// even with no Supabase project configured. When you add real credentials to
// .env.local, this client becomes available for swapping mock data for live
// queries (see /supabase/schema.sql + seed.sql).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anon as string)
  : null;
