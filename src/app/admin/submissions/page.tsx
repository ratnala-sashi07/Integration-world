import { createAdminClient } from "@/lib/supabase/admin";
import { gradeSubmission } from "@/app/admin/actions";
import type { AssignmentSubmission } from "@/lib/types";

export const metadata = { title: "Submissions · Admin" };

type SubmissionRow = AssignmentSubmission & {
  assignment: { title: string } | null;
  profile: { full_name: string | null } | null;
};

export default async function SubmissionsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("assignment_submissions")
    .select("*, assignment:assignments(title), profile:profiles(full_name)")
    .order("submitted_at", { ascending: false });

  const submissions = (data ?? []) as SubmissionRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Assignment submissions</h1>
      {submissions.length === 0 ? (
        <div className="card p-8 text-center text-muted">No submissions yet.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <span className="font-semibold">{s.assignment?.title ?? "Assignment"}</span>
                  <span className="text-muted text-sm">
                    {" "}· {s.profile?.full_name ?? "Learner"}
                  </span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    s.status === "graded"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.status}
                  {s.grade != null && ` · ${s.grade}%`}
                </span>
              </div>

              {s.content && (
                <p className="text-sm text-muted whitespace-pre-line border-l-2 pl-3 my-3">
                  {s.content}
                </p>
              )}
              {s.file_url && (
                <a href={s.file_url} target="_blank" rel="noreferrer" className="text-brand-600 text-sm hover:underline">
                  {s.file_url}
                </a>
              )}

              <form action={gradeSubmission} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="submissionId" value={s.id} />
                <div>
                  <label className="label">Grade %</label>
                  <input
                    name="grade"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={s.grade ?? ""}
                    className="input py-2 w-24"
                  />
                </div>
                <div className="flex-1 min-w-52">
                  <label className="label">Feedback</label>
                  <input name="feedback" className="input py-2" defaultValue={s.feedback ?? ""} />
                </div>
                <button className="btn-primary">Save grade</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
