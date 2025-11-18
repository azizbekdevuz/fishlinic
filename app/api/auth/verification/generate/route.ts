import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already verified
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { verifiedAt: true }
    });

    if (user?.verifiedAt) {
      return NextResponse.json(
        { error: "User already verified" },
        { status: 400 }
      );
    }

    // Delete any existing unused tokens for this user
    await prisma.verificationAttempt.deleteMany({
      where: {
        userId: session.user.id,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    // Generate new token (UUID)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in database
    await prisma.verificationAttempt.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt
      }
    });

    // Generate QR code URL (just the token, Python VA will extract userId from DB)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verification/status?token=${token}`;

    return NextResponse.json({
      ok: true,
      token,
      verifyUrl,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 300 // seconds
    });
  } catch (error) {
    console.error("Generate verification error:", error);
    return NextResponse.json(
      { error: "Failed to generate verification token" },
      { status: 500 }
    );
  }
}

