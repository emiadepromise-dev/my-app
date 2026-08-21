"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface WhoisResult {
  domain: string;
  server: string;
  registrar: string | null;
  creationDate: string | null;
  expirationDate: string | null;
  updatedDate: string | null;
  nameServers: string | null;
  status: string | null;
  registrant: string | null;
  registrantCountry: string | null;
  dnssec: string | null;
  raw: string;
}

export default function WhoisLookupPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  async function handleLookup() {
    if (!domain.trim()) {
      setError("Please enter a domain name.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/security/whois-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "WHOIS lookup failed");
        return;
      }
      setResult(data);
    } catch {
      setError("WHOIS lookup failed. Please try again.");
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
        <h1 className="page-title mt-2">WHOIS Lookup</h1>
        <p className="page-description">
          Retrieve domain registration and ownership information.
        </p>
      </div>

      <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleLookup(); }}>
        <div className="flex-1 space-y-1">
          <Label htmlFor="whois-domain">Domain Name</Label>
          <Input
            id="whois-domain"
            placeholder="e.g. example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !domain.trim()}>
          {loading ? "Looking up..." : "Lookup"}
        </Button>
      </form>

      {error && (
        <div className="error-banner max-w-xl" role="alert">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <div className="max-w-2xl space-y-4" aria-live="polite">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{result.domain}</h2>
              <p className="text-xs text-muted-foreground">
                Queried server: {result.server}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(result.raw)}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy Raw"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Registrar", result.registrar],
              ["Created", result.creationDate],
              ["Expires", result.expirationDate],
              ["Updated", result.updatedDate],
              ["Name Servers", result.nameServers],
              ["Status", result.status],
              ["Registrant", result.registrant],
              ["Country", result.registrantCountry],
              ["DNSSEC", result.dnssec],
            ]
              .filter(([, v]) => v !== null)
              .map(([label, value]) => (
                <div
                  key={label}
                  className="info-row"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    {label}
                  </Badge>
                  <p className="info-row-value">{value}</p>
                </div>
              ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
            aria-expanded={showRaw}
            aria-controls="whois-raw-output"
          >
            {showRaw ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {showRaw ? "Hide Raw Output" : "Show Raw Output"}
          </Button>

          {showRaw && (
            <div id="whois-raw-output" className="card-surface p-4 max-h-80 overflow-y-auto">
              <pre className="code-block text-muted-foreground">
                {result.raw}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
