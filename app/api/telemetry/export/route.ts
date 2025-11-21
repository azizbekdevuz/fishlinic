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

    const { format, includeMetadata, compress } = await request.json();

    // Fetch user's telemetry data
    const telemetryData = await prisma.telemetry.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000 // Limit to last 1000 records for performance
    });

    if (telemetryData.length === 0) {
      return NextResponse.json(
        { error: "No telemetry data found for your account. Please ensure the system is collecting data and try again later." },
        { status: 404 }
      );
    }

    let content: string;
    let mimeType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        content = generateCSV(telemetryData, includeMetadata);
        mimeType = 'text/csv';
        filename = `telemetry-data-${timestamp}.csv`;
        break;
      
      case 'json':
        content = JSON.stringify({
          exportDate: new Date().toISOString(),
          userId: includeMetadata ? session.user.id : undefined,
          userEmail: includeMetadata ? session.user.email : undefined,
          recordCount: telemetryData.length,
          data: telemetryData
        }, null, 2);
        mimeType = 'application/json';
        filename = `telemetry-data-${timestamp}.json`;
        break;
      
      case 'excel':
        // For now, generate CSV with Excel-friendly format
        content = generateCSV(telemetryData, includeMetadata, true);
        mimeType = 'application/vnd.ms-excel';
        filename = `telemetry-data-${timestamp}.csv`;
        break;
      
      default:
        return NextResponse.json(
          { error: "Invalid format" },
          { status: 400 }
        );
    }

    const response = new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

    return response;
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

function generateCSV(data: any[], includeMetadata: boolean, excelFormat = false): string {
  if (data.length === 0) return '';

  const headers = [
    'Timestamp',
    'pH',
    'Temperature (°C)',
    'Dissolved Oxygen (mg/L)',
    'Fish Health',
    'AI Quality Score',
    'AI Status'
  ];

  if (includeMetadata) {
    headers.push('Record ID', 'User ID');
  }

  const rows = data.map(row => {
    const values = [
      new Date(row.timestamp).toISOString(),
      row.pH?.toString() || '',
      row.temp_c?.toString() || '',
      row.do_mg_l?.toString() || '',
      row.fish_health?.toString() || '',
      row.quality_ai?.toString() || '',
      row.status_ai || ''
    ];

    if (includeMetadata) {
      values.push(row.id, row.userId || '');
    }

    // Excel-friendly formatting
    if (excelFormat) {
      return values.map(val => {
        // Wrap in quotes if contains comma or special characters
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    }

    return values.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
