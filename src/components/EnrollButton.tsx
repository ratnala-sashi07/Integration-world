"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function EnrollButton({
  courseId,
  priceCents,
  isAuthed,
  firstLessonId,
}: {
  courseId: string;
  priceCents: number;
  isAuthed: boolean;
  firstLessonId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    if (!isAuthed) {
      router.push(`/login?next=/courses`);
      return;
    }
    setLoading(true);
    setError(null);

    const endpoint = priceCents === 0 ? "/api/enroll" : "/api/checkout";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      // Handle non-JSON responses (e.g. an unexpected 500) gracefully.
      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: `Server error (${res.status}).` };
      }

      if (!res.ok || data.error) {
        setError(data.error || `Something went wrong (${res.status}).`);
        setLoading(false);
        return;
      }

      // Free -> learn URL; paid -> Stripe checkout URL.
      const dest = data.url || (firstLessonId ? `/learn/${firstLessonId}` : "/dashboard");
      window.location.href = dest;
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={enroll} className="btn-primary w-full text-base py-3" disabled={loading}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        {priceCents === 0 ? "Enroll for free" : "Buy this course"}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
