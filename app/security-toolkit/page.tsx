import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe,
  Search,
  Server,
  FileText,
  Calculator,
  LinkIcon,
  Binary,
} from "lucide-react";

const tools = [
  {
    title: "IP Lookup",
    description: "Geolocation and network info for an IP address.",
    href: "/security-toolkit/ip-lookup",
    icon: Globe,
  },
  {
    title: "DNS Lookup",
    description: "Query DNS records for a domain name.",
    href: "/security-toolkit/dns-lookup",
    icon: Search,
  },
  {
    title: "WHOIS Lookup",
    description: "Domain registration and ownership info.",
    href: "/security-toolkit/whois-lookup",
    icon: Server,
  },
  {
    title: "HTTP Header Checker",
    description: "Inspect response headers and security posture.",
    href: "/security-toolkit/http-headers",
    icon: FileText,
  },
  {
    title: "Hash Calculator",
    description: "Compute MD5, SHA-1, SHA-256, SHA-512 hashes.",
    href: "/security-toolkit/hash-calculator",
    icon: Calculator,
  },
  {
    title: "URL Analyzer",
    description: "Parse URLs and identify security concerns.",
    href: "/security-toolkit/url-analyzer",
    icon: LinkIcon,
  },
  {
    title: "Base64",
    description: "Encode and decode Base64 strings.",
    href: "/security-toolkit/base64",
    icon: Binary,
  },
];

export const metadata: Metadata = {
  title: "Security Toolkit | CyberYoshi",
};

export default function SecurityToolkitPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Security Toolkit</h1>
        <p className="page-description">
          Quick-access security utilities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group card-surface card-hover p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <tool.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
