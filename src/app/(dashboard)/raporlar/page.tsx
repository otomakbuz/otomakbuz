import { getDocuments } from "@/lib/actions/documents";
import { ReportSummary } from "@/components/reports/report-summary";
import { ExportButtons } from "@/components/reports/export-buttons";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const documents = await getDocuments({ date_from: params.date_from, date_to: params.date_to });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raporlar</h1>
          <p className="text-slate-600 text-sm mt-1">Belgelerinizin ozeti ve disa aktarma.</p>
        </div>
        <ExportButtons documents={documents} />
      </div>
      <form className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Baslangic</label>
          <input type="date" name="date_from" defaultValue={params.date_from || ""} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Bitis</label>
          <input type="date" name="date_to" defaultValue={params.date_to || ""} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">Filtrele</button>
      </form>
      <ReportSummary documents={documents} />
    </div>
  );
}
