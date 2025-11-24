import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get total readings count
    const totalReadings = await prisma.telemetry.count({
      where: { userId }
    });

    // Get readings from last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const readingsLast24h = await prisma.telemetry.count({
      where: {
        userId,
        timestamp: { gte: last24h }
      }
    });

    // Get readings from last 7 days
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const readingsLast7d = await prisma.telemetry.count({
      where: {
        userId,
        timestamp: { gte: last7d }
      }
    });

    // Get average quality score
    const qualityStats = await prisma.telemetry.aggregate({
      where: {
        userId,
        quality_ai: { not: null }
      },
      _avg: {
        quality_ai: true
      }
    });

    // Get last activity (most recent telemetry reading)
    const lastReading = await prisma.telemetry.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    });

    // Calculate account age
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });

    const accountAge = user?.createdAt 
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const stats = {
      totalReadings,
      readingsLast24h,
      readingsLast7d,
      averageQuality: qualityStats._avg.quality_ai || 0,
      lastActivity: lastReading?.timestamp?.toISOString() || null,
      accountAge
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
