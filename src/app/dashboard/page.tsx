import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Course } from "@/lib/types";

export const metadata = { title: "My learning · Integration World" };

interface EnrolledCourse {
  course: Course;
  total: number;
  completed: number;
  nextLessonId: string | null;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course:courses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: completedRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);
  const completedSet = new Set(
    ((completedRows ?? []) as { lesson_id: string }[]).map((r) => r.lesson_id)
  );

  const courses: EnrolledCourse[] = [];
  for (const row of enrollments ?? []) {
    const course = row.course as unknown as Course;
    if (!course) continue;

    // Ordered lessons for progress + next-lesson.
    const { data: modules } = await supabase
      .from("modules")
      .select("id, position, lessons(id, position)")
      .eq("course_id", course.id)
      .order("position", { ascending: true });

    type MiniModule = { id: string; position: number; lessons: { id: string; position: number }[] };
    const lessons = ((modules ?? []) as MiniModule[])
      .flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, mpos: m.position })))
      .sort((a, b) => a.mpos - b.mpos || a.position - b.position);

    const total = lessons.length;
    const completed = lessons.filter((l) => completedSet.has(l.id)).length;
    const next = lessons.find((l) => !completedSet.has(l.id)) ?? lessons[0];

    courses.push({ course, total, completed, nextLessonId: next?.id ?? null });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">My learning</h1>
      <p className="text-muted mt-1">Pick up where you left off.</p>

      {courses.length === 0 ? (
        <div className="card p-10 text-center mt-8">
          <BookOpen className="mx-auto text-brand-400 mb-3" size={36} />
          <p className="text-muted">You&apos;re not enrolled in any courses yet.</p>
          <Link href="/courses" className="btn-primary mt-4 inline-flex">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {courses.map(({ course, total, completed, nextLessonId }) => {
            const pct = total ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={course.id} className="card overflow-hidden flex flex-col">
                <div className="aspect-video bg-brand-100 overflow-hidden">
                  {course.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold leading-snug line-clamp-2">{course.title}</h3>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{pct}% complete</span>
                      <span>{completed}/{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link
                    href={nextLessonId ? `/learn/${nextLessonId}` : `/courses/${course.slug}`}
                    className="btn-primary mt-4 w-full"
                  >
                    <PlayCircle size={16} />
                    {completed === 0 ? "Start course" : "Continue"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
