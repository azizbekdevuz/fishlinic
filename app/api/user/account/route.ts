import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "userAvatars");

// Helper to delete user avatar file
async function deleteUserAvatar(avatarUrl: string | null) {
  if (!avatarUrl) return;
  
  try {
    // Extract filename from URL
    const filename = avatarUrl.split('/').pop();
    if (filename && filename !== 'default-avatar.png') {
      const filePath = path.join(UPLOAD_DIR, filename);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting avatar file:', error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user data before deletion (for cleanup)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Perform soft delete by updating user data
    // In production, you might want to keep some data for legal/audit purposes
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.local`,
        name: null,
        password: null,
        avatarUrl: null,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        verifiedAt: null,
        updatedAt: new Date()
      }
    });

    // Delete related data
    // Note: Prisma cascade delete will handle telemetry and verification attempts
    // due to the onDelete: Cascade in the schema

    // Delete avatar file
    await deleteUserAvatar(user.avatarUrl);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
