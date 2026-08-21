import type { Finding, TechnologyInfo } from "./types";

let findingCounter = 0;

function fid(): string {
  return `tech-${++findingCounter}-${Date.now()}`;
}

export function resetFindings(): void {
  findingCounter = 0;
}

const TECHNOLOGY_SIGNATURES: {
  pattern: RegExp;
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
  location: "header" | "html" | "meta" | "script";
}[] = [
  {
    pattern: /wordpress/i,
    name: "WordPress",
    category: "CMS",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /drupal/i,
    name: "Drupal",
    category: "CMS",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /joomla/i,
    name: "Joomla",
    category: "CMS",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /next[._-]js|__next/i,
    name: "Next.js",
    category: "Framework",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /react|__react/i,
    name: "React",
    category: "Framework",
    confidence: "medium",
    location: "script",
  },
  {
    pattern: /vue|__vue__/i,
    name: "Vue.js",
    category: "Framework",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /angular/i,
    name: "Angular",
    category: "Framework",
    confidence: "high",
    location: "html",
  },
  {
    pattern: /jquery/i,
    name: "jQuery",
    category: "Library",
    confidence: "medium",
    location: "script",
  },
  {
    pattern: /bootstrap/i,
    name: "Bootstrap",
    category: "CSS Framework",
    confidence: "medium",
    location: "html",
  },
  {
    pattern: /tailwind/i,
    name: "Tailwind CSS",
    category: "CSS Framework",
    confidence: "medium",
    location: "html",
  },
  {
    pattern: /google-analytics|gtag|ga\(/i,
    name: "Google Analytics",
    category: "Analytics",
    confidence: "high",
    location: "script",
  },
  {
    pattern: /gtm\.js|googletagmanager/i,
    name: "Google Tag Manager",
    category: "Tag Manager",
    confidence: "high",
    location: "script",
  },
  {
    pattern: /cloudflare/i,
    name: "Cloudflare",
    category: "CDN",
    confidence: "high",
    location: "header",
  },
  {
    pattern: /apache/i,
    name: "Apache",
    category: "Web Server",
    confidence: "high",
    location: "header",
  },
  {
    pattern: /nginx/i,
    name: "Nginx",
    category: "Web Server",
    confidence: "high",
    location: "header",
  },
  {
    pattern: /iis/i,
    name: "Microsoft IIS",
    category: "Web Server",
    confidence: "high",
    location: "header",
  },
];

export function detectTechnologies(
  headers: Record<string, string>,
  html: string
): { technologies: TechnologyInfo[]; findings: Finding[] } {
  const findings: Finding[] = [];
  const technologies: TechnologyInfo[] = [];
  const seen = new Set<string>();

  const headerText = Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  for (const sig of TECHNOLOGY_SIGNATURES) {
    if (seen.has(sig.name)) continue;

    let source = "";
    if (sig.location === "header" && sig.pattern.test(headerText)) {
      source = "HTTP headers";
    } else if (
      (sig.location === "html" || sig.location === "meta" || sig.location === "script") &&
      sig.pattern.test(html)
    ) {
      source = "Page content";
    }

    if (source) {
      seen.add(sig.name);
      technologies.push({
        name: sig.name,
        category: sig.category,
        confidence: sig.confidence,
      });
    }
  }

  if (technologies.length > 0) {
    findings.push({
      id: fid(),
      severity: "informational",
      title: `${technologies.length} technology(ies) detected`,
      description: `Detected: ${technologies.map((t) => t.name).join(", ")}`,
      recommendation:
        "Ensure detected technologies are kept up to date to avoid known vulnerabilities.",
    });
  }

  const serverHeader = headers["server"];
  if (serverHeader) {
    findings.push({
      id: fid(),
      severity: "low",
      title: "Server header exposes version information",
      description:
        "The Server header reveals the web server software, which can help attackers identify vulnerabilities.",
      evidence: `Server: ${serverHeader}`,
      recommendation:
        "Remove or minimize the Server header to reduce information leakage.",
    });
  }

  const poweredBy = headers["x-powered-by"];
  if (poweredBy) {
    findings.push({
      id: fid(),
      severity: "low",
      title: "X-Powered-By header exposes technology",
      description:
        "The X-Powered-By header reveals the technology stack, which can help attackers.",
      evidence: `X-Powered-By: ${poweredBy}`,
      recommendation: "Remove the X-Powered-By header.",
    });
  }

  return { technologies, findings };
}
