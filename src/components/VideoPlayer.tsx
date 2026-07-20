"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { PlayCircle } from "lucide-react";

async function saveProgress(lessonId: string, position: number, completed: boolean) {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, position: Math.floor(position), completed }),
    });
  } catch {
    /* best-effort */
  }
}

export function VideoPlayer({
  playbackId,
  token,
  lessonId,
  title,
  initialPosition = 0,
}: {
  playbackId: string | null;
  token?: string | null;
  lessonId: string;
  title: string;
  initialPosition?: number;
}) {
  const lastSaved = useRef(0);
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const router = useRouter();
  const [ended, setEnded] = useState(false);

  const onTimeUpdate = useCallback(() => {
    const t = playerRef.current?.currentTime ?? 0;
    if (t - lastSaved.current >= 15) {
      lastSaved.current = t;
      saveProgress(lessonId, t, false);
    }
  }, [lessonId]);

  const onEnded = useCallback(() => {
    setEnded(true);
    saveProgress(lessonId, 0, true);
    router.refresh();
  }, [lessonId, router]);

  if (!playbackId) {
    return (
      <div className="aspect-video w-full grid place-items-center rounded-xl bg-brand-900 text-brand-200">
        <div className="text-center">
          <PlayCircle size={40} className="mx-auto mb-2 opacity-70" />
          <p className="text-sm">Video not uploaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        tokens={token ? { playback: token } : undefined}
        metadata={{ video_title: title }}
        startTime={initialPosition}
        streamType="on-demand"
        accentColor="#1f4c82"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        style={{ aspectRatio: "16 / 9", width: "100%" }}
      />
      {ended && (
        <div className="hidden" aria-live="polite">
          Lesson complete
        </div>
      )}
    </div>
  );
}
