import type { DocumentDirection } from "@/types";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const directionConfig: Record<DocumentDirection, { label: string; icon: typeof ArrowDownLeft; className: string }> = {
  income: {
    label: "Gelir",
    icon: ArrowDownLeft,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  expense: {
    label: "Gider",
    icon: ArrowUpRight,
    className: "bg-red-50 text-red-700 border-red-200/60",
  },
};

interface DirectionBadgeProps {
  direction: DocumentDirection;
  size?: "sm" | "md";
}

export function DirectionBadge({ direction, size = "sm" }: DirectionBadgeProps) {
  const config = directionConfig[direction];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
}
