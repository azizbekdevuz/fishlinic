import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "userAvatars");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Delete old avatar file
async function deleteOldAvatar(avatarUrl: string | null) {
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
    console.error('Error deleting old avatar:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPG, PNG, GIF, or WebP images." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Get current user to delete old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true }
    });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${session.user.id}-${randomUUID()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL
    const avatarUrl = `/uploads/userAvatars/${fileName}`;

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        avatarUrl,
        updatedAt: new Date()
      }
    });

    // Delete old avatar file
    await deleteOldAvatar(currentUser?.avatarUrl);

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Avatar uploaded successfully"
    });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true }
    });

    if (!currentUser?.avatarUrl) {
      return NextResponse.json(
        { error: "No avatar to remove" },
        { status: 400 }
      );
    }

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        avatarUrl: null,
        updatedAt: new Date()
      }
    });

    // Delete avatar file
    await deleteOldAvatar(currentUser.avatarUrl);

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully"
    });

  } catch (error) {
    console.error("Avatar removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
