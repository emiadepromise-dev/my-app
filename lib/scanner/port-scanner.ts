import net from "net";
import type { PortResult, PortStatus } from "./port-types";
import { COMMON_SERVICES } from "./port-services";

const TIMEOUT_MS = 2000;

function lookupService(port: number): { service: string; risk: "low" | "medium" | "high"; reason: string } {
  if (COMMON_SERVICES[port]) {
    return COMMON_SERVICES[port];
  }
  if (port < 1024) {
    return { service: "Well-known", risk: "medium", reason: "Privileged port (below 1024)." };
  }
  if (port < 10000) {
    return { service: "Registered", risk: "low", reason: "Registered port range." };
  }
  return { service: "Dynamic", risk: "low", reason: "Dynamic/private port range." };
}

function probePort(host: string, port: number): Promise<PortStatus> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (status: PortStatus) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(status);
    };

    socket.setTimeout(TIMEOUT_MS);

    socket.on("connect", () => done("open"));
    socket.on("timeout", () => done("filtered"));
    socket.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNREFUSED") {
        done("closed");
      } else {
        done("filtered");
      }
    });

    socket.connect(port, host);
  });
}

export async function scanPorts(
  host: string,
  ports: number[],
  onProgress?: (scanned: number, total: number) => void
): Promise<{ port: number; status: PortStatus }[]> {
  const results: { port: number; status: PortStatus }[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < ports.length; i += BATCH_SIZE) {
    const batch = ports.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (port) => {
        const status = await probePort(host, port);
        return { port, status };
      })
    );
    results.push(...batchResults);
    onProgress?.(Math.min(i + BATCH_SIZE, ports.length), ports.length);
  }

  return results;
}

export function buildPortResults(
  scanResults: { port: number; status: PortStatus }[]
): PortResult[] {
  return scanResults.map(({ port, status }) => {
    const info = lookupService(port);
    return {
      port,
      status,
      service: info.service,
      risk: status === "open" ? info.risk : "low",
      riskReason: status === "open" ? info.reason : "Port is not open.",
    };
  });
}

export { PORT_PRESETS } from "./port-services";
