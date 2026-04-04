import { cn, getStatusLabel, getStatusColor } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium", getStatusColor(status))}>
      {getStatusLabel(status)}
    </span>
  );
}
