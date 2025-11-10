import { NextResponse } from "next/server";
import { getAssistantState } from "@/app/lib/assistant-state";

export async function GET() {
  const state = getAssistantState();
  return NextResponse.json({
    initiated: state.initiated,
    camera_running: state.cameraRunning,
    model_id: state.modelId
  });
}

