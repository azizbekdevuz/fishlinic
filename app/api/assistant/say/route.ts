import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";

// TTS is handled client-side using Web Speech API
// This endpoint just confirms the request was received
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const text = String(body.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "empty_text" },
        { status: 400 }
      );
    }

    // TTS will be handled client-side using browser Web Speech API
    // This endpoint just acknowledges the request
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Assistant say error:", error);
    return NextResponse.json(
      { ok: false, error: "say_failed" },
      { status: 500 }
    );
  }
}

