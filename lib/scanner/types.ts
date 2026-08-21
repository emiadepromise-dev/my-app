export type Severity = "critical" | "high" | "medium" | "low" | "informational";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;
  recommendation: string;
}

export interface CrawlResult {
  pagesVisited: string[];
  brokenLinks: { url: string; status: number }[];
  totalLinks: number;
}

export interface HeaderAnalysis {
  headers: Record<string, string>;
  findings: Finding[];
}

export interface CookieInfo {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  domain: string | null;
  path: string | null;
}

export interface CookieAnalysis {
  cookies: CookieInfo[];
  findings: Finding[];
}

export interface TlsInfo {
  protocol: string;
  redirectsToHttps: boolean;
  findings: Finding[];
}

export interface TechnologyInfo {
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
}

export interface TechnologyDetection {
  technologies: TechnologyInfo[];
  findings: Finding[];
}

export interface WebsiteScanResult {
  url: string;
  score: number;
  findings: Finding[];
  crawl: CrawlResult;
  headers: HeaderAnalysis;
  cookies: CookieAnalysis;
  tls: TlsInfo;
  technologies: TechnologyDetection;
  scannedAt: string;
}
