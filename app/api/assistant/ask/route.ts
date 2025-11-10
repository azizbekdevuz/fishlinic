import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { getAssistantState } from "@/app/lib/assistant-state";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL_ID = process.env.ASSISTANT_MODEL || "qwen2.5:3b";
const TELEMETRY_BASE_URL = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";

// Helper to classify water quality metrics
function classifyPh(ph: number): "good" | "average" | "alert" {
  if (ph < 6.0 || ph > 8.5) return "alert";
  if (ph < 6.5 || ph > 8.0) return "average";
  return "good";
}

function classifyTemp(temp: number): "good" | "average" | "alert" {
  if (temp < 18.0 || temp > 32.0) return "alert";
  if (temp < 20.0 || temp > 30.0) return "average";
  return "good";
}

function classifyDO(doLevel: number): "good" | "average" | "alert" {
  if (doLevel < 3.5) return "alert";
  if (doLevel < 5.0) return "average";
  return "good";
}

async function generateWaterReport(userId?: string): Promise<string | null> {
  try {
    const url = userId 
      ? `${TELEMETRY_BASE_URL}/live?userId=${userId}`
      : `${TELEMETRY_BASE_URL}/live`;
    
    const res = await fetch(url, { 
      signal: AbortSignal.timeout(2000),
      headers: userId ? { "Authorization": `Bearer ${userId}` } : {}
    });
    
    if (!res.ok) return null;
    
    const live = await res.json();
    const ph = live.pH;
    const temp = live.temp_c;
    const dox = live.do_mg_l;
    const qa = live.quality_ai;
    const sa = live.status_ai;
    const ts = live.timestamp;

    const parts: string[] = [];
    const recs: string[] = [];

    if (typeof ph === "number") {
      const phStatus = classifyPh(ph);
      parts.push(`pH ${ph.toFixed(2)} (${phStatus})`);
      if (phStatus === "alert") {
        recs.push("pH out of range — consider a partial water change/buffering.");
      } else if (phStatus === "average") {
        recs.push("pH slightly off ideal — monitor and adjust gradually.");
      }
    }

    if (typeof temp === "number") {
      const f = (temp * 9.0 / 5.0) + 32.0;
      const tempStatus = classifyTemp(temp);
      parts.push(`temperature ${temp.toFixed(1)}°C/${f.toFixed(1)}°F (${tempStatus})`);
      if (tempStatus === "alert") {
        recs.push("Temperature critical — stabilize with heater/cooling and aeration.");
      } else if (tempStatus === "average") {
        recs.push("Temperature near boundary — watch fluctuations.");
      }
    }

    if (typeof dox === "number") {
      const doStatus = classifyDO(dox);
      parts.push(`dissolved oxygen ${dox.toFixed(2)} mg/L (${doStatus})`);
      if (doStatus !== "good") {
        recs.push("Increase aeration/flow if oxygen remains low.");
      }
    }

    if (typeof qa === "number") {
      parts.push(`quality ${qa.toFixed(1)}/10`);
    }

    if (typeof sa === "string") {
      parts.push(`overall ${sa}`);
    }

    // Format timestamp
    let when: string | null = null;
    try {
      if (typeof ts === "string") {
        const dt = new Date(ts);
        const ageS = (Date.now() - dt.getTime()) / 1000;
        if (ageS < 90) {
          when = "just now";
        } else if (ageS < 3600) {
          const mins = Math.floor(ageS / 60);
          when = `${mins} min ago`;
        } else {
          when = dt.toISOString().replace("T", " ").substring(0, 16) + " UTC";
        }
      }
    } catch {}

    let summary = "Water report — " + parts.join(", ") + ".";
    if (when) {
      summary += ` (Updated ${when})`;
    }
    if (recs.length > 0) {
      const tips = [...new Set(recs)].slice(0, 2);
      summary += " Tips: " + tips.join(" ");
    }

    return summary;
  } catch {
    return null;
  }
}

async function askOllama(prompt: string, userId?: string): Promise<string> {
  try {
    // Check if assistant is initiated
    const state = getAssistantState();
    if (!state.initiated) {
      return "Please initiate the assistant first.";
    }

    // Call Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "You are Veronica, an AI assistant for smart aquarium. Only short answers. Only English. Be helpful and concise."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || "I couldn't process that request.";
  } catch (error) {
    console.error("Ollama error:", error);
    return "I'm having trouble connecting to the AI service. Please check if Ollama is running.";
  }
}

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
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: "empty_prompt" },
        { status: 400 }
      );
    }

    // Check if user wants a water report
    const lowerPrompt = prompt.toLowerCase();
    const wantsReport = [
      "water report",
      "status report",
      "aquarium report",
      "report water",
      "report"
    ].some(keyword => lowerPrompt.includes(keyword));

    if (wantsReport) {
      const report = await generateWaterReport(session.user.id);
      if (report) {
        return NextResponse.json({ ok: true, answer: report });
      }
      // Fall through to LLM if report generation fails
    }

    // Use Ollama for general questions
    const answer = await askOllama(prompt, session.user.id);
    return NextResponse.json({ ok: true, answer });
  } catch (error) {
    console.error("Assistant ask error:", error);
    return NextResponse.json(
      { ok: false, error: "ask_failed" },
      { status: 500 }
    );
  }
}

