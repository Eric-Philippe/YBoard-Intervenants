import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { isAuthenticatedRequest } from "~/server/apiAuth";
import { resolveCvPath } from "~/server/cvStorage";

/**
 * CVs are personal data: never serve or delete one without a valid session, and
 * never trust the filename taken from the URL.
 */
function guard(
  request: NextRequest,
  filename: string,
): { error: NextResponse } | { filepath: string } {
  if (!isAuthenticatedRequest(request)) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  const filepath = filename ? resolveCvPath(filename) : null;
  if (!filepath) {
    return {
      error: NextResponse.json({ error: "Invalid filename" }, { status: 400 }),
    };
  }

  return { filepath };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    const checked = guard(request, filename);
    if ("error" in checked) return checked.error;

    if (!existsSync(checked.filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = await readFile(checked.filepath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    const checked = guard(request, filename);
    if ("error" in checked) return checked.error;

    if (!existsSync(checked.filepath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await unlink(checked.filepath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
