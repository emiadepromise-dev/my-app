import type { CrawlResult } from "./types";

const MAX_PAGES = 20;
const MAX_DEPTH = 2;
const REQUEST_TIMEOUT = 10000;

export async function crawlWebsite(
  baseUrl: string
): Promise<CrawlResult> {
  const visited = new Set<string>();
  const brokenLinks: { url: string; status: number }[] = [];
  let totalLinks = 0;
  const queue: { url: string; depth: number }[] = [{ url: baseUrl, depth: 0 }];
  const base = new URL(baseUrl);

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const { url, depth } = queue.shift()!;
    const normalized = normalizeUrl(url);

    if (visited.has(normalized)) continue;
    if (depth > MAX_DEPTH) continue;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      const response = await fetch(normalized, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "CyberYoshi/0.1 Security Scanner" },
      });
      clearTimeout(timeout);

      visited.add(normalized);

      if (!response.ok) {
        brokenLinks.push({ url: normalized, status: response.status });
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();
      const links = extractLinks(html, base);
      totalLinks += links.length;

      if (depth < MAX_DEPTH) {
        for (const link of links) {
          if (!visited.has(normalizeUrl(link))) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } catch {
      visited.add(normalized);
      brokenLinks.push({ url: normalized, status: 0 });
    }
  }

  return {
    pagesVisited: Array.from(visited),
    brokenLinks,
    totalLinks,
  };
}

function extractLinks(html: string, base: URL): string[] {
  const links: string[] = [];
  const regex = /href=["']([^"'#]+)/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], base.origin);
      if (
        resolved.origin === base.origin &&
        !resolved.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip)$/i)
      ) {
        links.push(resolved.origin + resolved.pathname);
      }
    } catch {
      // skip invalid URLs
    }
  }

  return links;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}
