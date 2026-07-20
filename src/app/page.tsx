import Link from "next/link";
import { ArrowRight, PlayCircle, FileQuestion, ClipboardCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CourseCard } from "@/components/CourseCard";
import { SetupNotice } from "@/components/SetupNotice";
import type { Course } from "@/lib/types";

export default async function HomePage() {
  let courses: Course[] = [];
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    courses = (data as Course[]) ?? [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-[var(--surface)] px-3 py-1 text-sm text-muted mb-6">
            <Sparkles size={14} className="text-brand-500" /> Enterprise-grade, hands-on training
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Learn to build{" "}
            <span className="text-brand-600">real AI &amp; Oracle systems</span>
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl mx-auto">
            Video lessons, interactive quizzes and real enterprise projects — all in
            one place. Learn at your own pace and build a portfolio that ships.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/courses" className="btn-primary text-base px-6 py-3">
              Browse courses <ArrowRight size={18} />
            </Link>
            <Link href="/signup" className="btn-outline text-base px-6 py-3">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-6xl px-4 grid sm:grid-cols-3 gap-4 -mt-4">
        {[
          { icon: PlayCircle, title: "Stream anywhere", body: "Adaptive, protected video that plays smoothly on any device." },
          { icon: FileQuestion, title: "Test yourself", body: "Auto-graded quizzes after every module." },
          { icon: ClipboardCheck, title: "Real projects", body: "Enterprise assignments with instructor feedback." },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <f.icon className="text-brand-600 mb-3" size={24} />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted mt-1">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured courses</h2>
          <Link href="/courses" className="text-brand-600 font-medium hover:underline">
            View all →
          </Link>
        </div>

        {!isSupabaseConfigured ? (
          <SetupNotice />
        ) : courses.length === 0 ? (
          <div className="card p-10 text-center text-muted">
            No published courses yet. Head to the{" "}
            <Link href="/admin" className="text-brand-600 hover:underline">admin panel</Link>{" "}
            to create your first one.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
