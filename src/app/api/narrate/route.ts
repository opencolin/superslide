import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rachel — calm, well-tested narrator voice. Free to swap.
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL = "eleven_turbo_v2_5";

type ElevenLabsErrorBody = {
  detail?: {
    status?: string;
    code?: string;
    message?: string;
  };
};

/**
 * Streams an audio/mpeg response from ElevenLabs.
 *
 * Key resolution: per-request `x-elevenlabs-key` header (BYOK) → server env
 * `ELEVENLABS_API_KEY` (shared) → 401 with `error: "no_key"`.
 *
 * On quota or invalid-key from ElevenLabs we surface a 402 with structured
 * `{ error, message, source }` so the client can prompt the user for their
 * own key. `source` is "user" if their key just failed (so we tell them to
 * top up), or "shared" if the shared key just failed (so we ask them to
 * supply one).
 */
export async function POST(req: NextRequest) {
  let body: { text?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  const voiceId = body.voiceId || DEFAULT_VOICE;
  if (!text) return NextResponse.json({ error: "missing_text" }, { status: 400 });

  const userKey = req.headers.get("x-elevenlabs-key")?.trim() || undefined;
  const key = userKey || process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error: "no_key",
        message: "Narration needs an ElevenLabs key. Paste one to continue.",
        source: "shared" as const,
      },
      { status: 401 },
    );
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: DEFAULT_MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    let err: ElevenLabsErrorBody = {};
    try {
      err = (await res.json()) as ElevenLabsErrorBody;
    } catch {}
    const code = err.detail?.status || err.detail?.code;
    const upstream = err.detail?.message;
    const usedUserKey = !!userKey;

    if (code === "quota_exceeded" || code === "invalid_api_key") {
      return NextResponse.json(
        {
          error: code,
          message: usedUserKey
            ? code === "quota_exceeded"
              ? "Your ElevenLabs key is out of credits. Top up at elevenlabs.io or paste a different key."
              : "That ElevenLabs key was rejected. Paste a valid one."
            : code === "quota_exceeded"
              ? "Our shared ElevenLabs key just ran out of credits. Paste your own key to keep listening."
              : "Our shared ElevenLabs key was rejected. Paste your own key to continue.",
          source: usedUserKey ? ("user" as const) : ("shared" as const),
          upstream,
        },
        { status: 402 },
      );
    }
    return NextResponse.json(
      { error: "tts_failed", message: upstream || res.statusText },
      { status: res.status },
    );
  }

  return new Response(res.body, {
    headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
  });
}
