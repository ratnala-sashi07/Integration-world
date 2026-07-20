import Stripe from "stripe";
import { env } from "@/lib/env";

/** Server-side Stripe client. Guard call sites with isStripeConfigured. */
// Fallback placeholder keeps `new Stripe()` from throwing at import time when the
// key isn't set yet. Guard real calls with isStripeConfigured.
export const stripe = new Stripe(env.stripeSecret || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});
