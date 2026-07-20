import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { mux } from "@/lib/mux";
import { isMuxConfigured, isMuxSigningConfigured } from "@/lib/env";

/** Create a Mux direct upload for an admin to upload a video file from their PC. */
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  if (!isMuxConfigured) {
    return NextResponse.json({ error: "Mux is not configured." }, { status: 503 });
  }

  const origin =
    req.headers.get("origin") ??
    (req.headers.get("host") ? `https://${req.headers.get("host")}` : "*");

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: origin,
      new_asset_settings: {
        playback_policy: [isMuxSigningConfigured ? "signed" : "public"],
        encoding_tier: "smart",
      },
    });
    return NextResponse.json({ url: upload.url, id: upload.id });
  } catch (err) {
    // Surface Mux's real message (e.g. free-plan asset limit) as clean JSON.
    const anyErr = err as { message?: string; error?: { messages?: string[] } };
    const message =
      anyErr?.error?.messages?.join(" ") ||
      anyErr?.message ||
      "Could not start the upload.";
    console.error("Mux upload create error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
