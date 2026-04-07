import { getDocuments } from "@/lib/actions/documents";
import {
  getMonthlyTrends,
  getSupplierRanking,
  getCategoryBreakdown,
  getCashflowProjection,
  getYearlySummary,
} from "@/lib/actions/reports";
import { ReportSummary } from "@/components/reports/report-summary";
import { ExportButtons } from "@/components/reports/export-buttons";
import { ReportTabs } from "@/components/reports/report-tabs";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const [
    documents,
    trends,
    supplierRanking,
    categoryBreakdown,
    cashflowProjection,
    yearlySummary,
  ] = await Promise.all([
    getDocuments({ date_from: params.date_from, date_to: params.date_to }),
    getMonthlyTrends(),
    getSupplierRanking(),
    getCategoryBreakdown(),
    getCashflowProjection(),
    getYearlySummary(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
            <BarChart3 className="h-5 w-5 text-receipt-brown" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Raporlar</h1>
            <p className="text-ink-muted text-sm">Gelişmiş analizler, trendler ve projeksiyonlar.</p>
          </div>
        </div>
        <ExportButtons documents={documents} />
      </div>

      {/* Date filter + basic summary */}
      <form className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end receipt-card rounded p-3 sm:p-4">
        <div className="flex gap-3 flex-1">
          <div className="flex-1">
            <label className="text-xs text-ink-muted mb-1 block font-medium">Başlangıç</label>
            <input type="date" name="date_from" defaultValue={params.date_from || ""}
              className="w-full border border-paper-lines rounded px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold transition-colors" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-ink-muted mb-1 block font-medium">Bitiş</label>
            <input type="date" name="date_to" defaultValue={params.date_to || ""}
              className="w-full border border-paper-lines rounded px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold transition-colors" />
          </div>
        </div>
        <button type="submit"
          className="px-5 py-2 bg-receipt-brown text-white rounded text-sm font-medium hover:bg-receipt-brown-dark transition-colors shadow-sm w-full sm:w-auto">
          Filtrele
        </button>
      </form>

      <ReportSummary documents={documents} />

      {/* Advanced charts */}
      <ReportTabs
        trends={trends}
        supplierRanking={supplierRanking}
        categoryBreakdown={categoryBreakdown}
        cashflowProjection={cashflowProjection}
        yearlySummary={yearlySummary}
      />
    </div>
  );
}
