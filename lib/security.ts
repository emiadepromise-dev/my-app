const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^localhost$/i,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^\[::1\]$/,
];

export function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "0.0.0.0" || lower === "::1" || lower === "[::1]") {
    return true;
  }
  return PRIVATE_IP_PATTERNS.some((p) => p.test(lower));
}

export function validateTargetUrl(urlStr: string): { ok: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { ok: false, error: "Invalid URL format." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  if (isPrivateHost(parsed.hostname)) {
    return { ok: false, error: "Scanning private or internal addresses is not allowed." };
  }

  return { ok: true };
}

export function validateTargetHost(host: string): { ok: boolean; error?: string } {
  const trimmed = host.trim().toLowerCase();
  const hostname = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "").split(":")[0];

  if (!hostname) {
    return { ok: false, error: "Target is required." };
  }

  if (isPrivateHost(hostname)) {
    return { ok: false, error: "Scanning private or internal addresses is not allowed." };
  }

  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;

  if (!ipv4.test(hostname) && !hostnameRegex.test(hostname)) {
    return { ok: false, error: "Invalid target format. Enter an IP address or hostname." };
  }

  return { ok: true };
}

const MAX_REDIRECTS = 5;

export async function safeFetch(
  url: string,
  init: RequestInit
): Promise<Response> {
  let currentUrl = url;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await fetch(currentUrl, { ...init, redirect: "manual" });

    if (res.status < 300 || res.status >= 400) {
      return res;
    }

    const location = res.headers.get("location");
    if (!location) {
      return res;
    }

    let redirectUrl: URL;
    try {
      redirectUrl = new URL(location, currentUrl);
    } catch {
      throw new Error("Invalid redirect URL");
    }

    if (!["http:", "https:"].includes(redirectUrl.protocol)) {
      throw new Error("Redirect to non-HTTP protocol is not allowed");
    }

    if (isPrivateHost(redirectUrl.hostname)) {
      throw new Error(
        "Redirect to private or internal address is not allowed"
      );
    }

    currentUrl = redirectUrl.toString();
  }

  throw new Error("Too many redirects");
}
