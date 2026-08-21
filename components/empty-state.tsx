import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="card-surface flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
