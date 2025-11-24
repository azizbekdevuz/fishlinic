import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { TelemetryWhereInput } from "@/app/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Build query conditions
    const whereConditions: TelemetryWhereInput = {};
    
    // Filter by user if provided
    if (userId) {
      whereConditions.userId = userId;
    }

    // Get the most recent telemetry reading
    const latestTelemetry = await prisma.telemetry.findFirst({
      where: whereConditions,
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!latestTelemetry) {
      return NextResponse.json(
        { error: "No telemetry data found" },
        { status: 404 }
      );
    }

    return NextResponse.json(latestTelemetry);

  } catch (error) {
    console.error("Latest telemetry fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest telemetry data" },
      { status: 500 }
    );
  }
}
