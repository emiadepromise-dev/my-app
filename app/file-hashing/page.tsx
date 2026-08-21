"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecentActivity } from "@/hooks/use-recent-activity";

interface Hashes {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

const HASH_ALGOS = [
  { key: "md5" as const, label: "MD5", bitLength: 32 },
  { key: "sha1" as const, label: "SHA-1", bitLength: 40 },
  { key: "sha256" as const, label: "SHA-256", bitLength: 64 },
  { key: "sha512" as const, label: "SHA-512", bitLength: 128 },
];

export default function FileHashingPage() {
  const { addActivity } = useRecentActivity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [knownHash, setKnownHash] = useState("");
  const [verification, setVerification] = useState<{
    match: boolean;
    algorithm: string;
  } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setHashes(null);
    setError(null);
    setVerification(null);
    setKnownHash("");
  }

  async function handleHash() {
    if (!selectedFile) {
      setError("Please select a file to hash.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File is too large. Maximum size is 50 MB.");
      return;
    }

    setLoading(true);
    setError(null);
    setHashes(null);
    setVerification(null);

    try {
      const buffer = await selectedFile.arrayBuffer();

      const res = await fetch("/api/file-hash", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Hashing failed");
        return;
      }

      setHashes(data.hashes);

      addActivity({
        id: `fh-${Date.now()}`,
        type: "file-hash",
        target: selectedFile.name,
        verified: null,
        timestamp: Date.now(),
      });

      fetch("/api/scan-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file-hash",
          target: selectedFile.name,
          summary: "Hash generated",
          resultData: { hashes: data.hashes, size: selectedFile.size },
        }),
      });
    } catch {
      setError("Failed to hash file. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleVerify() {
    if (!hashes || !knownHash.trim()) {
      setVerification(null);
      return;
    }

    const cleanKnown = knownHash.trim().toLowerCase().replace(/[^a-f0-9]/g, "");
    const length = cleanKnown.length;

    let algo: keyof Hashes | null = null;
    if (length === 32) algo = "md5";
    else if (length === 40) algo = "sha1";
    else if (length === 64) algo = "sha256";
    else if (length === 128) algo = "sha512";

    if (!algo) {
      setVerification(null);
      return;
    }

    const match = hashes[algo] === cleanKnown;
    setVerification({ match, algorithm: algo });

    if (selectedFile) {
      addActivity({
        id: `fh-${Date.now()}`,
        type: "file-hash",
        target: selectedFile.name,
        verified: match,
        timestamp: Date.now(),
      });

      fetch("/api/scan-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file-hash",
          target: selectedFile.name,
          summary: match ? "Verified" : "Not verified",
          resultData: { hashes, size: selectedFile.size },
        }),
      });
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">File Hashing</h1>
        <p className="page-description">
          Generate and verify file integrity hashes.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl">
        <div className="space-y-2">
          <Label htmlFor="file-dropzone">Select File</Label>
          <div
            id="file-dropzone"
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            role="button"
            tabIndex={0}
            aria-label="Select file to hash"
          >
            <Upload className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {selectedFile ? selectedFile.name : "Click to select a file"}
              </p>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {formatSize(selectedFile.size)}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Button
          onClick={handleHash}
          disabled={!selectedFile || loading}
        >
          {loading ? "Hashing..." : "Generate Hashes"}
        </Button>

        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {hashes && (
          <div className="space-y-4">
            <Separator />
            <h2 className="section-header">Hash Results</h2>
            <div className="space-y-3">
              {HASH_ALGOS.map(({ key, label }) => (
                <div
                  key={key}
                  className="card-surface p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-xs">
                      {label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleCopy(key, hashes[key])}
                    >
                      {copiedKey === key ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copiedKey === key ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="code-block">
                    {hashes[key]}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="known-hash">Verify Against Known Hash</Label>
              <Input
                id="known-hash"
                placeholder="Paste a known MD5, SHA-1, SHA-256, or SHA-512 hash"
                value={knownHash}
                onChange={(e) => {
                  setKnownHash(e.target.value);
                  setVerification(null);
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste a hash to compare. The algorithm is auto-detected from
                length (32=MD5, 40=SHA-1, 64=SHA-256, 128=SHA-512).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerify}
                disabled={!knownHash.trim()}
              >
                Verify
              </Button>
            </div>

            {verification && (
              <div
                className={
                  verification.match ? "success-banner" : "error-banner"
                }
                role="alert"
              >
                {verification.match ? (
                  <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      verification.match ? "text-success" : "text-destructive"
                    }`}
                  >
                    {verification.match
                      ? "Hashes match"
                      : "Hashes do not match"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Compared using{" "}
                    {HASH_ALGOS.find((a) => a.key === verification.algorithm)
                      ?.label ?? verification.algorithm}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
