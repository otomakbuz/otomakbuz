import { FileText, TrendingDown, AlertCircle, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/documents";
import { getRecurringPatterns } from "@/lib/actions/patterns";
import { getUpcomingReminders } from "@/lib/actions/reminders";
import { getMonthlyTrends } from "@/lib/actions/reports";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { IncomeExpenseCard } from "@/components/dashboard/income-expense-card";
import { RecurringPatternsCard } from "@/components/dashboard/recurring-patterns-card";
import { UpcomingRemindersCard } from "@/components/dashboard/upcoming-reminders-card";
import { MonthlyTrendMini } from "@/components/dashboard/monthly-trend-mini";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, patterns, upcomingReminders, monthlyTrends] = await Promise.all([
    getDashboardStats(),
    getRecurringPatterns(),
    getUpcomingReminders(),
    getMonthlyTrends(6).catch(() => []),
  ]);
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Panel</h1>
          <p className="text-ink-muted text-sm mt-1">Bu ayki özet ve son belgeler.</p>
        </div>
        <Link href="/yukle"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-receipt-brown text-white text-sm font-medium hover:bg-receipt-brown-dark transition-colors shadow-sm w-full sm:w-auto">
          <FileText className="h-4 w-4" />
          Yeni Belge Yükle
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Bu Ay Belge" value={stats.documents_this_month} icon={FileText} description="Yüklenen belge sayısı" />
        <StatCard title="Bu Ay Gider" value={formatCurrency(stats.total_expense_this_month)} icon={TrendingDown} description="Toplam harcama" />
        <StatCard title="Bu Ay Gelir" value={formatCurrency(stats.total_income_this_month)} icon={TrendingUp} description="Toplam gelir" />
        <StatCard title="İnceleme Bekleyen" value={stats.pending_review_count} icon={AlertCircle} description="Doğrulama gerektiren" />
      </div>

      {/* Trend chart */}
      <div className="receipt-card rounded p-3 sm:p-4">
        <h2 className="text-sm sm:text-base font-semibold text-ink mb-3">Aylık Gelir / Gider Trendi</h2>
        <div className="min-h-[180px]">
          <MonthlyTrendMini data={monthlyTrends} />
        </div>
      </div>

      {/* Charts row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-[2] min-w-0">
          <RecentDocuments documents={stats.recent_documents} />
        </div>
        <div className="lg:flex-1 space-y-6">
          <IncomeExpenseCard
            income={stats.total_income_this_month}
            expense={stats.total_expense_this_month}
            net={stats.net_this_month}
          />
          <CategoryChart data={stats.category_distribution} />
          <UpcomingRemindersCard reminders={upcomingReminders} />
          <RecurringPatternsCard patterns={patterns} />
        </div>
      </div>
    </div>
  );
}
