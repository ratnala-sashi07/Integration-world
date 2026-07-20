"use client";

import { useState } from "react";
import { Trash2, Video, CheckCircle2, Lock, Unlock, UploadCloud } from "lucide-react";
import { LessonVideoUploader } from "@/components/LessonVideoUploader";
import { deleteLesson, toggleLessonPreview } from "@/app/admin/actions";
import type { Lesson } from "@/lib/types";

export function AdminLessonRow({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const [showUploader, setShowUploader] = useState(false);
  const hasVideo = Boolean(lesson.mux_playback_id);

  return (
    <li className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {hasVideo ? (
            <CheckCircle2 size={16} className="text-green-600 flex-none" />
          ) : (
            <Video size={16} className="text-muted flex-none" />
          )}
          <span className="truncate font-medium">{lesson.title}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-none">
          {/* Free / Locked toggle */}
          <form action={toggleLessonPreview.bind(null, lesson.id, courseId, !lesson.is_preview)}>
            <button
              type="submit"
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                lesson.is_preview
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-black/5 text-muted hover:bg-black/10"
              }`}
              title={lesson.is_preview ? "Free preview — click to lock" : "Locked — click to make free"}
            >
              {lesson.is_preview ? <Unlock size={12} /> : <Lock size={12} />}
              {lesson.is_preview ? "Free" : "Locked"}
            </button>
          </form>

          <button
            onClick={() => setShowUploader((s) => !s)}
            className="btn-outline text-xs py-1.5 px-2.5"
          >
            <UploadCloud size={14} /> {hasVideo ? "Replace" : "Add video"}
          </button>

          <form action={deleteLesson.bind(null, lesson.id, courseId)}>
            <button className="btn-ghost text-red-600 px-2 py-1.5" title="Delete lesson">
              <Trash2 size={15} />
            </button>
          </form>
        </div>
      </div>

      {hasVideo && !showUploader && (
        <p className="mt-1.5 text-xs text-green-700 pl-6">
          ✓ Video attached ({lesson.mux_playback_id!.slice(0, 12)}…)
        </p>
      )}

      {/* The heavy uploader only mounts when requested — keeps the page fast */}
      {showUploader && <LessonVideoUploader lessonId={lesson.id} />}
    </li>
  );
}
