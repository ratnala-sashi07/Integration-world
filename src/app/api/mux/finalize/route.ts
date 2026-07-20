import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { mux } from "@/lib/mux";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMuxConfigured } from "@/lib/env";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * After a direct upload finishes, resolve the created asset + playback id and
 * attach them to the lesson. Body: { uploadId, lessonId }.
 */
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!isMuxConfigured) {
    return NextResponse.json({ error: "Mux is not configured." }, { status: 503 });
  }

  const { uploadId, lessonId } = await req.json();
  if (!uploadId || !lessonId) {
    return NextResponse.json({ error: "Missing uploadId or lessonId" }, { status: 400 });
  }

  // The asset id appears on the upload shortly after the file finishes uploading.
  let assetId: string | null = null;
  for (let i = 0; i < 12; i++) {
    const upload = await mux.video.uploads.retrieve(uploadId);
    if (upload.asset_id) {
      assetId = upload.asset_id;
      break;
    }
    await sleep(2000);
  }
  if (!assetId) {
    return NextResponse.json({ error: "Upload still processing — try again shortly." }, { status: 202 });
  }

  const asset = await mux.video.assets.retrieve(assetId);
  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  const admin = createAdminClient();
  await admin
    .from("lessons")
    .update({
      mux_asset_id: assetId,
      mux_playback_id: playbackId,
      duration_seconds: asset.duration ? Math.round(asset.duration) : 0,
    })
    .eq("id", lessonId);

  return NextResponse.json({ ok: true, playbackId, status: asset.status });
}
