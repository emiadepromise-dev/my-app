"use client";

import { useState, useRef } from "react";
import { Copy, Check, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const HASH_ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;

async function computeHash(algorithm: string, data: ArrayBuffer): Promise<string> {
  const subtle = window.crypto.subtle;
  const algoMap: Record<string, string> = {
    "MD5": "SHA-256",
    "SHA-1": "SHA-1",
    "SHA-256": "SHA-256",
    "SHA-512": "SHA-512",
  };

  if (algorithm === "MD5") {
    return computeMD5(new Uint8Array(data));
  }

  const hashBuffer = await subtle.digest(algoMap[algorithm], data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function computeMD5(data: Uint8Array): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md51(s: string) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s: string) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hex_chr = "0123456789abcdef".split("");

  function rhex(n: number) {
    let s = "";
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    }
    return s;
  }

  function hex(x: number[]) {
    return x.map(rhex).join("");
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const input = Array.from(data).map((b) => String.fromCharCode(b)).join("");
  return hex(md51(input));
}

export default function HashCalculatorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedAlgos, setSelectedAlgos] = useState<Set<string>>(
    new Set(HASH_ALGOS)
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setInputText("");
  }

  async function handleCompute() {
    if (!inputText && !selectedFile) return;
    setLoading(true);
    setResults({});
    setError(null);

    try {
      let data: ArrayBuffer;
      if (selectedFile) {
        data = await selectedFile.arrayBuffer();
      } else {
        const encoder = new TextEncoder();
        data = encoder.encode(inputText).buffer;
      }

      const newResults: Record<string, string> = {};
      for (const algo of selectedAlgos) {
        newResults[algo] = await computeHash(algo, data);
      }
      setResults(newResults);
    } catch {
      setError("Failed to compute hashes. Make sure you are using a secure connection (HTTPS).");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function toggleAlgo(algo: string) {
    setSelectedAlgos((prev) => {
      const next = new Set(prev);
      if (next.has(algo)) {
        if (next.size > 1) next.delete(algo);
      } else {
        next.add(algo);
      }
      return next;
    });
  }

  const hasInput = inputText.length > 0 || selectedFile !== null;

  return (
    <div className="page-container">
      <div className="page-header">
        <Link
          href="/security-toolkit"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Security Toolkit
        </Link>
        <h1 className="page-title mt-2">Hash Calculator</h1>
        <p className="page-description">
          Compute hash values for text or files.
        </p>
      </div>

      <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); handleCompute(); }}>
        <div className="space-y-2">
          <Label htmlFor="hash-text-input">Text Input</Label>
          <Textarea
            id="hash-text-input"
            placeholder="Enter text to hash..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setSelectedFile(null);
            }}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Or select a file</Label>
          <div
            className="dropzone p-4"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            role="button"
            tabIndex={0}
            aria-label="Select file to hash"
          >
            <Upload className="size-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Click to select a file"}
              </p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
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

        <div className="space-y-2" role="group" aria-labelledby="hash-algos-label">
          <Label id="hash-algos-label">Algorithms</Label>
          <div className="flex flex-wrap gap-2">
            {HASH_ALGOS.map((algo) => (
              <Button
                key={algo}
                variant={selectedAlgos.has(algo) ? "default" : "outline"}
                aria-pressed={selectedAlgos.has(algo)}
                size="sm"
                onClick={() => toggleAlgo(algo)}
              >
                {algo}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={!hasInput || loading}>
          {loading ? "Computing..." : "Compute Hashes"}
        </Button>

        {error && (
          <div className="error-banner">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <>
            <Separator />
            <div className="space-y-3" aria-live="polite">
              {Object.entries(results).map(([algo, hash]) => (
                <div
                  key={algo}
                  className="card-surface p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-xs">
                      {algo}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleCopy(algo, hash)}
                    >
                      {copiedKey === algo ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copiedKey === algo ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <p className="code-block">{hash}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
