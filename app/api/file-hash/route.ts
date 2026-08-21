import { NextRequest, NextResponse } from "next/server";
import { computeFileHashes } from "@/lib/file-hash";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const buffer = Buffer.from(await request.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json({ error: "No file data provided." }, { status: 400 });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 50 MB." },
        { status: 413 }
      );
    }

    const hashes = computeFileHashes(buffer);

    return NextResponse.json({ hashes, size: buffer.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to compute file hashes." },
      { status: 500 }
    );
  }
}
