import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/scanner/crawler";
import { analyzeHeaders } from "@/lib/scanner/headers";
import { parseCookies, analyzeCookies } from "@/lib/scanner/cookies";
import { analyzeTls } from "@/lib/scanner/tls";
import { detectTechnologies } from "@/lib/scanner/technologies";
import { calculateScore } from "@/lib/scanner/score";
import { validateTargetUrl, safeFetch } from "@/lib/security";
import type { WebsiteScanResult, Finding } from "@/lib/scanner/types";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    let scanUrl = url.trim();
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = "https://" + scanUrl;
    }

    let parsed: URL;
    try {
      parsed = new URL(scanUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid URL." },
        { status: 400 }
      );
    }

    const targetCheck = validateTargetUrl(parsed.toString());
    if (!targetCheck.ok) {
      return NextResponse.json({ error: targetCheck.error }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await safeFetch(parsed.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": "CyberYoshi/0.1 Security Scanner" },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      const message =
        fetchError instanceof Error ? fetchError.message : "Connection failed";
      if (message.includes("private") || message.includes("internal") || message.includes("Redirect")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Could not connect to the target website" },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const contentType = headers["content-type"] || "";
    let html = "";
    if (contentType.includes("text/html")) {
      html = await response.text();
    }

    const findings: Finding[] = [];

    const headerResult = analyzeHeaders(headers);
    findings.push(...headerResult.findings);

    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    const cookies = parseCookies(setCookieHeaders);
    const cookieResult = analyzeCookies(cookies);
    findings.push(...cookieResult.findings);

    const tlsResult = analyzeTls(parsed.toString(), response);
    findings.push(...tlsResult.findings);

    const techResult = detectTechnologies(headers, html);
    findings.push(...techResult.findings);

    const crawl = await crawlWebsite(parsed.origin + parsed.pathname);

    if (crawl.brokenLinks.length > 0) {
      findings.push({
        id: `crawl-${Date.now()}`,
        severity: "low",
        title: `${crawl.brokenLinks.length} broken link(s) found`,
        description:
          "Some links on the page returned errors or were unreachable.",
        evidence: crawl.brokenLinks
          .slice(0, 5)
          .map((bl) => `${bl.url} (${bl.status})`)
          .join(", "),
        recommendation:
          "Fix or remove broken links to improve user experience and SEO.",
      });
    }

    const score = calculateScore(findings);

    const result: WebsiteScanResult = {
      url: parsed.toString(),
      score,
      findings,
      crawl: {
        ...crawl,
        pagesVisited: crawl.pagesVisited.slice(0, 20),
      },
      headers: { headers, findings: headerResult.findings },
      cookies: { cookies, findings: cookieResult.findings },
      tls: tlsResult,
      technologies: techResult,
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during the scan" },
      { status: 500 }
    );
  }
}
