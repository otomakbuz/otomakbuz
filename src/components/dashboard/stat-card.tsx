import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps { title: string; value: string | number; icon: LucideIcon; description?: string; }

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-500">{title}</p>
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
