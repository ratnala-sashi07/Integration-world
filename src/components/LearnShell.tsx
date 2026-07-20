import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getFullCourse } from "@/lib/queries";
import { LessonSidebar } from "@/components/LessonSidebar";

/**
 * Two-column shell for the enrolled learning area: course sidebar + content.
 * Assumes the caller has already verified access to `courseId`.
 */
export async function LearnShell({
  courseId,
  currentLessonId,
  children,
}: {
  courseId: string;
  currentLessonId?: string;
  children: React.ReactNode;
}) {
  const full = await getFullCourse(courseId);
  if (!full) return <div className="p-8">Course not found.</div>;

  const user = await getUser();
  let completedLessonIds: string[] = [];
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);
    completedLessonIds = ((data ?? []) as { lesson_id: string }[]).map(
      (r) => r.lesson_id
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-[320px_1fr] min-h-[calc(100vh-4rem)]">
      <aside className="hidden lg:block border-r bg-[var(--surface)]">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          <LessonSidebar
            course={full.course}
            modules={full.modules}
            quizzes={full.quizzes}
            assignments={full.assignments}
            completedLessonIds={completedLessonIds}
            currentLessonId={currentLessonId}
          />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
