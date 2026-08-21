"use client";

import Link from "next/link";
import {
  Globe,
  Scan,
  FileCheck,
  KeyRound,
  Shield,
  History,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { useRecentActivity } from "@/hooks/use-recent-activity";
import type { Activity } from "@/lib/types";

const tools = [
  {
    label: "Website Scanner",
    href: "/website-scanner",
    icon: Globe,
    description: "Scan websites for security headers, SSL, cookies, and misconfigurations.",
  },
  {
    label: "Port Scanner",
    href: "/port-scanner",
    icon: Scan,
    description: "Discover open ports and identify running services.",
  },
  {
    label: "File Hashing",
    href: "/file-hashing",
    icon: FileCheck,
    description: "Generate and verify file integrity hashes.",
  },
  {
    label: "Password Generator",
    href: "/password-generator",
    icon: KeyRound,
    description: "Create strong, secure passwords with customizable options.",
  },
  {
    label: "Security Toolkit",
    href: "/security-toolkit",
    icon: Shield,
    description: "IP lookup, DNS, WHOIS, HTTP headers, and more utilities.",
  },
];

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activitySummary(activity: Activity): string {
  switch (activity.type) {
    case "website-scan":
      return activity.score !== null
        ? `Score: ${activity.score}/100`
        : "Scan complete";
    case "port-scan":
      return `${activity.openPorts} open port${activity.openPorts !== 1 ? "s" : ""}`;
    case "file-hash":
      return activity.verified === true
        ? "Verified"
        : activity.verified === false
          ? "Not verified"
          : "Hash generated";
  }
}

function activityTypeLabel(type: Activity["type"]): string {
  switch (type) {
    case "website-scan":
      return "Website Scan";
    case "port-scan":
      return "Port Scan";
    case "file-hash":
      return "File Hash";
  }
}

function activityIcon(type: Activity["type"]) {
  switch (type) {
    case "website-scan":
      return Globe;
    case "port-scan":
      return Scan;
    case "file-hash":
      return FileCheck;
  }
}

export default function DashboardPage() {
  const { activities } = useRecentActivity();
  const recent = activities.slice(0, 5);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          CyberYoshi — Lightweight cybersecurity toolkit for authorized security testing.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">Developed by emiadepromise-dev</p>
      </div>

      <div className="space-y-4">
        <h2 className="section-header">Security Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group card-surface p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15 group-hover:ring-primary/20">
                  <tool.icon className="size-5 text-primary" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mt-1" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{tool.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-header">Recent Activity</h2>
          {recent.length > 0 && (
            <Link
              href="/scan-history"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="card-surface p-10 text-center">
            <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <History className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No recent activity</p>
            <p className="text-xs text-muted-foreground/60">
              Run a scan to see results here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recent.map((activity) => {
              const Icon = activityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-lg border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-accent/30"
                >
                  <div className="size-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {activity.target}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activityTypeLabel(activity.type)}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {activitySummary(activity)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground/50 shrink-0 tabular-nums">
                    {timeAgo(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card-surface p-6 flex items-center gap-4">
        <div className="size-10 rounded-xl bg-primary/8 flex items-center justify-center ring-1 ring-primary/10 shrink-0">
          <Rocket className="size-5 text-primary/70" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            CyberYoshi V2{" "}
            <span className="text-primary/60 font-medium ml-1">Coming Soon</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            A bigger, smarter CyberYoshi experience is on the way.
          </p>
        </div>
      </div>
    </div>
  );
}
