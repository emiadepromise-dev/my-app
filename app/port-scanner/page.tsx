"use client";

import { useState } from "react";
import {
  Search,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecentActivity } from "@/hooks/use-recent-activity";
import { PORT_PRESETS } from "@/lib/scanner/port-services";
import type { PortScanResult, PortResult, PortStatus } from "@/lib/scanner/port-types";

const STATUS_CONFIG: Record<PortStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-severity-critical/10 text-severity-critical border-severity-critical/20" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
  filtered: { label: "Filtered", className: "bg-warning/10 text-warning border-warning/20" },
  error: { label: "Error", className: "bg-muted text-muted-foreground border-border" },
};

const RISK_ICONS = {
  high: ShieldAlert,
  medium: Shield,
  low: ShieldCheck,
};

const RISK_COLORS = {
  high: "text-severity-high",
  medium: "text-warning",
  low: "text-success",
};

export default function PortScannerPage() {
  const { addActivity } = useRecentActivity();
  const [target, setTarget] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customPorts, setCustomPorts] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ scanned: 0, total: 0 });
  const [result, setResult] = useState<PortScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getPorts(): number[] {
    if (customPorts.trim()) {
      return customPorts
        .split(/[,\s]+/)
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p) && p >= 1 && p <= 65535)
        .slice(0, 1000);
    }
    return PORT_PRESETS[selectedPreset].ports;
  }

  async function handleScan() {
    if (!target.trim()) {
      setError("Please enter a target IP address or hostname.");
      return;
    }

    const ports = getPorts();
    if (ports.length === 0) {
      setError("Please select or enter valid ports.");
      return;
    }

    if (ports.length > 1000) {
      setError("Maximum 1000 ports per scan. Please reduce the number of ports.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ scanned: 0, total: ports.length });

    try {
      const res = await fetch("/api/port-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), ports }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      setResult(data);

      addActivity({
        id: `ps-${Date.now()}`,
        type: "port-scan",
        target: target.trim(),
        openPorts: data.openPorts,
        totalPorts: ports.length,
        timestamp: Date.now(),
      });

      fetch("/api/scan-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "port-scan",
          target: target.trim(),
          summary: `${data.openPorts} open port${data.openPorts !== 1 ? "s" : ""}`,
          resultData: data,
        }),
      });
    } catch {
      setError("Failed to connect to the scanner. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Port Scanner</h1>
        <p className="page-description">
          Discover open ports and identify running services on authorized systems. Only scan systems you have permission to test.
        </p>
      </div>

      <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); handleScan(); }}>
        <div className="space-y-2">
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            placeholder="IP address or hostname (e.g. 192.168.1.1)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2" role="group" aria-labelledby="port-presets-label">
          <Label id="port-presets-label">Port Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PORT_PRESETS.map((preset, i) => (
              <Button
                key={preset.label}
                variant={selectedPreset === i && !customPorts.trim() ? "default" : "outline"}
                aria-pressed={selectedPreset === i && !customPorts.trim()}
                size="sm"
                onClick={() => {
                  setSelectedPreset(i);
                  setCustomPorts("");
                }}
                disabled={loading}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ports">Custom Ports (optional)</Label>
          <Input
            id="ports"
            placeholder="e.g. 22, 80, 443, 3306"
            value={customPorts}
            onChange={(e) => setCustomPorts(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated. Overrides preset selection. Max 1000 ports.
          </p>
        </div>

        <Button type="submit" disabled={loading || !target.trim()}>
          {loading ? (
            `Scanning... ${progress.scanned}/${progress.total}`
          ) : (
            <>
              <Search className="size-4" />
              Scan
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="error-banner max-w-2xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6" aria-live="polite">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <div className="stat-card">
              <div className="stat-value text-success">{result.openPorts}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.closedPorts}</div>
              <div className="stat-label">Closed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-warning">{result.filteredPorts}</div>
              <div className="stat-label">Filtered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.ports.length}</div>
              <div className="stat-label">Scanned</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="section-header">Port Results — {result.target}</h2>
            <div className="rounded-xl border border-border overflow-hidden max-w-3xl">
              <table className="w-full text-sm" aria-label="Port scan results">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th scope="col" className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Port</th>
                    <th scope="col" className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th scope="col" className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Service</th>
                    <th scope="col" className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ports
                    .sort((a, b) => {
                      const order: Record<PortStatus, number> = {
                        open: 0,
                        filtered: 1,
                        closed: 2,
                        error: 3,
                      };
                      return order[a.status] - order[b.status] || a.port - b.port;
                    })
                    .map((port) => (
                      <PortRow key={port.port} port={port} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortRow({ port }: { port: PortResult }) {
  const config = STATUS_CONFIG[port.status];
  const RiskIcon = RISK_ICONS[port.risk];

  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
      <td className="px-4 py-2.5 font-mono font-medium text-xs tabular-nums">{port.port}</td>
      <td className="px-4 py-2.5">
        <Badge variant="outline" className={`text-[10px] font-semibold border ${config.className}`}>
          {config.label}
        </Badge>
      </td>
      <td className="px-4 py-2.5 text-muted-foreground text-xs">{port.service}</td>
      <td className="px-4 py-2.5">
        {port.status === "open" && (
          <div className="flex items-center gap-1.5">
            <RiskIcon className={`size-3.5 ${RISK_COLORS[port.risk]}`} />
            <span className={`text-xs capitalize font-medium ${RISK_COLORS[port.risk]}`}>{port.risk}</span>
          </div>
        )}
      </td>
    </tr>
  );
}
