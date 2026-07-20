import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Enroll the current user in a FREE course. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const { data: course } = await supabase
    .from("courses")
    .select("id, price_cents, published")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not available" }, { status: 404 });
  }
  if (course.price_cents > 0) {
    return NextResponse.json({ error: "This course is not free" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("enrollments")
    .upsert({ user_id: user.id, course_id: courseId }, { onConflict: "user_id,course_id" });

  return NextResponse.json({ url: "/dashboard" });
}
