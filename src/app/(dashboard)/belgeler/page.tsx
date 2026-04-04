import { Suspense } from "react";
import { getDocuments } from "@/lib/actions/documents";
import { getCategories } from "@/lib/actions/categories";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DocumentFilters } from "@/components/documents/document-filters";
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
    date_from: params.date_from,
    date_to: params.date_to,
  };

  const [documents, categories] = await Promise.all([getDocuments(filters), getCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Belgeler</h1>
        <p className="text-slate-600 text-sm mt-1">Tum belgelerinizi goruntuleyin, filtreleyin ve yonetin.</p>
      </div>
      <Suspense fallback={null}><DocumentFilters categories={categories} /></Suspense>
      <DocumentsTable data={documents} />
    </div>
  );
}
