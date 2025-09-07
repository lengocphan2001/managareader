import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !["logo", "footerLogo"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be logo or footerLogo" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = {
      logo: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
      footerLogo: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
    };

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}` },
        { status: 400 },
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 },
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `${type}-${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
