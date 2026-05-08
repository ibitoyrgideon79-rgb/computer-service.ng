// Server-only Supabase clients — import ONLY in Route Handlers and Server Components
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SRVC = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server Component / Route Handler client (respects RLS, refreshes session) */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll:  ()       => cookieStore.getAll(),
      setAll: (toSet)   => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
}

/** Admin client — bypasses RLS. Never expose to the browser. */
export function getSupabaseAdminClient() {
  return createClient(URL, SRVC, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
