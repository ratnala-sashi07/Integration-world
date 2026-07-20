import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuizQuestion } from "@/lib/types";

function sameSet(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

/** Grade a quiz submission server-side. Body: { quizId, answers: {questionId: number[]} } */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { quizId, answers } = (await req.json()) as {
    quizId: string;
    answers: Record<string, number[]>;
  };
  if (!quizId) return NextResponse.json({ error: "Missing quizId" }, { status: 400 });

  // Verify the user is enrolled in the quiz's course.
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, course_id")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", quiz.course_id)
    .maybeSingle();
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // Load the answer key with the service role (RLS hides it from students).
  const admin = createAdminClient();
  const { data: questionsData } = await admin
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = (questionsData as QuizQuestion[]) ?? [];
  let score = 0;
  let maxScore = 0;
  const results = questions.map((q) => {
    maxScore += q.points;
    const selected = answers[q.id] ?? [];
    const correct = sameSet(selected, q.correct);
    if (correct) score += q.points;
    return { questionId: q.id, correct, correctAnswer: q.correct };
  });

  await admin.from("quiz_attempts").insert({
    quiz_id: quizId,
    user_id: user.id,
    answers,
    score,
    max_score: maxScore,
  });

  return NextResponse.json({ score, maxScore, results });
}
