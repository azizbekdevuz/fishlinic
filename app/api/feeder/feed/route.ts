import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { checkRateLimit } from "@/app/lib/rate-limit";

const MOCK_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : null;

type FeedRequest = {
  duration?: number;
  source?: string;
};

async function proxyToMockServer(url: string, body: FeedRequest, userId?: string): Promise<Response> {
  const requestBody = userId ? { ...body, userId } : body;
  
  const res = await fetch(`${url}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  
  const data = await res.json().catch(() => ({ error: "Invalid response" }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        status: "error", 
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: rateLimit.retryAfter 
      },
      { 
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter || 60),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
        }
      }
    );
  }
  
  // Get authenticated user (if any)
  const session = await getSession();
  const userId = session?.user?.id;
  
  try {
    const body = await request.json();
    
    // Try Vercel URL first, then localhost, then error
    if (VERCEL_URL) {
      try {
        const res = await proxyToMockServer(VERCEL_URL, body, userId);
        if (res.ok) return res;
        // If Vercel fails, try localhost
      } catch (e) {
        console.warn("[feeder] Vercel proxy failed, trying localhost:", e);
      }
    }
    
    // Fallback to localhost
    try {
      return await proxyToMockServer(MOCK_SERVER_URL, body, userId);
    } catch (e) {
      console.error("[feeder] Localhost proxy failed:", e);
      return NextResponse.json(
        { status: "error", error: "Feeder service unavailable" },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { status: "error", error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

