import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// Simple in-memory rate limiting (use Redis in production)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 10) { // Max 10 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    // Validate token format (UUID)
    if (!token || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(token)) {
      return NextResponse.json(
        { valid: false, error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Find token in database
    const verification = await prisma.verificationAttempt.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            verifiedAt: true
          }
        }
      }
    });

    // Token doesn't exist
    if (!verification) {
      return NextResponse.json({
        valid: false,
        error: "Token not found"
      });
    }

    // Already used
    if (verification.usedAt) {
      return NextResponse.json({
        valid: false,
        error: "Token already used",
        used: true
      });
    }

    // Expired
    if (new Date() > verification.expiresAt) {
      // Cleanup expired token
      await prisma.verificationAttempt.update({
        where: { id: verification.id },
        data: { usedAt: new Date() }
      });

      return NextResponse.json({
        valid: false,
        error: "Token expired",
        expired: true
      });
    }

    // Valid token - return userId for Python VA to verify
    return NextResponse.json({
      valid: true,
      userId: verification.userId,
      userEmail: verification.user.email,
      expiresAt: verification.expiresAt.toISOString(),
      expiresIn: Math.max(0, Math.floor((verification.expiresAt.getTime() - Date.now()) / 1000))
    });
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

