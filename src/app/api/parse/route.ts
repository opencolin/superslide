import { NextRequest, NextResponse } from "next/server";
import { parsePptx } from "@/lib/deck/parse-pptx";
import { parsePdf } from "@/lib/deck/parse-pdf";
import { parseMarkdown } from "@/lib/deck/parse-markdown";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.name.toLowerCase().split(".").pop();

  try {
    if (ext === "pptx" || ext === "ppt" || ext === "odp" || ext === "key") {
      const raw = await parsePptx(buf, file.name);
      return NextResponse.json(raw);
    }
    if (ext === "pdf") {
      const raw = await parsePdf(buf, file.name);
      return NextResponse.json(raw);
    }
    if (ext === "md" || ext === "markdown" || ext === "mdx") {
      const raw = parseMarkdown(buf, file.name);
      return NextResponse.json(raw);
    }
    return NextResponse.json(
      { error: `Unsupported file type: .${ext ?? "?"}` },
      { status: 415 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 },
    );
  }
}
