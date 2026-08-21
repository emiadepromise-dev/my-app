import { Globe } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function WebsiteScannerPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Website Scanner
      </h1>
      <p className="text-muted-foreground mb-8">
        Analyze websites for security vulnerabilities and misconfigurations.
      </p>
      <EmptyState
        icon={Globe}
        title="Website Scanner"
        description="Enter a URL to scan for security headers, SSL configuration, cookies, and more."
      />
    </div>
  );
}
