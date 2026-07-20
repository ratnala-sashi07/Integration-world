import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CourseCard } from "@/components/CourseCard";
import { SetupNotice } from "@/components/SetupNotice";
import type { Course } from "@/lib/types";

export const metadata = { title: "Courses · Integration World" };

export default async function CoursesPage() {
  let courses: Course[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    courses = (data as Course[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">All courses</h1>
        <p className="text-muted mt-1">
          Hands-on programs to build real, production-grade skills.
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <SetupNotice />
      ) : courses.length === 0 ? (
        <div className="card p-10 text-center text-muted">No published courses yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
