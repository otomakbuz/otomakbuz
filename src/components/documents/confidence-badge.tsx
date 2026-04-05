import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number | null;
  showLabel?: boolean;
}

// %80 ve üstü → "doğru" (tik), altı → "kontrol et" (X)
const CONFIDENCE_THRESHOLD = 80;

export function ConfidenceBadge({ score, showLabel = false }: ConfidenceBadgeProps) {
  if (score === null || score === undefined) {
    return <span className="text-ink-faint text-sm">-</span>;
  }

  const isOk = score >= CONFIDENCE_THRESHOLD;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border text-ink",
        showLabel ? "px-2 py-0.5 text-xs font-medium" : "h-5 w-5 justify-center p-0",
        "border-paper-lines bg-surface"
      )}
      title={`Güven: %${Math.round(score)}`}
      aria-label={isOk ? "Doğru bilgi" : "Kontrol et"}
    >
      {isOk ? (
        <Check className="h-3 w-3 text-receipt-brown" strokeWidth={3} />
      ) : (
        <X className="h-3 w-3 text-red-600" strokeWidth={3} />
      )}
      {showLabel && (
        <span className="text-ink-muted">{isOk ? "Doğru" : "Kontrol et"}</span>
      )}
    </span>
  );
}
