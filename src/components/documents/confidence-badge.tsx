import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number | null;
  showLabel?: boolean;
}

function getLevel(score: number) {
  if (score >= 85) return { color: "emerald", label: "Yüksek", Icon: Check, unread: false } as const;
  if (score >= 60) return { color: "amber", label: "Orta", Icon: AlertTriangle, unread: false } as const;
  if (score >= 30) return { color: "red", label: "Düşük", Icon: X, unread: false } as const;
  return { color: "red", label: "Okunamadı", Icon: X, unread: true } as const;
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: "text-emerald-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-600",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
  },
} as const;

export function ConfidenceBadge({ score, showLabel = false }: ConfidenceBadgeProps) {
  if (score === null || score === undefined) {
    return <span className="text-ink-faint text-sm">-</span>;
  }

  const rounded = Math.round(score);
  const { color, label, Icon, unread } = getLevel(score);
  const c = colorMap[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        c.bg, c.border,
        showLabel ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-[10px]"
      )}
      title={unread ? "Okunamadı" : `Güven: %${rounded}`}
      aria-label={unread ? "Okunamadı" : `${label} güven: %${rounded}`}
    >
      <Icon className={cn("h-3 w-3", c.icon)} strokeWidth={2.5} />
      <span className={c.text}>{unread ? "Okunamadı" : `%${rounded}`}</span>
      {showLabel && !unread && <span className={c.text}>{label}</span>}
    </span>
  );
}
