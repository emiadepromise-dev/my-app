import { History } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ScanHistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Scan History</h1>
      <p className="text-muted-foreground mb-8">
        View and manage your past scan results.
      </p>
      <EmptyState
        icon={History}
        title="No Scan History"
        description="Results from your scans will appear here."
      />
    </div>
  );
}
