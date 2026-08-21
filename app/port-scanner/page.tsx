import { Scan } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function PortScannerPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Port Scanner</h1>
      <p className="text-muted-foreground mb-8">
        Discover open ports and identify running services.
      </p>
      <EmptyState
        icon={Scan}
        title="Port Scanner"
        description="Enter an IP address or hostname to scan for open ports."
      />
    </div>
  );
}
