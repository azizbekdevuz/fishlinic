import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate token format (UUID)
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Find and validate token
    const verification = await prisma.verificationAttempt.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    if (verification.usedAt) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 400 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    // Mark token as used and user as verified (transaction)
    await prisma.$transaction([
      prisma.verificationAttempt.update({
        where: { id: verification.id },
        data: { usedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { verifiedAt: new Date() }
      })
    ]);

    return NextResponse.json({
      ok: true,
      message: "User verified successfully",
      userId: verification.userId
    });
  } catch (error) {
    console.error("Complete verification error:", error);
    return NextResponse.json(
      { error: "Failed to complete verification" },
      { status: 500 }
    );
  }
}

