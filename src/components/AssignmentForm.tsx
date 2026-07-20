"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { AssignmentSubmission } from "@/lib/types";

export function AssignmentForm({
  assignmentId,
  submission,
}: {
  assignmentId: string;
  submission: AssignmentSubmission | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState(submission?.content ?? "");
  const [fileUrl, setFileUrl] = useState(submission?.file_url ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const graded = submission?.status === "graded";

  async function submit() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/assignment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, content, fileUrl }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not submit.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {graded && (
        <div className="card border-green-300 bg-green-50 p-5">
          <div className="flex items-center gap-2 font-semibold text-green-800">
            <CheckCircle2 size={18} /> Graded
            {submission?.grade != null && <span>· {submission.grade}%</span>}
          </div>
          {submission?.feedback && (
            <p className="text-sm text-green-900 mt-2 whitespace-pre-line">
              {submission.feedback}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="label">Your submission</label>
        <textarea
          className="input min-h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer, notes, or paste a link to your work…"
        />
      </div>
      <div>
        <label className="label">Link (optional)</label>
        <input
          className="input"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://github.com/you/project or a deployed URL"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Submitted! Your instructor will review it.</p>}

      <button onClick={submit} disabled={loading} className="btn-primary">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {submission ? "Update submission" : "Submit assignment"}
      </button>
    </div>
  );
}
