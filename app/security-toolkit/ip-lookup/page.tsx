"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export default function IPLookupPage() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleLookup() {
    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/security/ip-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ip.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lookup failed");
        return;
      }
      setResult(data);
    } catch {
      setError("IP lookup failed. Please try again.");
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
        <h1 className="page-title mt-2">IP Lookup</h1>
        <p className="page-description">
          Retrieve geolocation and network information for an IP address.
        </p>
      </div>

      <form className="flex gap-3 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleLookup(); }}>
        <div className="flex-1 space-y-1">
          <Label htmlFor="ip-address">IP Address</Label>
          <Input
            id="ip-address"
            placeholder="e.g. 8.8.8.8"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !ip.trim()}>
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
            <h2 className="text-lg font-semibold">{result.ip}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(result.ip)}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy IP"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Country", `${result.country} (${result.countryCode})`],
              ["Region", result.region],
              ["City", result.city],
              ["ZIP", result.zip],
              ["Latitude", String(result.lat)],
              ["Longitude", String(result.lon)],
              ["Timezone", result.timezone],
              ["ISP", result.isp],
              ["Organization", result.org],
              ["AS Number", result.as],
            ].map(([label, value]) => (
              <div
                key={label}
                className="info-row"
              >
                <Badge variant="outline" className="text-xs mb-1">
                  {label}
                </Badge>
                <p className="info-row-value">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
