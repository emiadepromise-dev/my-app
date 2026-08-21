"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Mode = "encode" | "decode";

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleProcess() {
    setError(null);
    setOutput("");

    if (!input.trim()) {
      setError("Input is required.");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = btoa(
          new TextEncoder()
            .encode(input)
            .reduce((s, b) => s + String.fromCharCode(b), "")
        );
        setOutput(encoded);
      } else {
        const decoded = atob(input.trim());
        const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch {
      setError(
        mode === "decode"
          ? "Invalid Base64 input. Please check your input."
          : "Encoding failed."
      );
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
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
        <h1 className="page-title mt-2">Base64</h1>
        <p className="page-description">
          Encode and decode Base64 strings.
        </p>
      </div>

      <form className="space-y-4 max-w-2xl" onSubmit={(e) => { e.preventDefault(); handleProcess(); }}>
        <div className="flex gap-2">
          <Button
            variant={mode === "encode" ? "default" : "outline"}
            aria-pressed={mode === "encode"}
            onClick={() => {
              setMode("encode");
              setOutput("");
              setError(null);
            }}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "outline"}
            aria-pressed={mode === "decode"}
            onClick={() => {
              setMode("decode");
              setOutput("");
              setError(null);
            }}
          >
            Decode
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="base64-input">{mode === "encode" ? "Plain Text" : "Base64 String"}</Label>
          <Textarea
            id="base64-input"
            placeholder={
              mode === "encode"
                ? "Enter text to encode..."
                : "Enter Base64 string to decode..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={!input.trim()}>
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>

        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {output && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Result</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="card-surface p-4" aria-live="polite">
                <p className="code-block">
                  {output}
                </p>
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
