import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { isAuthenticatedRequest } from "~/server/apiAuth";
import { CV_DIR } from "~/server/cvStorage";

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teacherId = formData.get("teacherId") as string;

    if (!file || !teacherId) {
      return NextResponse.json(
        { error: "File and teacherId are required" },
        { status: 400 },
      );
    }

    // teacherId lands in the filename, so it must be a plain identifier and
    // never something like "../../evil" that would write outside CV_DIR.
    if (!UUID.test(teacherId)) {
      return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // file.type is supplied by the client and can be forged. Check the actual
    // PDF magic number so a non-PDF payload cannot be stored as one.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    // Create uploads directory if it doesn't exist
    if (!existsSync(CV_DIR)) {
      await mkdir(CV_DIR, { recursive: true });
    }

    // Generate unique filename. The extension is fixed rather than taken from
    // the uploaded file name, which is attacker-controlled.
    const filename = `${teacherId}_${Date.now()}.pdf`;
    const filepath = path.join(CV_DIR, filename);

    // Write file
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      message: "CV uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
