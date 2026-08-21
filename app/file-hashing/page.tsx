import { FileCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function FileHashingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">File Hashing</h1>
      <p className="text-muted-foreground mb-8">
        Generate and verify file integrity hashes.
      </p>
      <EmptyState
        icon={FileCheck}
        title="File Hashing"
        description="Select a file to generate MD5, SHA-1, SHA-256, and SHA-512 hashes."
      />
    </div>
  );
}
