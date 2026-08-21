"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const DNS_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "SRV"] as const;

type DNSType = (typeof DNS_TYPES)[number];

export default function DNSLookupPage() {
  const [domain, setDomain] = useState("");
  const [dnsType, setDnsType] = useState<DNSType>("A");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [queried, setQueried] = useState(false);

  async function handleLookup() {
    if (!domain.trim()) {
      setError("Please enter a domain name.");
      return;
    }
    setLoading(true);
    setError(null);
    setRecords([]);
    setQueried(false);

    try {
      const res = await fetch("/api/security/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), type: dnsType }),
      });
      const data = await res.json();
      if (!res.ok && !data.records) {
        setError(data.error || "DNS lookup failed");
        return;
      }
      setRecords(data.records || []);
      setQueried(true);
      if (data.error && (!data.records || data.records.length === 0)) {
        setError(data.error);
      }
    } catch {
      setError("DNS lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatRecord(record: unknown): string {
    if (typeof record === "string") return record;
    if (typeof record === "object" && record !== null) {
      return JSON.stringify(record, null, 2);
    }
    return String(record);
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
        <h1 className="page-title mt-2">DNS Lookup</h1>
        <p className="page-description">
          Query DNS records for a domain name.
        </p>
      </div>

      <div className="space-y-3 max-w-xl">
        <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); handleLookup(); }}>
          <div className="flex-1 space-y-1">
            <Label htmlFor="dns-domain">Domain</Label>
            <Input
              id="dns-domain"
              placeholder="e.g. example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !domain.trim()}>
            {loading ? "Querying..." : "Query"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {DNS_TYPES.map((t) => (
            <Button
              key={t}
              variant={dnsType === t ? "default" : "outline"}
              size="sm"
              onClick={() => setDnsType(t)}
              disabled={loading}
              aria-pressed={dnsType === t}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-banner max-w-xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {queried && records.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No {dnsType} records found for {domain}.
        </p>
      )}

      {records.length > 0 && (
        <div className="max-w-2xl space-y-3" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {dnsType} Records for {domain}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(records.map(formatRecord).join("\n"))}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy All"}
            </Button>
          </div>

          {records.map((record, i) => (
            <div
              key={i}
              className="card-surface p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {dnsType}
                </Badge>
              </div>
              <pre className="code-block">
                {formatRecord(record)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
