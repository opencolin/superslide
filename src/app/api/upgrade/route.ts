import { NextRequest, NextResponse } from "next/server";
import { rawDeckSchema } from "@/lib/deck/schema";
import { upgradeRawDeck } from "@/lib/ai/upgrade";
import { getTheme } from "@/lib/themes";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = rawDeckSchema.safeParse(body.raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid raw deck", issues: parsed.error.format() },
      { status: 400 },
    );
  }
  const theme = getTheme(body.themeId);
  try {
    const deck = await upgradeRawDeck(parsed.data, { theme });
    return NextResponse.json(deck);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upgrade failed" },
      { status: 500 },
    );
  }
}
