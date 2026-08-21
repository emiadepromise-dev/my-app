"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

type CharsetKey = keyof typeof CHARSETS;

interface Options {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

function generatePassword(length: number, options: Options): string {
  const enabledKeys = (Object.keys(options) as CharsetKey[]).filter(
    (k) => options[k]
  );
  if (enabledKeys.length === 0) return "";

  const pool = enabledKeys.map((k) => CHARSETS[k]).join("");
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[array[i] % pool.length];
  }
  return result;
}

function getStrength(
  length: number,
  options: Options,
  password: string
): { label: string; score: number; color: string } {
  if (!password) return { label: "None", score: 0, color: "text-muted-foreground" };

  let poolSize = 0;
  if (options.uppercase) poolSize += 26;
  if (options.lowercase) poolSize += 26;
  if (options.numbers) poolSize += 10;
  if (options.symbols) poolSize += CHARSETS.symbols.length;

  const entropy = length * Math.log2(Math.max(poolSize, 1));

  if (entropy < 28) return { label: "Very Weak", score: 1, color: "text-severity-critical" };
  if (entropy < 36) return { label: "Weak", score: 2, color: "text-severity-high" };
  if (entropy < 60) return { label: "Fair", score: 3, color: "text-warning" };
  if (entropy < 80) return { label: "Strong", score: 4, color: "text-success" };
  return { label: "Very Strong", score: 5, color: "text-success" };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<Options>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const enabledCount = Object.values(options).filter(Boolean).length;
  const hasAny = enabledCount > 0;

  const strength = getStrength(length, options, password);

  const handleGenerate = useCallback(() => {
    if (!hasAny) return;
    setPassword(generatePassword(length, options));
    setCopied(false);
  }, [length, options, hasAny]);

  function handleCopy() {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleOption(key: CharsetKey) {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Password Generator</h1>
        <p className="page-description">
          Create strong, secure passwords with customizable options.
        </p>
      </div>

      <div className="space-y-6 max-w-xl">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Generated Password</Label>
            {password && (
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
            )}
          </div>
          <div
            className="font-mono text-lg break-all min-h-[2.5rem] flex items-center"
            aria-live="polite"
          >
            {password || (
              <span className="text-muted-foreground">
                Click generate to create a password
              </span>
            )}
          </div>
        </div>

        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Strength</Label>
              <span className={`text-sm font-medium ${strength.color}`}>
                {strength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < strength.score
                      ? strength.score <= 2
                        ? "bg-destructive"
                        : strength.score <= 3
                        ? "bg-warning"
                        : "bg-success"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="card-surface p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-length">Length</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {length}
              </span>
            </div>
            <Slider
              id="password-length"
              value={[length]}
              onValueChange={(value) => setLength(Array.isArray(value) ? value[0] : value)}
              min={4}
              max={128}
              step={1}
              aria-label={`Password length: ${length}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          <div className="space-y-3" role="group" aria-labelledby="char-types-label">
            <Label id="char-types-label">Character Types</Label>
            {(
              [
                ["uppercase", "Uppercase (A-Z)"],
                ["lowercase", "Lowercase (a-z)"],
                ["numbers", "Numbers (0-9)"],
                ["symbols", "Symbols (!@#$%...)"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          {!hasAny && (
            <div className="error-banner">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Select at least one character type.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={!hasAny}>
              Generate
            </Button>
            {password && (
              <Button variant="outline" onClick={handleGenerate}>
                <RefreshCw className="size-4" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
