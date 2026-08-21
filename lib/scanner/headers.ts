import type { Finding } from "./types";

let findingCounter = 0;

function fid(): string {
  return `f-${++findingCounter}-${Date.now()}`;
}

export function resetFindings(): void {
  findingCounter = 0;
}

const SECURITY_HEADERS: {
  name: string;
  required: boolean;
  description: string;
  recommendation: string;
}[] = [
  {
    name: "content-security-policy",
    required: true,
    description: "Controls which resources the browser is allowed to load.",
    recommendation:
      "Add a Content-Security-Policy header to prevent XSS and code injection attacks.",
  },
  {
    name: "strict-transport-security",
    required: true,
    description: "Enforces HTTPS connections.",
    recommendation:
      "Add Strict-Transport-Security with a max-age of at least 31536000.",
  },
  {
    name: "x-content-type-options",
    required: true,
    description: "Prevents MIME-type sniffing.",
    recommendation: "Add X-Content-Type-Options: nosniff.",
  },
  {
    name: "x-frame-options",
    required: true,
    description: "Prevents clickjacking by controlling iframe embedding.",
    recommendation: "Add X-Frame-Options: DENY or SAMEORIGIN.",
  },
  {
    name: "referrer-policy",
    required: false,
    description: "Controls how much referrer information is sent with requests.",
    recommendation:
      "Add Referrer-Policy: strict-origin-when-cross-origin or similar.",
  },
  {
    name: "permissions-policy",
    required: false,
    description: "Controls which browser features and APIs can be used.",
    recommendation: "Add Permissions-Policy to restrict unnecessary features.",
  },
  {
    name: "x-xss-protection",
    required: false,
    description: "Legacy XSS filter (deprecated but still informative).",
    recommendation:
      "If present, set to 0. Modern CSP is preferred over X-XSS-Protection.",
  },
];

export function analyzeHeaders(
  headers: Record<string, string>
): { findings: Finding[] } {
  const findings: Finding[] = [];
  const lowerHeaders = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  for (const check of SECURITY_HEADERS) {
    const value = lowerHeaders[check.name];
    if (!value) {
      findings.push({
        id: fid(),
        severity: check.required ? "medium" : "low",
        title: `Missing ${check.name}`,
        description: check.description,
        recommendation: check.recommendation,
      });
    }
  }

  if (lowerHeaders["x-xss-protection"] && lowerHeaders["x-xss-protection"] !== "0") {
    findings.push({
      id: fid(),
      severity: "low",
      title: "Legacy X-XSS-Protection is enabled",
      description:
        "The X-XSS-Protection header is deprecated. Modern browsers rely on CSP instead.",
      evidence: `X-X-XSS-Protection: ${lowerHeaders["x-xss-protection"]}`,
      recommendation:
        "Set X-X-XSS-Protection to 0 and rely on Content-Security-Policy instead.",
    });
  }

  if (lowerHeaders["content-security-policy"]) {
    const csp = lowerHeaders["content-security-policy"];
    if (csp.includes("'unsafe-inline'")) {
      findings.push({
        id: fid(),
        severity: "medium",
        title: "CSP allows unsafe-inline",
        description:
          "The Content-Security-Policy includes 'unsafe-inline', which weakens XSS protection.",
        evidence: `CSP contains 'unsafe-inline'`,
        recommendation:
          "Remove 'unsafe-inline' and use nonces or hashes for inline scripts.",
      });
    }
    if (csp.includes("'unsafe-eval'")) {
      findings.push({
        id: fid(),
        severity: "medium",
        title: "CSP allows unsafe-eval",
        description:
          "The Content-Security-Policy includes 'unsafe-eval', which allows eval() and similar dangerous functions.",
        evidence: `CSP contains 'unsafe-eval'`,
        recommendation: "Remove 'unsafe-eval' from the Content-Security-Policy.",
      });
    }
  }

  return { findings };
}
