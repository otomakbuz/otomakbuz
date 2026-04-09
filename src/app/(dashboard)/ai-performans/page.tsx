import { Brain } from "lucide-react";
import { getDetailedAiStats } from "@/lib/actions/documents";
import { AiPerformanceDashboard } from "@/components/dashboard/ai-performance-dashboard";

export default async function AiPerformansPage() {
  const stats = await getDetailedAiStats();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Brain className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">AI Performansı</h1>
          <p className="text-ink-muted text-sm">OCR tanıma doğruluğu, alan bazlı başarı ve trend analizi.</p>
        </div>
      </div>

      <AiPerformanceDashboard stats={stats} />
    </div>
  );
}
