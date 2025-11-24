import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";

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
    const { subject, message, priority, userEmail, userName } = body;

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    if (typeof subject !== 'string' || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Subject and message must be strings" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 5000 characters or less" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Save the support request to a database
    // 2. Send an email to the support team
    // 3. Send a confirmation email to the user
    // 4. Create a ticket ID for tracking

    const supportRequest = {
      id: `TICKET-${Date.now()}`,
      userId: session.user.id,
      userEmail: userEmail || session.user.email,
      userName: userName || session.user.name,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'normal',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // Log the support request (in production, save to database)
    console.log('Support Request:', supportRequest);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      ticketId: supportRequest.id,
      message: "Support request submitted successfully"
    });

  } catch (error) {
    console.error("Support contact error:", error);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}
