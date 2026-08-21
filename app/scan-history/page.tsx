"use client";

import { useState, useEffect } from "react";
import {
  History,
  Globe,
  Scan,
  FileCheck,
  Trash2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import {
  generateWebsiteReport,
  generatePortReport,
  generateFileHashReport,
  openReport,
  downloadReport,
} from "@/lib/report";
import type {
  WebsiteScanResult,
  Finding,
  Severity,
} from "@/lib/scanner/types";
import type { PortScanResult, PortResult, PortStatus } from "@/lib/scanner/port-types";

interface HistoryEntry {
  id: string;
  type: string;
  target: string;
  summary: string;
  resultData: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Globe; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  "website-scan": { label: "Website Scan", icon: Globe, variant: "secondary" },
  "port-scan": { label: "Port Scan", icon: Scan, variant: "default" },
  "file-hash": { label: "File Hash", icon: FileCheck, variant: "outline" },
};

const SEVERITY_CONFIG: Record<Severity, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "secondary" },
  low: { label: "Low", variant: "outline" },
  informational: { label: "Info", variant: "outline" },
};

const PORT_STATUS_CONFIG: Record<PortStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "destructive" },
  closed: { label: "Closed", variant: "secondary" },
  filtered: { label: "Filtered", variant: "outline" },
  error: { label: "Error", variant: "outline" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function WebsiteResultView({ data }: { data: WebsiteScanResult }) {
  const [copiedFinding, setCopiedFinding] = useState<string | null>(null);

  function copyFinding(finding: Finding) {
    const text = `[${finding.severity.toUpperCase()}] ${finding.title}\n${finding.description}\nRecommendation: ${finding.recommendation}`;
    navigator.clipboard.writeText(text);
    setCopiedFinding(finding.id);
    setTimeout(() => setCopiedFinding(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="stat-value">{data.score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
        <div>
          <div className="text-sm font-medium">{data.url}</div>
          <div className="text-xs text-muted-foreground">
            {data.findings.length} finding{data.findings.length !== 1 ? "s" : ""} &bull;{" "}
            {data.crawl.pagesVisited.length} page{data.crawl.pagesVisited.length !== 1 ? "s" : ""} crawled
          </div>
        </div>
      </div>

      {data.findings.length > 0 && (
        <div className="space-y-2">
          <h2 className="section-header">Findings</h2>
          {data.findings
            .sort((a, b) => {
              const order: Severity[] = ["critical", "high", "medium", "low", "informational"];
              return order.indexOf(a.severity) - order.indexOf(b.severity);
            })
            .map((finding) => {
              const config = SEVERITY_CONFIG[finding.severity];
              return (
                <div key={finding.id} className="card-surface p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
                    <span className="text-sm font-medium">{finding.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 ml-auto shrink-0"
                      onClick={() => copyFinding(finding)}
                      aria-label="Copy finding"
                    >
                      {copiedFinding === finding.id ? (
                        <Check className="size-3 text-success" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{finding.description}</p>
                  {finding.evidence && (
                    <p className="code-block text-muted-foreground">
                      {finding.evidence}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Recommendation:</span> {finding.recommendation}
                  </p>
                </div>
              );
            })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="stat-value">{data.crawl.pagesVisited.length}</div>
          <div className="stat-label">Pages crawled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.crawl.brokenLinks.length}</div>
          <div className="stat-label">Broken links</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.technologies.technologies.length}</div>
          <div className="stat-label">Technologies</div>
        </div>
      </div>

      {data.technologies.technologies.length > 0 && (
        <div>
          <h2 className="section-header mb-2">Technologies</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.technologies.technologies.map((tech) => (
              <Badge key={tech.name} variant="secondary" className="text-xs">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {data.cookies.cookies.length > 0 && (
        <div>
          <h2 className="section-header mb-2">Cookies</h2>
          <div className="space-y-1.5">
            {data.cookies.cookies.map((cookie) => (
              <div key={cookie.name} className="card-surface flex items-center gap-2 text-xs px-3 py-1.5">
                <span className="font-mono font-medium">{cookie.name}</span>
                <Badge variant={cookie.secure ? "secondary" : "destructive"} className="text-[10px]">
                  Secure: {cookie.secure ? "Yes" : "No"}
                </Badge>
                <Badge variant={cookie.httpOnly ? "secondary" : "destructive"} className="text-[10px]">
                  HttpOnly: {cookie.httpOnly ? "Yes" : "No"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PortResultView({ data }: { data: PortScanResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-value text-success">{data.openPorts}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.closedPorts}</div>
          <div className="stat-label">Closed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-muted-foreground">{data.filteredPorts}</div>
          <div className="stat-label">Filtered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.ports.length}</div>
          <div className="stat-label">Scanned</div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm" aria-label="Port scan results">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th scope="col" className="text-left px-3 py-1.5 font-medium text-xs">Port</th>
              <th scope="col" className="text-left px-3 py-1.5 font-medium text-xs">Status</th>
              <th scope="col" className="text-left px-3 py-1.5 font-medium text-xs">Service</th>
              <th scope="col" className="text-left px-3 py-1.5 font-medium text-xs">Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.ports
              .sort((a, b) => {
                const order: Record<PortStatus, number> = { open: 0, filtered: 1, closed: 2, error: 3 };
                return order[a.status] - order[b.status] || a.port - b.port;
              })
              .map((port: PortResult) => {
                const config = PORT_STATUS_CONFIG[port.status];
                return (
                  <tr key={port.port} className="border-b border-border last:border-0">
                    <td className="px-3 py-1.5 font-mono font-medium text-xs">{port.port}</td>
                    <td className="px-3 py-1.5">
                      <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{port.service}</td>
                    <td className="px-3 py-1.5 text-xs capitalize">{port.status === "open" ? port.risk : "—"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FileResultView({ data }: { data: { hashes: Record<string, string>; size: number } }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }

  function copyHash(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">File size: {formatSize(data.size)}</div>
      <div className="space-y-2">
        {Object.entries(data.hashes).map(([algo, hash]) => (
          <div key={algo} className="card-surface p-2.5">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-[10px]">{algo.toUpperCase()}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5"
                onClick={() => copyHash(algo, hash)}
                aria-label={`Copy ${algo} hash`}
              >
                {copiedKey === algo ? (
                  <Check className="size-3 text-success" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
            <p className="code-block">{hash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedResult({ type, resultData }: { type: string; resultData: unknown }) {
  if (!resultData) {
    return (
      <p className="text-sm text-muted-foreground">
        Result data is unavailable for this entry.
      </p>
    );
  }

  if (type === "website-scan") {
    return <WebsiteResultView data={resultData as WebsiteScanResult} />;
  }

  if (type === "port-scan") {
    return <PortResultView data={resultData as PortScanResult} />;
  }

  if (type === "file-hash") {
    return <FileResultView data={resultData as { hashes: Record<string, string>; size: number }} />;
  }

  return (
    <p className="text-sm text-muted-foreground">
      Result data is unavailable for this entry.
    </p>
  );
}

export default function ScanHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/scan-history");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) setError("Failed to load scan history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/scan-history?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      setError("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    try {
      const res = await fetch("/api/scan-history?clear=true", { method: "DELETE" });
      if (!res.ok) throw new Error("Clear failed");
      setHistory([]);
      setExpandedId(null);
      setConfirmClearAll(false);
    } catch {
      setError("Failed to clear history.");
    }
  }

  function parseResultData(entry: HistoryEntry): unknown {
    try {
      return JSON.parse(entry.resultData);
    } catch {
      return null;
    }
  }

  function handleOpenReport(entry: HistoryEntry) {
    const data = parseResultData(entry);
    if (!data) return;

    let html: string;
    let filename: string;

    if (entry.type === "website-scan") {
      html = generateWebsiteReport(data as WebsiteScanResult);
      filename = `cyberyoshi-website-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    } else if (entry.type === "port-scan") {
      html = generatePortReport(data as PortScanResult);
      filename = `cyberyoshi-port-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    } else {
      const fd = data as { fileName?: string; fileSize?: number; hashes: Record<string, string>; verified: boolean | null };
      html = generateFileHashReport({
        fileName: entry.target,
        fileSize: fd.fileSize ?? 0,
        hashes: fd.hashes,
        verified: fd.verified,
      });
      filename = `cyberyoshi-file-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    }

    openReport(html);
    void filename;
  }

  function handleDownloadReport(entry: HistoryEntry) {
    const data = parseResultData(entry);
    if (!data) return;

    let html: string;
    let filename: string;

    if (entry.type === "website-scan") {
      html = generateWebsiteReport(data as WebsiteScanResult);
      filename = `cyberyoshi-website-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    } else if (entry.type === "port-scan") {
      html = generatePortReport(data as PortScanResult);
      filename = `cyberyoshi-port-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    } else {
      const fd = data as { fileName?: string; fileSize?: number; hashes: Record<string, string>; verified: boolean | null };
      html = generateFileHashReport({
        fileName: entry.target,
        fileSize: fd.fileSize ?? 0,
        hashes: fd.hashes,
        verified: fd.verified,
      });
      filename = `cyberyoshi-file-report-${entry.target.replace(/[^a-z0-9]/gi, "-")}.html`;
    }

    downloadReport(html, filename);
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Scan History</h1>
          <p className="page-description">
            View and manage your past scan results.
          </p>
        </div>
        {history.length > 0 && !confirmClearAll && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmClearAll(true)}
          >
            <Trash2 className="size-3.5" />
            Clear All
          </Button>
        )}
        {confirmClearAll && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Clear all history?</span>
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              Yes, clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmClearAll(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => setError(null)} aria-label="Dismiss error">
            <XCircle className="size-3.5" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-surface p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && history.length === 0 && (
        <EmptyState
          icon={History}
          title="No Scan History"
          description="Results from your scans will appear here."
        />
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((entry) => {
            const config = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG["website-scan"];
            const Icon = config.icon;
            const isExpanded = expandedId === entry.id;
            const resultData = parseResultData(entry);

            return (
              <div
                key={entry.id}
                className="card-surface overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{entry.target}</span>
                      <Badge variant={config.variant} className="text-[10px] shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.summary}</span>
                      <span>&bull;</span>
                      <span>{timeAgo(entry.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`result-${entry.id}`}
                    >
                      <ExternalLink className="size-3.5" />
                      {isExpanded ? "Close" : "View"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label="Delete scan result"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4" id={`result-${entry.id}`}>
                    <Separator className="mb-4" />
                    <ExpandedResult type={entry.type} resultData={resultData} />
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => handleOpenReport(entry)}>
                        <FileText className="size-3.5" />
                        Open Report
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(entry)}>
                        <Download className="size-3.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
