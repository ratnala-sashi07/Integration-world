import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { env, isStripeConfigured } from "@/lib/env";

/** Create a Stripe Checkout session for a paid course. */
export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not available" }, { status: 404 });
  }

  // Already enrolled? Skip payment.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (existing) return NextResponse.json({ url: "/dashboard" });

  // Stripe requires an absolute http(s) URL for success/cancel. Fall back to the
  // request origin if NEXT_PUBLIC_SITE_URL isn't a valid URL.
  let base = env.siteUrl;
  try {
    new URL(base);
  } catch {
    base = new URL(req.url).origin;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        course.stripe_price_id
          ? { price: course.stripe_price_id, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: course.currency || "usd",
                unit_amount: course.price_cents,
                product_data: {
                  name: course.title,
                  description: course.subtitle ?? undefined,
                },
              },
            },
      ],
      metadata: { courseId, userId: user.id },
      success_url: `${base}/dashboard?purchased=${course.slug}`,
      cancel_url: `${base}/courses/${course.slug}?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: `Stripe: ${message}` }, { status: 500 });
  }
}
