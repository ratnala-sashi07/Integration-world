import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Trash2, Video, CheckCircle2, FileQuestion, ClipboardList, Eye } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMuxConfigured } from "@/lib/env";
import {
  updateCourse,
  togglePublish,
  deleteCourse,
  addModule,
  deleteModule,
  addLesson,
  deleteLesson,
  ingestLessonVideo,
  createQuiz,
  createAssignment,
} from "@/app/admin/actions";
import type { Course, Quiz, Assignment, Module, Lesson } from "@/lib/types";

export default async function CourseEditor({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const admin = createAdminClient();

  const { data: course } = await admin.from("courses").select("*").eq("id", courseId).maybeSingle();
  if (!course) notFound();
  const c = course as Course;

  const { data: modulesData } = await admin
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  const modules = ((modulesData ?? []) as (Module & { lessons: Lesson[] })[]).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  const { data: quizzes } = await admin
    .from("quizzes")
    .select("*")
    .eq("course_id", courseId)
    .order("position");
  const { data: assignments } = await admin
    .from("assignments")
    .select("*")
    .eq("course_id", courseId)
    .order("position");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-brand-600">
            ← All courses
          </Link>
          <h1 className="text-2xl font-bold mt-1">{c.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {c.published && (
            <Link href={`/courses/${c.slug}`} className="btn-ghost">
              <Eye size={16} /> View
            </Link>
          )}
          <form action={togglePublish.bind(null, courseId, !c.published)}>
            <button className={c.published ? "btn-outline" : "btn-primary"}>
              {c.published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      {!isMuxConfigured && (
        <div className="card border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Mux isn&apos;t configured yet — add your Mux keys to <code>.env.local</code> to attach
          videos. You can still paste a Mux playback ID manually per lesson.
        </div>
      )}

      {/* Details */}
      <section className="card p-6">
        <h2 className="font-semibold mb-4">Course details</h2>
        <form action={updateCourse} className="grid sm:grid-cols-2 gap-4">
          <input type="hidden" name="id" value={c.id} />
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input name="title" className="input" defaultValue={c.title} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Subtitle</label>
            <input name="subtitle" className="input" defaultValue={c.subtitle ?? ""} />
          </div>
          <div>
            <label className="label">Instructor</label>
            <input name="instructor" className="input" defaultValue={c.instructor_name ?? ""} />
          </div>
          <div>
            <label className="label">Duration (text)</label>
            <input name="duration_hours" className="input" defaultValue={c.duration_hours ?? ""} placeholder="50–70 hours" />
          </div>
          <div>
            <label className="label">Price</label>
            <input name="price" type="number" step="0.01" min="0" className="input" defaultValue={(c.price_cents / 100).toString()} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input name="currency" className="input" defaultValue={c.currency} />
          </div>
          <div>
            <label className="label">Level</label>
            <select name="level" className="input" defaultValue={c.level ?? "beginner"}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label">Thumbnail URL</label>
            <input name="thumbnail_url" className="input" defaultValue={c.thumbnail_url ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" className="input min-h-28" defaultValue={c.description ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">What you&apos;ll learn (one per line)</label>
            <textarea
              name="outcomes"
              className="input min-h-28"
              defaultValue={(c.outcomes ?? []).join("\n")}
            />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary">Save details</button>
          </div>
        </form>
      </section>

      {/* Curriculum */}
      <section>
        <h2 className="font-semibold mb-4">Curriculum</h2>
        <div className="space-y-4">
          {modules.map((m, mi) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-semibold">
                  {mi + 1}. {m.title}
                </h3>
                <form action={deleteModule.bind(null, m.id, courseId)}>
                  <button className="btn-ghost text-red-600" title="Delete module">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>

              {/* Lessons */}
              <ul className="space-y-2 mb-4">
                {m.lessons.map((l) => (
                  <li key={l.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {l.mux_playback_id ? (
                          <CheckCircle2 size={16} className="text-green-600 flex-none" />
                        ) : (
                          <Video size={16} className="text-muted flex-none" />
                        )}
                        <span className="truncate">{l.title}</span>
                        {l.is_preview && (
                          <span className="rounded bg-brand-100 text-brand-700 px-1.5 py-0.5 text-xs">
                            preview
                          </span>
                        )}
                      </div>
                      <form action={deleteLesson.bind(null, l.id, courseId)}>
                        <button className="btn-ghost text-red-600" title="Delete lesson">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>

                    {/* Attach video via URL (Drive/any) */}
                    <form action={ingestLessonVideo} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="lessonId" value={l.id} />
                      <input type="hidden" name="courseId" value={courseId} />
                      <input
                        name="url"
                        className="input flex-1 min-w-52 text-xs py-1.5"
                        placeholder={
                          l.mux_playback_id
                            ? `Playback: ${l.mux_playback_id.slice(0, 12)}… (paste a new source URL to replace)`
                            : "Paste a direct video URL (e.g. shared Drive link) to upload to Mux"
                        }
                      />
                      <button className="btn-outline text-xs py-1.5" disabled={!isMuxConfigured}>
                        Upload to Mux
                      </button>
                    </form>
                  </li>
                ))}
              </ul>

              {/* Add lesson */}
              <form action={addLesson} className="grid sm:grid-cols-[1fr_auto] gap-2 items-end border-t pt-3">
                <input type="hidden" name="moduleId" value={m.id} />
                <input type="hidden" name="courseId" value={courseId} />
                <div className="grid sm:grid-cols-3 gap-2">
                  <input name="title" className="input py-2 sm:col-span-2" placeholder="New lesson title" required />
                  <input name="duration" type="number" min="0" className="input py-2" placeholder="secs" />
                  <label className="flex items-center gap-2 text-sm sm:col-span-3">
                    <input type="checkbox" name="is_preview" /> Free preview
                  </label>
                </div>
                <button className="btn-outline">
                  <Plus size={16} /> Add lesson
                </button>
              </form>
            </div>
          ))}

          {/* Add module */}
          <form action={addModule} className="card p-4 flex gap-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input name="title" className="input" placeholder="New module title" required />
            <button className="btn-primary flex-none">
              <Plus size={16} /> Add module
            </button>
          </form>
        </div>
      </section>

      {/* Quizzes + Assignments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <FileQuestion size={18} /> Quizzes
          </h2>
          <ul className="space-y-2 mb-3">
            {((quizzes as Quiz[]) ?? []).map((q) => (
              <li key={q.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                <span>{q.title}</span>
                <Link href={`/admin/courses/${courseId}/quiz/${q.id}`} className="btn-outline text-xs py-1">
                  Edit questions
                </Link>
              </li>
            ))}
          </ul>
          <form action={createQuiz} className="flex gap-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input name="title" className="input py-2" placeholder="New quiz title" required />
            <button className="btn-outline flex-none">
              <Plus size={16} />
            </button>
          </form>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <ClipboardList size={18} /> Assignments
          </h2>
          <ul className="space-y-2 mb-3">
            {((assignments as Assignment[]) ?? []).map((a) => (
              <li key={a.id} className="rounded-lg border p-2.5 text-sm">
                {a.title}
              </li>
            ))}
          </ul>
          <form action={createAssignment} className="space-y-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input name="title" className="input py-2" placeholder="Assignment title" required />
            <textarea name="instructions" className="input min-h-20" placeholder="Instructions…" />
            <button className="btn-outline">
              <Plus size={16} /> Add assignment
            </button>
          </form>
        </section>
      </div>

      {/* Danger zone */}
      <section className="card border-red-200 p-5">
        <h2 className="font-semibold text-red-700 mb-2">Danger zone</h2>
        <form action={deleteCourse.bind(null, courseId)}>
          <button className="btn-outline text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 size={16} /> Delete this course
          </button>
        </form>
      </section>
    </div>
  );
}
