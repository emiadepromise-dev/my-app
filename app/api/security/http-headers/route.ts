import { NextRequest, NextResponse } from "next/server";
import { validateTargetUrl, safeFetch } from "@/lib/security";

const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "x-xss-protection",
  "referrer-policy",
  "permissions-policy",
  "x-permitted-cross-domain-policies",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "cross-origin-embedder-policy",
];

const HEADER_INFO: Record<string, { description: string; recommendation: string }> = {
  "content-security-policy": {
    description: "Controls which resources the browser is allowed to load.",
    recommendation: "Set a strict policy to prevent XSS and data injection.",
  },
  "strict-transport-security": {
    description: "Enforces HTTPS connections for the specified duration.",
    recommendation: "Set to max-age=31536000; includeSubDomains; preload.",
  },
  "x-content-type-options": {
    description: "Prevents MIME-type sniffing.",
    recommendation: "Set to nosniff.",
  },
  "x-frame-options": {
    description: "Controls whether the page can be embedded in frames.",
    recommendation: "Set to DENY or SAMEORIGIN.",
  },
  "x-xss-protection": {
    description: "Enables the browser's XSS filter (legacy).",
    recommendation: "Set to 0 and rely on CSP instead.",
  },
  "referrer-policy": {
    description: "Controls how much referrer information is sent with requests.",
    recommendation: "Set to strict-origin-when-cross-origin or no-referrer.",
  },
  "permissions-policy": {
    description: "Controls which browser features the page can use.",
    recommendation: "Restrict to only features your site needs.",
  },
};

interface HeaderCheckResult {
  url: string;
  status: number;
  headers: Record<string, string>;
  securityHeaders: {
    header: string;
    present: boolean;
    value: string | null;
    description: string;
    recommendation: string;
    severity: "critical" | "high" | "medium" | "low" | "info";
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalized);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const targetCheck = validateTargetUrl(parsedUrl.toString());
    if (!targetCheck.ok) {
      return NextResponse.json({ error: targetCheck.error }, { status: 400 });
    }

    const res = await safeFetch(parsedUrl.toString(), {
      method: "HEAD",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "CyberYoshi-Security-Toolkit/1.0" },
    });

    const allHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      allHeaders[key.toLowerCase()] = value;
    });

    const securityHeaders = SECURITY_HEADERS.map((header) => {
      const value = allHeaders[header] || null;
      const info = HEADER_INFO[header] || { description: "", recommendation: "" };
      const present = value !== null;

      let severity: "critical" | "high" | "medium" | "low" | "info" = "info";
      if (header === "content-security-policy" && !present) severity = "high";
      else if (header === "strict-transport-security" && !present) severity = "medium";
      else if (header === "x-content-type-options" && !present) severity = "medium";
      else if (header === "x-frame-options" && !present) severity = "medium";
      else if (!present) severity = "low";

      return {
        header,
        present,
        value,
        description: info.description,
        recommendation: info.recommendation,
        severity,
      };
    });

    const result: HeaderCheckResult = {
      url: parsedUrl.toString(),
      status: res.status,
      headers: allHeaders,
      securityHeaders,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch headers.";
    return NextResponse.json(
      { error: message.includes("private") || message.includes("internal") || message.includes("Redirect") ? message : "Failed to fetch headers. Please check the URL." },
      { status: 500 }
    );
  }
}
