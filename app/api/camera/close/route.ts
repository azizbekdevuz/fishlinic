import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getAssistantState, setAssistantState } from "@/app/lib/assistant-state";

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const state = getAssistantState();
    if (!state.cameraRunning) {
      return NextResponse.json({
        ok: true,
        message: "camera_not_running"
      });
    }

    setAssistantState({ cameraRunning: false });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Camera close error:", error);
    return NextResponse.json(
      { ok: false, error: "camera_close_failed" },
      { status: 500 }
    );
  }
}

