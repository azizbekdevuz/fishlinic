import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";

// For now, we'll return mock data since we don't have an activity log table
// In a production app, you would create an ActivityLog model and store actual activities

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mock activity data - in production, this would come from an ActivityLog table
    const mockActivities = [
      {
        id: "1",
        type: "login",
        description: "Signed in to dashboard",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "settings",
        description: "Updated dashboard preferences",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "verification",
        description: "Account verification completed",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        type: "profile",
        description: "Updated profile information",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        type: "export",
        description: "Exported telemetry data (CSV format)",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        type: "alert",
        description: "pH level alert threshold updated",
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "7",
        type: "upload",
        description: "Profile picture uploaded",
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    return NextResponse.json({
      success: true,
      activities: mockActivities
    });

  } catch (error) {
    console.error("User activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    );
  }
}

// POST endpoint to log new activities (for future use)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, description, metadata } = body;

    // Validate input
    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      );
    }

    // In production, you would save this to an ActivityLog table
    // For now, just return success
    const activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    return NextResponse.json({
      success: true,
      activity,
      message: "Activity logged successfully"
    });

  } catch (error) {
    console.error("Activity logging error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
