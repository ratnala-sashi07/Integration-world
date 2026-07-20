"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { AdminLessonRow } from "@/components/admin/AdminLessonRow";
import { addLesson, deleteModule } from "@/app/admin/actions";
import type { Lesson, Module } from "@/lib/types";

export function AdminModule({
  module,
  courseId,
  index,
  defaultOpen = false,
}: {
  module: Module & { lessons: Lesson[] };
  courseId: string;
  index: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
        >
          <ChevronDown
            size={18}
            className={`flex-none text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
            {index + 1}
          </span>
          <span className="font-semibold truncate">{module.title}</span>
          <span className="text-xs text-muted flex-none">
            {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </button>
        <form action={deleteModule.bind(null, module.id, courseId)}>
          <button className="btn-ghost text-red-600 px-2 py-1.5" title="Delete module">
            <Trash2 size={16} />
          </button>
        </form>
      </div>

      {open && (
        <div className="border-t p-4">
          <ul className="space-y-2 mb-4">
            {module.lessons.map((l) => (
              <AdminLessonRow key={l.id} lesson={l} courseId={courseId} />
            ))}
            {module.lessons.length === 0 && (
              <li className="text-sm text-muted py-2">No lessons yet — add one below.</li>
            )}
          </ul>

          <form action={addLesson} className="flex flex-wrap items-end gap-2 border-t pt-3">
            <input type="hidden" name="moduleId" value={module.id} />
            <input type="hidden" name="courseId" value={courseId} />
            <input
              name="title"
              className="input py-2 flex-1 min-w-48"
              placeholder="New lesson title"
              required
            />
            <label className="flex items-center gap-1.5 text-sm px-1">
              <input type="checkbox" name="is_preview" /> Free
            </label>
            <button className="btn-primary py-2">
              <Plus size={16} /> Add lesson
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
