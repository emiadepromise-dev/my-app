"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface URLComponents {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

interface SecurityObservation {
  type: "warning" | "info" | "good";
  message: string;
}

function analyzeURL(url: string): { components: URLComponents; observations: SecurityObservation[] } | null {
  try {
    const parsed = new URL(url);
    const observations: SecurityObservation[] = [];

    if (parsed.protocol === "https:") {
      observations.push({ type: "good", message: "Uses HTTPS (encrypted connection)." });
    } else {
      observations.push({ type: "warning", message: "Uses HTTP (unencrypted connection). Sensitive data may be intercepted." });
    }

    if (parsed.port && !["80", "443", ""].includes(parsed.port)) {
      observations.push({ type: "info", message: `Non-standard port ${parsed.port} specified.` });
    }

    if (parsed.pathname !== "/") {
      observations.push({ type: "info", message: `Path: ${parsed.pathname}` });
    }

    const params = parsed.searchParams;
    if (params.toString()) {
      observations.push({ type: "info", message: `Contains ${params.size} query parameter(s). Sensitive data in URLs can be logged.` });
      for (const [key] of params) {
        const sensitiveKeys = ["password", "token", "key", "secret", "api_key", "apikey"];
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          observations.push({ type: "warning", message: `Query parameter "${key}" may contain sensitive data.` });
        }
      }
    }

    if (parsed.hash) {
      observations.push({ type: "info", message: "URL contains a fragment identifier." });
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsed.hostname)) {
      observations.push({ type: "warning", message: "IP address used instead of domain name. Phishing often uses IPs." });
    }

    if (parsed.username || parsed.password) {
      observations.push({ type: "warning", message: "URL contains embedded credentials. This is a security risk." });
    }

    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".buzz"];
    if (suspiciousTlds.some((tld) => parsed.hostname.endsWith(tld))) {
      observations.push({ type: "warning", message: `Domain uses a TLD commonly associated with phishing (${parsed.hostname.split(".").pop()}).` });
    }

    if (observations.length === 0) {
      observations.push({ type: "info", message: "No notable observations." });
    }

    return {
      components: {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
      },
      observations,
    };
  } catch {
    return null;
  }
}

export default function URLAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeURL>>(null);
  const [error, setError] = useState(false);

  function handleAnalyze() {
    setError(false);
    setResult(null);

    let input = url.trim();
    if (input && !input.startsWith("http://") && !input.startsWith("https://")) {
      input = "https://" + input;
    }

    const analysis = analyzeURL(input);
    if (!analysis) {
      setError(true);
      return;
    }
    setResult(analysis);
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
        <h1 className="page-title mt-2">URL Analyzer</h1>
        <p className="page-description">
          Parse URLs and identify security concerns.
        </p>
      </div>

      <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
        <div className="flex-1 space-y-1">
          <Label htmlFor="analyzer-url">URL</Label>
          <Input
            id="analyzer-url"
            placeholder="e.g. https://example.com/path?q=1#section"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!url.trim()}>
          Analyze
        </Button>
      </form>

      {error && (
        <div className="error-banner max-w-xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">Invalid URL format.</p>
        </div>
      )}

      {result && (
        <div className="max-w-2xl space-y-6" aria-live="polite">
          <div className="space-y-3">
            <h2 className="section-header">URL Components</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["Protocol", result.components.protocol],
                  ["Hostname", result.components.hostname],
                  ["Port", result.components.port || "(default)"],
                  ["Path", result.components.pathname || "/"],
                  ["Query", result.components.search || "(none)"],
                  ["Fragment", result.components.hash || "(none)"],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="info-row"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    {label}
                  </Badge>
                  <p className="info-row-value font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="section-header">Security Observations</h2>
            {result.observations.map((obs, i) => (
              <div
                key={i}
                className={`card-surface p-3 flex items-start gap-3 ${
                  obs.type === "warning"
                    ? "severity-border-medium"
                    : obs.type === "good"
                    ? "severity-border-low"
                    : ""
                }`}
              >
                {obs.type === "warning" ? (
                  <ShieldAlert className="size-4 text-warning shrink-0 mt-0.5" />
                ) : obs.type === "good" ? (
                  <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{obs.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
