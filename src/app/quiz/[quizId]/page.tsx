import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, getProfile } from "@/lib/auth";
import { LearnShell } from "@/components/LearnShell";
import { QuizRunner } from "@/components/QuizRunner";
import type { PublicQuizQuestion, QuizQuestion } from "@/lib/types";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz) notFound();

  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";
  if (!isAdmin) {
    const { data: e } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", quiz.course_id)
      .maybeSingle();
    if (!e) redirect("/dashboard");
  }

  // Load questions with the service role and strip the answer key.
  const admin = createAdminClient();
  const { data: qData } = await admin
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions: PublicQuizQuestion[] = ((qData as QuizQuestion[]) ?? []).map((q) => ({
    id: q.id,
    quiz_id: q.quiz_id,
    prompt: q.prompt,
    type: q.type,
    options: q.options,
    points: q.points,
    position: q.position,
  }));

  return (
    <LearnShell courseId={quiz.course_id}>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-muted mt-1">{quiz.description}</p>}
        <div className="mt-6">
          {questions.length === 0 ? (
            <div className="card p-6 text-muted text-sm">No questions yet.</div>
          ) : (
            <QuizRunner quizId={quizId} questions={questions} />
          )}
        </div>
      </div>
    </LearnShell>
  );
}
