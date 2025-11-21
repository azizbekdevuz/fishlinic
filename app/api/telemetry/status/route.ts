import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Get database statistics
    const totalRecords = await prisma.telemetry.count();
    const latestRecord = await prisma.telemetry.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, pH: true, temp_c: true, do_mg_l: true }
    });

    const oldestRecord = await prisma.telemetry.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true }
    });

    // Get records from last 24 hours
    const last24h = await prisma.telemetry.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      database: {
        totalRecords,
        recordsLast24h: last24h,
        latestRecord,
        oldestRecord,
        isActive: totalRecords > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Telemetry status error:", error);
    return NextResponse.json(
      { error: "Failed to get telemetry status" },
      { status: 500 }
    );
  }
}
