import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const history = await prisma.scanHistory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(history);
  } catch {
    return NextResponse.json(
      { error: "Failed to load scan history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, target, summary, resultData } = await request.json();

    if (!type || !target || !summary || resultData === undefined) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!["website-scan", "port-scan", "file-hash"].includes(type)) {
      return NextResponse.json({ error: "Invalid scan type." }, { status: 400 });
    }

    const entry = await prisma.scanHistory.create({
      data: {
        type,
        target,
        summary,
        resultData: typeof resultData === "string" ? resultData : JSON.stringify(resultData),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save scan result" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("clear") === "true";
    const id = searchParams.get("id");

    if (clearAll) {
      await prisma.scanHistory.deleteMany();
      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.scanHistory.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Provide an item id or clear=true." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete scan history" },
      { status: 500 }
    );
  }
}
