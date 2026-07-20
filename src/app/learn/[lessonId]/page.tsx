import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser, getProfile } from "@/lib/auth";
import { getFullCourse } from "@/lib/queries";
import { signPlaybackToken } from "@/lib/mux";
import { isMuxSigningConfigured } from "@/lib/env";
import { LearnShell } from "@/components/LearnShell";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonFooter } from "@/components/LessonFooter";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  // Lesson -> module -> course
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, module:modules(id, course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) notFound();
  const courseId = lesson.module?.course_id as string;

  // Access control
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";
  let enrolled = false;
  if (!isAdmin) {
    const { data: e } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    enrolled = Boolean(e);
  }
  if (!isAdmin && !enrolled && !lesson.is_preview) {
    const { data: course } = await supabase
      .from("courses")
      .select("slug")
      .eq("id", courseId)
      .maybeSingle();
    redirect(course ? `/courses/${course.slug}` : "/courses");
  }

  // Progress for this lesson
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("last_position_seconds, completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  // Signed Mux token (only if signing keys are configured)
  let token: string | null = null;
  if (lesson.mux_playback_id && isMuxSigningConfigured) {
    try {
      token = await signPlaybackToken(lesson.mux_playback_id);
    } catch {
      token = null;
    }
  }

  // Next lesson
  const full = await getFullCourse(courseId);
  const flat = full?.lessons ?? [];
  const idx = flat.findIndex((l) => l.id === lessonId);
  const nextLesson = idx >= 0 ? flat[idx + 1] : undefined;
  const nextHref = nextLesson ? `/learn/${nextLesson.id}` : null;

  return (
    <LearnShell courseId={courseId} currentLessonId={lessonId}>
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <VideoPlayer
          playbackId={lesson.mux_playback_id}
          token={token}
          lessonId={lessonId}
          title={lesson.title}
          initialPosition={progress?.last_position_seconds ?? 0}
        />

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {lesson.is_preview && (
              <span className="mt-1 inline-block rounded bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-medium">
                Free preview
              </span>
            )}
          </div>
          <LessonFooter
            lessonId={lessonId}
            nextHref={nextHref}
            initialCompleted={Boolean(progress?.completed)}
          />
        </div>

        {lesson.description && (
          <div className="mt-6 card p-5">
            <h2 className="font-semibold mb-2">About this lesson</h2>
            <p className="text-muted leading-relaxed whitespace-pre-line">
              {lesson.description}
            </p>
          </div>
        )}
      </div>
    </LearnShell>
  );
}
