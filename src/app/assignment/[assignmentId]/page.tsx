import { redirect, notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getProfile } from "@/lib/auth";
import { LearnShell } from "@/components/LearnShell";
import { AssignmentForm } from "@/components/AssignmentForm";
import type { AssignmentSubmission } from "@/lib/types";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) notFound();

  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";
  if (!isAdmin) {
    const { data: e } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", assignment.course_id)
      .maybeSingle();
    if (!e) redirect("/dashboard");
  }

  const { data: submission } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <LearnShell courseId={assignment.course_id}>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        {assignment.due_date && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Calendar size={15} /> Due {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        )}
        {assignment.instructions && (
          <div className="card p-5 mt-5">
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {assignment.instructions}
            </p>
          </div>
        )}
        <div className="mt-6">
          <AssignmentForm
            assignmentId={assignmentId}
            submission={(submission as AssignmentSubmission) ?? null}
          />
        </div>
      </div>
    </LearnShell>
  );
}
