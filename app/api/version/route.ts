import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get version information from package.json and environment
    const versionInfo = {
      version: "0.1.0", // From package.json
      buildDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version || "20.x",
      nextVersion: "15.5.3", // From package.json
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || undefined,
      buildId: process.env.VERCEL_DEPLOYMENT_ID || "local"
    };

    return NextResponse.json(versionInfo);
  } catch (error) {
    console.error('Version API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch version information" },
      { status: 500 }
    );
  }
}
