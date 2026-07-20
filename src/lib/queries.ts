import { createClient } from "@/lib/supabase/server";
import type {
  Course,
  Module,
  ModuleWithLessons,
  Quiz,
  Assignment,
  Lesson,
} from "@/lib/types";

export interface FullCourse {
  course: Course;
  modules: ModuleWithLessons[];
  quizzes: Quiz[];
  assignments: Assignment[];
  lessons: Lesson[]; // flat, ordered
}

/** Load a course with its modules, lessons, quizzes and assignments (ordered). */
export async function getFullCourse(courseId: string): Promise<FullCourse | null> {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;

  const [{ data: modulesData }, { data: quizzes }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", courseId)
        .order("position", { ascending: true }),
      supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .order("position", { ascending: true }),
      supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("position", { ascending: true }),
    ]);

  const modules: ModuleWithLessons[] = (
    (modulesData ?? []) as (Module & { lessons: Lesson[] })[]
  ).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.position - b.position),
  }));

  return {
    course: course as Course,
    modules,
    quizzes: (quizzes as Quiz[]) ?? [],
    assignments: (assignments as Assignment[]) ?? [],
    lessons: modules.flatMap((m) => m.lessons),
  };
}
