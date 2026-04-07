import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { getCategories } from "@/lib/actions/categories";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DocumentFilters } from "@/components/documents/document-filters";
import { ExportButtons } from "@/components/reports/export-buttons";
import { FileText } from "lucide-react";
import type { DocumentFilters as Filters } from "@/types";

export default async function BelgelerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters: Filters = {
    search: params.search,
    status: params.status as Filters["status"],
    category_id: params.category_id,
    document_type: params.document_type as Filters["document_type"],
    direction: params.direction as Filters["direction"],
    date_from: params.date_from,
    date_to: params.date_to,
  };

  const [documents, categories] = await Promise.all([getDocuments(filters), getCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-50 flex-shrink-0">
            <FileText className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Belgeler</h1>
            <p className="text-ink-muted text-sm truncate sm:truncate-none">Tüm belgelerinizi görüntüleyin, filtreleyin ve yönetin.</p>
          </div>
        </div>
        <ExportButtons documents={documents} />
      </div>
      <Suspense fallback={null}><DocumentFilters categories={categories} /></Suspense>
      <div className="receipt-card rounded overflow-hidden">
        <DocumentsTable data={documents} />
      </div>
    </div>
  );
}
