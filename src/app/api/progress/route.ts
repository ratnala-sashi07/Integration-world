import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Upsert the current user's progress for a lesson. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { lessonId, position, completed } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  // Build the row; don't downgrade an already-completed lesson.
  const row: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: lessonId,
    last_position_seconds: Math.max(0, Math.floor(position ?? 0)),
    updated_at: new Date().toISOString(),
  };
  if (completed) row.completed = true;

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(row, { onConflict: "user_id,lesson_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
