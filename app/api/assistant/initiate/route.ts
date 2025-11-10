import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { setAssistantState } from "@/app/lib/assistant-state";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    setAssistantState({ initiated: true });

    return NextResponse.json({
      ok: true,
      message: "Veronica initiated"
    });
  } catch (error) {
    console.error("Assistant initiate error:", error);
    return NextResponse.json(
      { ok: false, error: "initiate_failed" },
      { status: 500 }
    );
  }
}

