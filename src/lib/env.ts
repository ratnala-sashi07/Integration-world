/**
 * Central place to read env vars and know whether a given integration is
 * configured. Pages use these flags to degrade gracefully instead of crashing
 * when a key is missing (handy during first-time setup / preview deploys).
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePublishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  muxTokenId: process.env.MUX_TOKEN_ID ?? "",
  muxTokenSecret: process.env.MUX_TOKEN_SECRET ?? "",
  muxSigningKeyId: process.env.MUX_SIGNING_KEY_ID ?? "",
  muxSigningPrivateKey: process.env.MUX_SIGNING_PRIVATE_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isStripeConfigured = Boolean(env.stripeSecret);
export const isMuxConfigured = Boolean(env.muxTokenId && env.muxTokenSecret);
export const isMuxSigningConfigured = Boolean(
  env.muxSigningKeyId && env.muxSigningPrivateKey
);
