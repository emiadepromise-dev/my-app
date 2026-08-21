import type { Finding } from "./types";

let findingCounter = 0;

function fid(): string {
  return `tls-${++findingCounter}-${Date.now()}`;
}

export function resetFindings(): void {
  findingCounter = 0;
}

export function analyzeTls(
  url: string,
  response: Response
): { protocol: string; redirectsToHttps: boolean; findings: Finding[] } {
  const findings: Finding[] = [];
  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === "https:";
  const redirectsToHttps = !isHttps && response.url.startsWith("https://");

  if (!isHttps) {
    findings.push({
      id: fid(),
      severity: "high",
      title: "Site does not use HTTPS",
      description:
        "The website is served over unencrypted HTTP. Data in transit is vulnerable to interception.",
      recommendation:
        "Enable HTTPS and redirect all HTTP traffic to HTTPS.",
    });
  }

  if (redirectsToHttps) {
    findings.push({
      id: fid(),
      severity: "informational",
      title: "HTTP redirects to HTTPS",
      description:
        "The site redirects HTTP requests to HTTPS, which is good practice.",
      recommendation: "No action needed.",
    });
  }

  if (isHttps) {
    findings.push({
      id: fid(),
      severity: "informational",
      title: "HTTPS is enabled",
      description: "The website uses HTTPS for encrypted connections.",
      recommendation: "No action needed.",
    });
  }

  return {
    protocol: parsedUrl.protocol.replace(":", ""),
    redirectsToHttps,
    findings,
  };
}
