import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Supabase is not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.",
  );
}

// Only the browser-safe publishable key belongs in VITE_ variables.
export const supabase = createClient(url, publishableKey);
