"use client";

import { useState } from "react";
import { Search, ExternalLink, AlertTriangle } from "lucide-react";
import { useRecentActivity } from "@/hooks/use-recent-activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type {
  WebsiteScanResult,
  Finding,
  Severity,
} from "@/lib/scanner/types";

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; className: string }
> = {
  critical: { label: "Critical", className: "bg-severity-critical/10 text-severity-critical border-severity-critical/20" },
  high: { label: "High", className: "bg-severity-high/10 text-severity-high border-severity-high/20" },
  medium: { label: "Medium", className: "bg-severity-medium/10 text-severity-medium border-severity-medium/20" },
  low: { label: "Low", className: "bg-severity-low/10 text-severity-low border-severity-low/20" },
  informational: { label: "Info", className: "bg-severity-info/10 text-severity-info border-severity-info/20" },
};

const SCORE_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  excellent: { color: "text-success", label: "Excellent", bg: "bg-success/10" },
  good: { color: "text-primary", label: "Good", bg: "bg-primary/10" },
  fair: { color: "text-warning", label: "Fair", bg: "bg-warning/10" },
  poor: { color: "text-severity-high", label: "Poor", bg: "bg-severity-high/10" },
  critical: { color: "text-severity-critical", label: "Critical", bg: "bg-severity-critical/10" },
};

function scoreGrade(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  if (score >= 30) return "poor";
  return "critical";
}

function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };
  for (const f of findings) {
    counts[f.severity]++;
  }
  return counts;
}

function FindingCard({ finding }: { finding: Finding }) {
  const config = SEVERITY_CONFIG[finding.severity];
  const borderClass = `severity-border-${finding.severity === "informational" ? "info" : finding.severity}`;
  return (
    <div className={`rounded-lg border border-border bg-card p-4 space-y-2 ${borderClass}`}>
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={`shrink-0 text-[10px] font-semibold border ${config.className}`}>
          {config.label}
        </Badge>
        <span className="text-sm font-medium">{finding.title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{finding.description}</p>
      {finding.evidence && (
        <p className="code-block">{finding.evidence}</p>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground/80">Recommendation:</span>{" "}
        {finding.recommendation}
      </p>
    </div>
  );
}

export default function WebsiteScannerPage() {
  const { addActivity } = useRecentActivity();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WebsiteScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!url.trim()) {
      setError("Please enter a URL to scan.");
      return;
    }

    let scanUrl = url.trim();
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = "https://" + scanUrl;
    }

    try {
      new URL(scanUrl);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/website-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      setResult(data);

      addActivity({
        id: `ws-${Date.now()}`,
        type: "website-scan",
        target: scanUrl,
        score: data.score,
        timestamp: Date.now(),
      });

      fetch("/api/scan-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "website-scan",
          target: scanUrl,
          summary: data.score !== null ? `Score: ${data.score}/100` : "Scan complete",
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
        <h1 className="page-title">Website Scanner</h1>
        <p className="page-description">
          Analyze websites for security headers, SSL configuration, cookies, and misconfigurations. Only scan websites you own or have permission to test.
        </p>
      </div>

      <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleScan(); }}>
        <div className="flex-1">
          <Label htmlFor="url" className="sr-only">
            Website URL
          </Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            "Scanning..."
          ) : (
            <>
              <Search className="size-4" />
              Scan
            </>
          )}
        </Button>
      </form>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {error && (
        <div className="error-banner max-w-xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-8" aria-live="polite">
          <div className="card-surface-elevated p-6 flex items-center gap-6">
            {(() => {
              const grade = scoreGrade(result.score);
              const config = SCORE_CONFIG[grade];
              return (
                <>
                  <div className={`size-20 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold tabular-nums ${config.color}`}>
                        {result.score}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">Security Score</span>
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{result.url}</div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      {result.findings.length} finding{result.findings.length !== 1 ? "s" : ""}{" "}
                      &bull; {result.crawl.pagesVisited.length} page{result.crawl.pagesVisited.length !== 1 ? "s" : ""} crawled
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {(() => {
            const counts = severityCounts(result.findings);
            return (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {(
                  ["critical", "high", "medium", "low", "informational"] as Severity[]
                ).map((sev) => {
                  const config = SEVERITY_CONFIG[sev];
                  return (
                    <div
                      key={sev}
                      className="stat-card"
                    >
                      <div className={`stat-value text-lg ${counts[sev] > 0 ? config.className.split(" ").find(c => c.startsWith("text-")) ?? "" : "text-muted-foreground"}`}>
                        {counts[sev]}
                      </div>
                      <div className="stat-label capitalize">{sev}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <Separator />

          <div className="space-y-4">
            <h2 className="section-header">Findings</h2>
            {result.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No security issues found.
              </p>
            ) : (
              <div className="space-y-3">
                {result.findings
                  .sort((a, b) => {
                    const order: Severity[] = [
                      "critical",
                      "high",
                      "medium",
                      "low",
                      "informational",
                    ];
                    return order.indexOf(a.severity) - order.indexOf(b.severity);
                  })
                  .map((finding) => (
                    <FindingCard key={finding.id} finding={finding} />
                  ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="section-header">Crawl Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="stat-card">
                <div className="stat-value">{result.crawl.pagesVisited.length}</div>
                <div className="stat-label">Pages Visited</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{result.crawl.totalLinks}</div>
                <div className="stat-label">Total Links</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{result.crawl.brokenLinks.length}</div>
                <div className="stat-label">Broken Links</div>
              </div>
            </div>

            {result.crawl.brokenLinks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Broken Links
                </h3>
                {result.crawl.brokenLinks.slice(0, 10).map((bl) => (
                  <div
                    key={bl.url}
                    className="flex items-center gap-2 text-xs font-mono bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">{bl.url}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      {bl.status || "timeout"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="section-header">Detected Technologies</h2>
            {result.technologies.technologies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No technologies detected.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.technologies.technologies.map((tech) => (
                  <Badge key={tech.name} variant="secondary" className="text-xs">
                    {tech.name}
                    <span className="text-muted-foreground/60 ml-1">
                      ({tech.category})
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="section-header">Cookies</h2>
            {result.cookies.cookies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cookies detected.
              </p>
            ) : (
              <div className="space-y-2">
                {result.cookies.cookies.map((cookie) => (
                  <div
                    key={cookie.name}
                    className="flex items-center gap-3 text-sm rounded-lg border border-border bg-card px-4 py-2.5"
                  >
                    <span className="font-mono font-medium text-xs">
                      {cookie.name}
                    </span>
                    <div className="flex gap-1.5">
                      <Badge
                        variant={cookie.secure ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        Secure: {cookie.secure ? "Yes" : "No"}
                      </Badge>
                      <Badge
                        variant={cookie.httpOnly ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        HttpOnly: {cookie.httpOnly ? "Yes" : "No"}
                      </Badge>
                      <Badge
                        variant={cookie.sameSite ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        SameSite: {cookie.sameSite || "None"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
