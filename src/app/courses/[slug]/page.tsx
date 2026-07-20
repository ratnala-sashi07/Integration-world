import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, BarChart3, CheckCircle2, User, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { formatPrice, totalCourseDuration } from "@/lib/format";
import { CurriculumAccordion } from "@/components/CurriculumAccordion";
import { EnrollButton } from "@/components/EnrollButton";
import type { Course, Module, Lesson, ModuleWithLessons } from "@/lib/types";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!course) notFound();
  const c = course as Course;

  const { data: modulesData } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", c.id)
    .order("position", { ascending: true });

  const modules: ModuleWithLessons[] = (
    (modulesData ?? []) as (Module & { lessons: Lesson[] })[]
  ).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  const allLessons = modules.flatMap((m) => m.lessons);
  const totalSeconds = allLessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);
  const firstLessonId = allLessons[0]?.id ?? null;

  const user = await getUser();
  let enrolled = false;
  if (user) {
    const { data: e } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", c.id)
      .maybeSingle();
    enrolled = Boolean(e);
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-brand-200 text-sm mb-3">
              <BarChart3 size={15} />
              <span className="capitalize">{c.level ?? "All levels"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">{c.title}</h1>
            {c.subtitle && <p className="mt-3 text-lg text-brand-100">{c.subtitle}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-100">
              {c.instructor_name && (
                <span className="flex items-center gap-1.5">
                  <User size={15} /> {c.instructor_name}
                </span>
              )}
              {c.duration_hours && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} /> {c.duration_hours}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <PlayCircle size={15} /> {allLessons.length} lessons
                {totalSeconds > 0 && ` · ${totalCourseDuration(totalSeconds)}`}
              </span>
            </div>

            {c.highlights?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {c.highlights.map((h) => (
                  <div key={h.label} className="rounded-lg bg-white/10 px-4 py-2">
                    <div className="text-xl font-bold">{h.value}</div>
                    <div className="text-xs text-brand-200">{h.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-10">
          {c.description && (
            <section>
              <h2 className="text-xl font-bold mb-3">About this course</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{c.description}</p>
            </section>
          )}

          {c.outcomes?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">What you&apos;ll learn</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {c.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={18} className="text-green-600 flex-none mt-0.5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold mb-4">
              Curriculum
              <span className="text-muted font-normal text-base ml-2">
                {modules.length} modules · {allLessons.length} lessons
              </span>
            </h2>
            {modules.length === 0 ? (
              <div className="card p-6 text-muted text-sm">
                Curriculum coming soon.
              </div>
            ) : (
              <CurriculumAccordion modules={modules} enrolled={enrolled} />
            )}
          </section>
        </div>

        {/* Sticky purchase panel */}
        <aside className="lg:col-span-1">
          <div className="card overflow-hidden lg:sticky lg:top-20">
            {c.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.thumbnail_url} alt="" className="aspect-video w-full object-cover" />
            )}
            <div className="p-5">
              <div className="text-3xl font-bold">
                {formatPrice(c.price_cents, c.currency)}
              </div>

              <div className="mt-4">
                {enrolled ? (
                  <Link
                    href={firstLessonId ? `/learn/${firstLessonId}` : "/dashboard"}
                    className="btn-primary w-full text-base py-3"
                  >
                    Go to course →
                  </Link>
                ) : (
                  <EnrollButton
                    courseId={c.id}
                    priceCents={c.price_cents}
                    isAuthed={Boolean(user)}
                    firstLessonId={firstLessonId}
                  />
                )}
              </div>

              <ul className="mt-5 space-y-2.5 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <PlayCircle size={16} /> {allLessons.length} video lessons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Quizzes &amp; assignments
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={16} /> Lifetime access
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
