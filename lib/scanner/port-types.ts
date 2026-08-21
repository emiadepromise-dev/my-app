export type PortStatus = "open" | "closed" | "filtered" | "error";

export interface PortResult {
  port: number;
  status: PortStatus;
  service: string;
  risk: "low" | "medium" | "high";
  riskReason: string;
}

export interface PortScanResult {
  target: string;
  ports: PortResult[];
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
  scannedAt: string;
}
