import type { Finding } from "./types";

let findingCounter = 0;

function fid(): string {
  return `cookie-${++findingCounter}-${Date.now()}`;
}

export function resetFindings(): void {
  findingCounter = 0;
}

export interface CookieInfo {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  domain: string | null;
  path: string | null;
}

export function parseCookies(
  setCookieHeaders: string[]
): CookieInfo[] {
  return setCookieHeaders.map((header) => {
    const parts = header.split(";").map((p) => p.trim());
    const [nameValue, ...attributes] = parts;
    const eqIndex = nameValue.indexOf("=");
    const name = eqIndex > -1 ? nameValue.slice(0, eqIndex).trim() : nameValue.trim();

    const attrMap: Record<string, string> = {};
    for (const attr of attributes) {
      const [key, ...rest] = attr.split("=");
      attrMap[key.trim().toLowerCase()] = rest.join("=").trim();
    }

    return {
      name,
      secure: "secure" in attrMap,
      httpOnly: "httponly" in attrMap,
      sameSite: attrMap["samesite"] ?? null,
      domain: attrMap["domain"] ?? null,
      path: attrMap["path"] ?? null,
    };
  });
}

export function analyzeCookies(
  cookies: CookieInfo[]
): { findings: Finding[] } {
  const findings: Finding[] = [];

  for (const cookie of cookies) {
    if (!cookie.secure) {
      findings.push({
        id: fid(),
        severity: "medium",
        title: `Cookie "${cookie.name}" missing Secure attribute`,
        description:
          "Without the Secure attribute, the cookie can be sent over unencrypted HTTP connections.",
        recommendation: `Set the Secure attribute on cookie "${cookie.name}".`,
      });
    }
    if (!cookie.httpOnly) {
      findings.push({
        id: fid(),
        severity: "medium",
        title: `Cookie "${cookie.name}" missing HttpOnly attribute`,
        description:
          "Without HttpOnly, the cookie is accessible to JavaScript, increasing XSS risk.",
        recommendation: `Set the HttpOnly attribute on cookie "${cookie.name}".`,
      });
    }
    if (!cookie.sameSite) {
      findings.push({
        id: fid(),
        severity: "low",
        title: `Cookie "${cookie.name}" missing SameSite attribute`,
        description:
          "Without SameSite, the cookie may be sent in cross-site requests, increasing CSRF risk.",
        recommendation: `Set SameSite=Strict or SameSite=Lax on cookie "${cookie.name}".`,
      });
    }
  }

  return { findings };
}
