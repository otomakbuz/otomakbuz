import { cn, getConfidenceColor } from "@/lib/utils";

interface ConfidenceBadgeProps { score: number | null; showLabel?: boolean; }

export function ConfidenceBadge({ score, showLabel = false }: ConfidenceBadgeProps) {
  if (score === null) return <span className="text-slate-400 text-sm">-</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", getConfidenceColor(score))}>
      %{Math.round(score)}
      {showLabel && <span className="hidden sm:inline">{score >= 90 ? " Yuksek" : score >= 70 ? " Orta" : " Dusuk"}</span>}
    </span>
  );
}
