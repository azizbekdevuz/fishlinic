import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "0.1.0",
      environment: process.env.NODE_ENV || "development"
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: "unhealthy", 
        error: "Health check failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
