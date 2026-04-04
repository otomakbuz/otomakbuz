import { FileText, TrendingDown, AlertCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/documents";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel</h1>
        <p className="text-slate-600 text-sm mt-1">Bu ayki ozet ve son belgeler.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Bu Ay Belge" value={stats.documents_this_month} icon={FileText} description="Yuklenen belge sayisi" />
        <StatCard title="Bu Ay Gider" value={formatCurrency(stats.total_expense_this_month)} icon={TrendingDown} description="Toplam harcama" />
        <StatCard title="Inceleme Bekleyen" value={stats.pending_review_count} icon={AlertCircle} description="Dogrulama gerektiren" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentDocuments documents={stats.recent_documents} />
        <CategoryChart data={stats.category_distribution} />
      </div>
    </div>
  );
}
