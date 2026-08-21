import { NextRequest, NextResponse } from "next/server";
import { scanPorts, buildPortResults } from "@/lib/scanner/port-scanner";
import { validateTargetHost } from "@/lib/security";
import type { PortScanResult } from "@/lib/scanner/port-types";

export async function POST(request: NextRequest) {
  try {
    const { target, ports } = await request.json();

    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Target is required." }, { status: 400 });
    }

    if (!ports || !Array.isArray(ports) || ports.length === 0) {
      return NextResponse.json(
        { error: "At least one port is required." },
        { status: 400 }
      );
    }

    if (ports.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 ports per scan." },
        { status: 400 }
      );
    }

    const validPorts = ports
      .filter((p: unknown) => typeof p === "number" && p >= 1 && p <= 65535)
      .map((p: number) => Math.floor(p));

    if (validPorts.length === 0) {
      return NextResponse.json(
        { error: "No valid ports provided." },
        { status: 400 }
      );
    }

    const host = target.trim();

    const hostCheck = validateTargetHost(host);
    if (!hostCheck.ok) {
      return NextResponse.json({ error: hostCheck.error }, { status: 400 });
    }

    const scanResults = await scanPorts(host, validPorts);
    const portResults = buildPortResults(scanResults);

    const openPorts = portResults.filter((p) => p.status === "open").length;
    const closedPorts = portResults.filter((p) => p.status === "closed").length;
    const filteredPorts = portResults.filter((p) => p.status === "filtered").length;

    const result: PortScanResult = {
      target: host,
      ports: portResults,
      openPorts,
      closedPorts,
      filteredPorts,
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during the scan" },
      { status: 500 }
    );
  }
}
