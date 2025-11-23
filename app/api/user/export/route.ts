import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        verifiedAt: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch telemetry data
    const telemetryData = await prisma.telemetry.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        timestamp: true,
        pH: true,
        temp_c: true,
        do_mg_l: true,
        fish_health: true,
        quality_ai: true,
        status_ai: true
      }
    });

    // Fetch verification attempts
    const verificationAttempts = await prisma.verificationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        usedAt: true,
        expiresAt: true
      }
    });

    // Compile export data
    const exportData = {
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        version: "1.0"
      },
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        verifiedAt: user.verifiedAt
      },
      telemetryData: {
        totalReadings: telemetryData.length,
        readings: telemetryData
      },
      verificationHistory: {
        totalAttempts: verificationAttempts.length,
        attempts: verificationAttempts
      },
      settings: {
        // Note: Settings are stored in localStorage, not in database
        note: "Dashboard settings are stored locally in your browser and not included in this export"
      }
    };

    // Create JSON response
    const jsonData = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonData, 'utf-8');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="account-data-${user.email}-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
