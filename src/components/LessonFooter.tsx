"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Loader2 } from "lucide-react";

export function LessonFooter({
  lessonId,
  nextHref,
  initialCompleted,
}: {
  lessonId: string;
  nextHref: string | null;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function complete(goNext: boolean) {
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, position: 0, completed: true }),
    });
    setCompleted(true);
    setLoading(false);
    router.refresh();
    if (goNext && nextHref) router.push(nextHref);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => complete(false)}
        disabled={loading || completed}
        className={completed ? "btn-outline" : "btn-outline"}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        {completed ? "Completed" : "Mark complete"}
      </button>
      {nextHref && (
        <button onClick={() => complete(true)} disabled={loading} className="btn-primary">
          Complete &amp; continue <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
