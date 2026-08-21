"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SecurityHeader {
  header: string;
  present: boolean;
  value: string | null;
  description: string;
  recommendation: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
}

interface HeaderResult {
  url: string;
  status: number;
  headers: Record<string, string>;
  securityHeaders: SecurityHeader[];
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "severity-border-critical",
  high: "severity-border-high",
  medium: "severity-border-medium",
  low: "severity-border-low",
  info: "",
};

export default function HTTPHeadersPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function handleCheck() {
    if (!url.trim()) {
      setError("Please enter a URL to check.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/security/http-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Header check failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to check headers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link
          href="/security-toolkit"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Security Toolkit
        </Link>
        <h1 className="page-title mt-2">
          HTTP Header Checker
        </h1>
        <p className="page-description">
          Inspect HTTP response headers and identify missing security headers.
        </p>
      </div>

      <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleCheck(); }}>
        <div className="flex-1 space-y-1">
          <Label htmlFor="http-url">URL</Label>
          <Input
            id="http-url"
            placeholder="e.g. https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Checking..." : "Check"}
        </Button>
      </form>

      {error && (
        <div className="error-banner max-w-xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <div className="max-w-3xl space-y-6" aria-live="polite">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{result.url}</h2>
              <p className="text-sm text-muted-foreground">
                Status: <Badge variant="outline">{result.status}</Badge>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleCopy(
                  Object.entries(result.headers)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                )
              }
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy All Headers"}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="section-header">Security Headers</h2>
            {result.securityHeaders.map((sh) => (
              <div
                key={sh.header}
                className={`card-surface p-4 ${SEVERITY_STYLES[sh.severity]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {sh.present ? (
                    <ShieldCheck className="size-4 text-success" />
                  ) : (
                    <ShieldAlert className="size-4 text-destructive" />
                  )}
                  <Badge variant="outline" className="text-xs font-mono">
                    {sh.header}
                  </Badge>
                  <Badge variant={sh.present ? "default" : "destructive"} className="text-xs">
                    {sh.present ? "Present" : "Missing"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {sh.description}
                </p>
                {sh.value && (
                  <pre className="code-block mt-2">
                    {sh.value}
                  </pre>
                )}
                {!sh.present && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    <span className="font-medium">Recommendation:</span>{" "}
                    {sh.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            aria-controls="http-all-headers"
          >
            {showAll ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {showAll ? "Hide" : "Show"} All Headers ({Object.keys(result.headers).length})
          </Button>

          {showAll && (
            <div id="http-all-headers" className="card-surface p-4 max-h-80 overflow-y-auto space-y-1">
              {Object.entries(result.headers).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs font-mono">
                  <span className="text-muted-foreground shrink-0">{key}:</span>
                  <span className="break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
