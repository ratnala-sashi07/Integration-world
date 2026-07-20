"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, CheckCircle2, UploadCloud } from "lucide-react";

// Load client-side only (it registers a custom element that touches `window`).
const MuxUploader = dynamic(() => import("@mux/mux-uploader-react"), { ssr: false });

type Status = "idle" | "uploading" | "finalizing" | "done" | "error";

export function LessonVideoUploader({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const uploadIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Called by MuxUploader to get the upload URL just before uploading.
  async function createUpload(): Promise<string> {
    setStatus("uploading");
    setMessage(null);
    const res = await fetch("/api/mux/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Could not start upload.");
      throw new Error(data.error || "upload init failed");
    }
    uploadIdRef.current = data.id;
    return data.url as string;
  }

  async function onSuccess() {
    setStatus("finalizing");
    for (let i = 0; i < 12; i++) {
      const res = await fetch("/api/mux/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: uploadIdRef.current, lessonId }),
      });
      if (res.status === 202) {
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage("Uploaded! Mux is processing it — playable in ~1 minute.");
        router.refresh();
        return;
      }
      setStatus("error");
      setMessage(data.error || "Could not finalize the upload.");
      return;
    }
    setStatus("error");
    setMessage("Timed out waiting for Mux to process the upload.");
  }

  return (
    <div className="mt-2">
      <MuxUploader
        endpoint={createUpload}
        onSuccess={onSuccess}
        onUploadError={() => {
          setStatus("error");
          setMessage("Upload failed — please try again.");
        }}
        style={
          {
            // minimal, themed look
            "--uploader-font-size": "13px",
            "--button-background-color": "#1f4c82",
            "--button-border-radius": "8px",
            width: "100%",
          } as React.CSSProperties
        }
      >
        <span slot="heading" className="text-sm">
          <UploadCloud size={16} className="inline mr-1 -mt-0.5" />
          Drag a video here, or click to choose a file from your computer
        </span>
      </MuxUploader>

      {status === "finalizing" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-600">
          <Loader2 size={14} className="animate-spin" /> Finishing up…
        </p>
      )}
      {status === "done" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 size={14} /> {message}
        </p>
      )}
      {status === "error" && message && (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
