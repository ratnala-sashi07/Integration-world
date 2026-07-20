import Mux from "@mux/mux-node";
import { env } from "@/lib/env";

/** Server-side Mux client. Guard call sites with isMuxConfigured. */
// Fallback placeholders keep `new Mux()` from throwing at import time when keys
// aren't set yet. Guard real calls with isMuxConfigured.
export const mux = new Mux({
  tokenId: env.muxTokenId || "placeholder",
  tokenSecret: env.muxTokenSecret || "placeholder",
});

/**
 * Create a signed JWT for a private Mux playback id. The player uses this as
 * the `?token=` query param, so paid videos can't be watched by simply sharing
 * a playback id. Tokens are short-lived.
 */
export async function signPlaybackToken(
  playbackId: string,
  type: "video" | "thumbnail" | "storyboard" = "video",
  expiresInSeconds = 60 * 60 * 3 // 3 hours
) {
  return mux.jwt.signPlaybackId(playbackId, {
    keyId: env.muxSigningKeyId,
    keySecret: env.muxSigningPrivateKey,
    expiration: `${expiresInSeconds}s`,
    type,
  });
}
