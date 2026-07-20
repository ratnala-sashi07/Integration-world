"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import type { PublicQuizQuestion } from "@/lib/types";

interface Result {
  questionId: string;
  correct: boolean;
  correctAnswer: number[];
}

export function QuizRunner({
  quizId,
  questions,
}: {
  quizId: string;
  questions: PublicQuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [score, setScore] = useState<{ score: number; max: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultMap = new Map(results?.map((r) => [r.questionId, r]));

  function toggle(q: PublicQuizQuestion, idx: number) {
    if (results) return; // locked after submit
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.type === "single") return { ...prev, [q.id]: [idx] };
      return cur.includes(idx)
        ? { ...prev, [q.id]: cur.filter((i) => i !== idx) }
        : { ...prev, [q.id]: [...cur, idx] };
    });
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not submit.");
      return;
    }
    setResults(data.results);
    setScore({ score: data.score, max: data.maxScore });
  }

  function retry() {
    setAnswers({});
    setResults(null);
    setScore(null);
  }

  const allAnswered = questions.every((q) => (answers[q.id] ?? []).length > 0);
  const passed = score ? score.score / score.max >= 0.7 : false;

  return (
    <div className="space-y-6">
      {score && (
        <div
          className={`card p-5 flex items-center justify-between ${
            passed ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"
          }`}
        >
          <div>
            <div className="text-lg font-bold">
              You scored {score.score}/{score.max}
            </div>
            <div className="text-sm text-muted">
              {passed ? "Great work — you passed! 🎉" : "Keep going — review and try again."}
            </div>
          </div>
          <button onClick={retry} className="btn-outline">
            <RotateCcw size={16} /> Retry
          </button>
        </div>
      )}

      {questions.map((q, qi) => {
        const selected = answers[q.id] ?? [];
        const r = resultMap.get(q.id);
        return (
          <div key={q.id} className="card p-5">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-bold text-brand-600">{qi + 1}.</span>
              <div className="flex-1">
                <p className="font-medium">{q.prompt}</p>
                <p className="text-xs text-muted mt-0.5">
                  {q.type === "multiple" ? "Select all that apply" : "Select one"} ·{" "}
                  {q.points} {q.points === 1 ? "point" : "points"}
                </p>
              </div>
              {r && (
                r.correct ? (
                  <CheckCircle2 className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )
              )}
            </div>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isSelected = selected.includes(idx);
                const isCorrectAnswer = r?.correctAnswer.includes(idx);
                let cls = "border-border";
                if (r) {
                  if (isCorrectAnswer) cls = "border-green-400 bg-green-50";
                  else if (isSelected) cls = "border-red-400 bg-red-50";
                } else if (isSelected) {
                  cls = "border-brand-500 bg-brand-50";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => toggle(q, idx)}
                    disabled={Boolean(results)}
                    className={`w-full text-left flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition ${cls} ${
                      results ? "cursor-default" : "hover:border-brand-400"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 flex-none place-items-center border text-xs ${
                        q.type === "single" ? "rounded-full" : "rounded"
                      } ${isSelected ? "bg-brand-600 border-brand-600 text-white" : "border-border"}`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!results && (
        <button onClick={submit} disabled={!allAnswered || loading} className="btn-primary">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Submit quiz
        </button>
      )}
    </div>
  );
}
