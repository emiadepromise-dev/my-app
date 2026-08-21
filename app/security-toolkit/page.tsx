import { Shield } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function SecurityToolkitPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Security Toolkit
      </h1>
      <p className="text-muted-foreground mb-8">
        Quick-access security utilities.
      </p>
      <EmptyState
        icon={Shield}
        title="Security Toolkit"
        description="IP Lookup, DNS Lookup, WHOIS, HTTP Headers, Hash Calculator, URL Analyzer, and Base64."
      />
    </div>
  );
}
