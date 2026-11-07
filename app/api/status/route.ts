import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasKey = Boolean(process.env.FAL_KEY?.trim());
  return NextResponse.json({
    provider: hasKey ? "fal" : "demo",
    ready: true,
    demo: !hasKey,
  });
}
