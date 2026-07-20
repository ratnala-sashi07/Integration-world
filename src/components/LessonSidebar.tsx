"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle, FileQuestion, ClipboardList, ArrowLeft } from "lucide-react";
import type { ModuleWithLessons, Quiz, Assignment, Course } from "@/lib/types";

export function LessonSidebar({
  course,
  modules,
  quizzes,
  assignments,
  completedLessonIds,
  currentLessonId,
}: {
  course: Course;
  modules: ModuleWithLessons[];
  quizzes: Quiz[];
  assignments: Assignment[];
  completedLessonIds: string[];
  currentLessonId?: string;
}) {
  const pathname = usePathname();
  const completed = new Set(completedLessonIds);
  const total = modules.reduce((n, m) => n + m.lessons.length, 0);
  const done = completedLessonIds.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <Link href={`/courses/${course.slug}`} className="flex items-center gap-1.5 text-sm text-muted hover:text-brand-600">
          <ArrowLeft size={15} /> Back to course
        </Link>
        <h2 className="font-semibold mt-2 leading-snug">{course.title}</h2>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>{pct}% complete</span>
            <span>{done}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {modules.map((m, i) => (
          <div key={m.id} className="mb-2">
            <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {i + 1}. {m.title}
            </div>
            <ul>
              {m.lessons.map((l) => {
                const active = l.id === currentLessonId;
                const isDone = completed.has(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${l.id}`}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                        active ? "bg-brand-100 text-brand-800 font-medium" : "hover:bg-black/[.04]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-green-600 flex-none" />
                      ) : active ? (
                        <PlayCircle size={16} className="text-brand-600 flex-none" />
                      ) : (
                        <Circle size={16} className="text-muted flex-none" />
                      )}
                      <span className="flex-1 leading-snug">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {quizzes.length > 0 && (
          <Section title="Quizzes">
            {quizzes.map((q) => (
              <SideLink key={q.id} href={`/quiz/${q.id}`} active={pathname === `/quiz/${q.id}`} icon={<FileQuestion size={16} />}>
                {q.title}
              </SideLink>
            ))}
          </Section>
        )}

        {assignments.length > 0 && (
          <Section title="Assignments">
            {assignments.map((a) => (
              <SideLink key={a.id} href={`/assignment/${a.id}`} active={pathname === `/assignment/${a.id}`} icon={<ClipboardList size={16} />}>
                {a.title}
              </SideLink>
            ))}
          </Section>
        )}
      </nav>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 border-t pt-2">
      <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
      <ul>{children}</ul>
    </div>
  );
}

function SideLink({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
          active ? "bg-brand-100 text-brand-800 font-medium" : "hover:bg-black/[.04]"
        }`}
      >
        <span className="text-brand-600 flex-none">{icon}</span>
        <span className="flex-1 leading-snug">{children}</span>
      </Link>
    </li>
  );
}
