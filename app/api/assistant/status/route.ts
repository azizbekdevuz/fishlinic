import { NextResponse } from "next/server";
import { getAssistantState } from "@/app/lib/assistant-state";

export async function GET() {
  const state = getAssistantState();
  
  // Debug info to help diagnose Ollama connectivity issues
  const rawOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaUrl = rawOllamaUrl.replace(/\/+$/, ""); // Remove trailing slash
  const ollamaConfigured = !!process.env.OLLAMA_URL;
  
  return NextResponse.json({
    initiated: state.initiated,
    camera_running: state.cameraRunning,
    model_id: state.modelId,
    // Debug info (remove in production if sensitive)
    debug: {
      ollama_url: ollamaUrl,
      ollama_configured: ollamaConfigured,
      node_env: process.env.NODE_ENV,
    }
  });
}

