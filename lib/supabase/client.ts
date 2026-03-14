"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  client = createBrowserClient(supabaseUrl, supabasePublishableKey);

  return client;
}
