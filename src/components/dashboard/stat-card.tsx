import { type LucideIcon } from "lucide-react";

interface StatCardProps { title: string; value: string | number; icon: LucideIcon; description?: string; }

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="receipt-card rounded p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-ink-muted">{title}</p>
          {description && <p className="text-[11px] text-ink-faint mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Icon className="h-5 w-5 text-receipt-brown" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-ink tracking-tight leading-none">{value}</p>
    </div>
  );
}
