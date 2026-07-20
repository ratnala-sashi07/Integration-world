import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Submit / resubmit an assignment. Body: { assignmentId, content, fileUrl? } */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { assignmentId, content, fileUrl } = await req.json();
  if (!assignmentId || !content?.trim()) {
    return NextResponse.json({ error: "Please add your submission." }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, course_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", assignment.course_id)
    .maybeSingle();
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  const { error } = await supabase.from("assignment_submissions").upsert(
    {
      assignment_id: assignmentId,
      user_id: user.id,
      content,
      file_url: fileUrl || null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
