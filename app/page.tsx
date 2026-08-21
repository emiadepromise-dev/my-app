import {
  Globe,
  Scan,
  FileCheck,
  KeyRound,
  Shield,
} from "lucide-react";

const tools = [
  {
    label: "Website Scanner",
    href: "/website-scanner",
    icon: Globe,
    description: "Scan websites for security issues",
  },
  {
    label: "Port Scanner",
    href: "/port-scanner",
    icon: Scan,
    description: "Discover open ports and services",
  },
  {
    label: "File Hashing",
    href: "/file-hashing",
    icon: FileCheck,
    description: "Generate and verify file hashes",
  },
  {
    label: "Password Generator",
    href: "/password-generator",
    icon: KeyRound,
    description: "Create strong, secure passwords",
  },
  {
    label: "Security Toolkit",
    href: "/security-toolkit",
    icon: Shield,
    description: "IP lookup, DNS, WHOIS, and more",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Select a security tool to get started.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Security Tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50"
            >
              <tool.icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div>
                <div className="font-semibold">{tool.label}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {tool.description}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recent activity. Run a scan to see results here.
          </p>
        </div>
      </div>
    </div>
  );
}
