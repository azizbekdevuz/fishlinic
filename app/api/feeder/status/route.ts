import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/app/lib/rate-limit";

const MOCK_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : null;

async function proxyGet(url: string, endpoint: string): Promise<Response> {
  const res = await fetch(`${url}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  const data = await res.json().catch(() => ({ error: "Invalid response" }));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: NextRequest) {
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
        }
      }
    );
  }
  
  // Try Vercel URL first, then localhost, then error
  if (VERCEL_URL) {
    try {
      const res = await proxyGet(VERCEL_URL, "/status");
      if (res.ok) return res;
    } catch (e) {
      console.warn("[feeder] Vercel proxy failed, trying localhost:", e);
    }
  }
  
  // Fallback to localhost
  try {
    return await proxyGet(MOCK_SERVER_URL, "/status");
  } catch (e) {
    console.error("[feeder] Localhost proxy failed:", e);
    return NextResponse.json(
      { status: "error", error: "Feeder service unavailable" },
      { status: 503 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

