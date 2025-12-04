import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Telemetry } from "@prisma/client";
import { TelemetryWhereInput } from "@/app/lib/types";

// Rate limiting for telemetry data (in-memory, simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 1000; // Max 1000 requests per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate required fields - need timestamp and at least one of pH or do_mg_l
    // (pH=0 and do_mg_l=0 are valid values, so use explicit null/undefined checks)
    const hasPH = body.pH !== undefined && body.pH !== null;
    const hasDO = body.do_mg_l !== undefined && body.do_mg_l !== null;
    const hasTimestamp = !!body.timestamp;
    
    if (!hasTimestamp || (!hasPH && !hasDO)) {
      return NextResponse.json(
        { error: "Missing required fields: timestamp and at least one of pH or do_mg_l" },
        { status: 400 }
      );
    }

    // Handle single telemetry record or array
    const telemetryData = Array.isArray(body) ? body : [body];
    
    // Validate and prepare data for database - require at least one of pH or DO
    const validRecords = telemetryData
      .filter((record: Telemetry) => {
        const hasPH = record.pH !== undefined && record.pH !== null;
        const hasDO = record.do_mg_l !== undefined && record.do_mg_l !== null;
        return record.timestamp && (hasPH || hasDO);
      })
      .map((record: Telemetry) => ({
        timestamp: new Date(record.timestamp),
        pH: record.pH != null ? parseFloat(record.pH.toString()) : 0, // Default 0 if missing
        temp_c: record.temp_c != null ? parseFloat(record.temp_c.toString()) : null,
        do_mg_l: record.do_mg_l != null ? parseFloat(record.do_mg_l.toString()) : 0, // Default 0 if missing
        fish_health: record.fish_health != null ? parseFloat(record.fish_health.toString()) : null,
        quality_ai: record.quality_ai != null ? parseFloat(record.quality_ai.toString()) : null,
        status_ai: record.status_ai || null,
        userId: record.userId || null // Optional user association
      }));

    if (validRecords.length === 0) {
      return NextResponse.json(
        { error: "No valid telemetry records found" },
        { status: 400 }
      );
    }

    // Save to database using createMany for better performance
    const result = await prisma.telemetry.createMany({
      data: validRecords,
      skipDuplicates: true // Skip if timestamp conflicts
    });

    return NextResponse.json({
      success: true,
      saved: result.count,
      total: telemetryData.length
    });

  } catch (error) {
    console.error("Telemetry save error:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "Duplicate timestamp detected" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to save telemetry data" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve telemetry data (for the frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const range = searchParams.get('range') || '24h';
    const max = Math.min(10000, parseInt(searchParams.get('max') || '1000'));
    
    // Calculate time range
    const now = new Date();
    let from = new Date(now);
    
    switch (range) {
      case '1w':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    if (fromParam) from = new Date(fromParam);
    const to = toParam ? new Date(toParam) : now;

    // Build query conditions
    const whereConditions: TelemetryWhereInput = {
      timestamp: {
        gte: from as Date,
        lte: to as Date
      }
    };

    // Filter by user if provided
    if (userId) {
      whereConditions.userId = userId;
    }

    // Fetch telemetry data
    const telemetryData = await prisma.telemetry.findMany({
      where: whereConditions,
      orderBy: {
        timestamp: 'asc'
      },
      take: max
    });

    return NextResponse.json(telemetryData);

  } catch (error) {
    console.error("Telemetry fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch telemetry data" },
      { status: 500 }
    );
  }
}
