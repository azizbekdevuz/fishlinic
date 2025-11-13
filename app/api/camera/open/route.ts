import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getAssistantState, setAssistantState } from "@/app/lib/assistant-state";

// Camera functionality - simplified for web
// In a web environment, camera is typically accessed via browser APIs
// This endpoint just tracks the state

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
    if (state.cameraRunning) {
      return NextResponse.json({
        ok: true,
        message: "camera_already_running"
      });
    }

    // In web environment, camera is accessed via browser getUserMedia
    // This just tracks the state - actual camera access is client-side
    setAssistantState({ cameraRunning: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Camera open error:", error);
    return NextResponse.json(
      { ok: false, error: "camera_launch_failed" },
      { status: 500 }
    );
  }
}

