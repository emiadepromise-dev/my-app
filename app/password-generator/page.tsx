import { KeyRound } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function PasswordGeneratorPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Password Generator
      </h1>
      <p className="text-muted-foreground mb-8">
        Create strong, secure passwords with customizable options.
      </p>
      <EmptyState
        icon={KeyRound}
        title="Password Generator"
        description="Configure length and character options to generate a secure password."
      />
    </div>
  );
}
