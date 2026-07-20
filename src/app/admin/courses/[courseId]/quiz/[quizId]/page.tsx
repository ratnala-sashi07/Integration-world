import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { addQuestion, deleteQuestion } from "@/app/admin/actions";
import type { Quiz, QuizQuestion } from "@/lib/types";

export default async function QuizEditor({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await params;
  const admin = createAdminClient();

  const { data: quiz } = await admin.from("quizzes").select("*").eq("id", quizId).maybeSingle();
  if (!quiz) notFound();
  const q = quiz as Quiz;

  const { data: questionsData } = await admin
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");
  const questions = (questionsData as QuizQuestion[]) ?? [];

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/courses/${courseId}`} className="text-sm text-muted hover:text-brand-600">
        ← Back to course
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-6">{q.title}</h1>

      {/* Existing questions */}
      <div className="space-y-3 mb-8">
        {questions.map((question, i) => (
          <div key={question.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">
                {i + 1}. {question.prompt}{" "}
                <span className="text-xs text-muted">
                  ({question.type}, {question.points} pt)
                </span>
              </p>
              <form action={deleteQuestion.bind(null, question.id, courseId, quizId)}>
                <button className="btn-ghost text-red-600">
                  <Trash2 size={15} />
                </button>
              </form>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {question.options.map((opt, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 ${
                    question.correct.includes(idx) ? "text-green-700 font-medium" : "text-muted"
                  }`}
                >
                  {question.correct.includes(idx) ? <Check size={14} /> : <span className="w-3.5" />}
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="card p-6 text-muted text-sm text-center">No questions yet.</div>
        )}
      </div>

      {/* Add question */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} /> Add question
        </h2>
        <form action={addQuestion} className="space-y-3">
          <input type="hidden" name="quizId" value={quizId} />
          <input type="hidden" name="courseId" value={courseId} />
          <div>
            <label className="label">Question</label>
            <input name="prompt" className="input" required placeholder="What does…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select name="type" className="input">
                <option value="single">Single answer</option>
                <option value="multiple">Multiple answers</option>
              </select>
            </div>
            <div>
              <label className="label">Points</label>
              <input name="points" type="number" min="1" defaultValue="1" className="input" />
            </div>
          </div>
          <p className="text-xs text-muted">
            Fill options and tick the correct one(s). Leave unused options blank.
          </p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="correct"
                value={i}
                className="h-4 w-4 flex-none"
                title="Correct answer"
              />
              <input name={`option_${i}`} className="input py-2" placeholder={`Option ${i + 1}`} />
            </div>
          ))}
          <button className="btn-primary">Add question</button>
        </form>
      </div>
    </div>
  );
}
