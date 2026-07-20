import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client — bypasses Row Level Security. SERVER ONLY.
 * Use for trusted server work: webhook-driven enrollment, grading quizzes,
 * fetching quiz answer keys, issuing Mux tokens after an enrollment check.
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
