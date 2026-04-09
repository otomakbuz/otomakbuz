import { Lightbulb, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/actions/insights";

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
} as const;

const styleMap = {
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-800", metric: "text-amber-700" },
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-800", metric: "text-blue-700" },
  success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-800", metric: "text-emerald-700" },
} as const;

interface SmartInsightsCardProps {
  insights: Insight[];
}

export function SmartInsightsCard({ insights }: SmartInsightsCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className="receipt-card rounded p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-4 w-4 text-receipt-gold" />
        <h3 className="text-sm font-semibold text-ink">Akıllı Öneriler</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, idx) => {
          const Icon = iconMap[insight.type];
          const s = styleMap[insight.type];
          return (
            <div key={idx} className={cn("flex items-start gap-3 p-3 rounded border", s.bg, s.border)}>
              <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", s.icon)} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", s.text)}>{insight.title}</p>
                <p className={cn("text-xs mt-0.5", s.text, "opacity-80")}>{insight.description}</p>
              </div>
              {insight.metric && (
                <span className={cn("text-xs font-semibold whitespace-nowrap", s.metric)}>
                  {insight.metric}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
