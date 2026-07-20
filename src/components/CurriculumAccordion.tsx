"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PlayCircle, Lock, CheckCircle2 } from "lucide-react";
import type { ModuleWithLessons } from "@/lib/types";
import { formatDuration } from "@/lib/format";

export function CurriculumAccordion({
  modules,
  enrolled,
  completedLessonIds = [],
}: {
  modules: ModuleWithLessons[];
  enrolled: boolean;
  completedLessonIds?: string[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((m, i) => [m.id, i === 0]))
  );
  const completed = new Set(completedLessonIds);

  return (
    <div className="space-y-3">
      {modules.map((m, i) => {
        const lessonCount = m.lessons.length;
        const isOpen = open[m.id];
        return (
          <div key={m.id} className="card overflow-hidden">
            <button
              onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
              className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-black/[.02]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="font-semibold truncate">{m.title}</span>
              </div>
              <div className="flex items-center gap-3 flex-none text-sm text-muted">
                <span className="hidden sm:inline">{lessonCount} lessons</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isOpen && (
              <ul className="border-t divide-y">
                {m.lessons.map((l) => {
                  const canWatch = enrolled || l.is_preview;
                  const done = completed.has(l.id);
                  const Row = (
                    <div className="flex items-center gap-3 p-3.5 pl-5 text-sm">
                      {done ? (
                        <CheckCircle2 size={18} className="text-green-600 flex-none" />
                      ) : canWatch ? (
                        <PlayCircle size={18} className="text-brand-600 flex-none" />
                      ) : (
                        <Lock size={16} className="text-muted flex-none" />
                      )}
                      <span className={`flex-1 ${canWatch ? "" : "text-muted"}`}>
                        {l.title}
                      </span>
                      {l.is_preview && !enrolled && (
                        <span className="rounded bg-brand-100 text-brand-700 px-1.5 py-0.5 text-xs font-medium">
                          Preview
                        </span>
                      )}
                      {l.duration_seconds > 0 && (
                        <span className="text-muted text-xs">
                          {formatDuration(l.duration_seconds)}
                        </span>
                      )}
                    </div>
                  );
                  return (
                    <li key={l.id}>
                      {canWatch ? (
                        <Link href={`/learn/${l.id}`} className="block hover:bg-black/[.02]">
                          {Row}
                        </Link>
                      ) : (
                        Row
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
