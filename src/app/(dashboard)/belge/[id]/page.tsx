import { notFound } from "next/navigation";
import { getDocument, getDocumentAuditLogs } from "@/lib/actions/documents";
import { getCategories } from "@/lib/actions/categories";
import { DocumentDetail } from "@/components/documents/document-detail";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [document, categories, auditLogs] = await Promise.all([
      getDocument(id), getCategories(), getDocumentAuditLogs(id),
    ]);
    return <DocumentDetail document={document} categories={categories} auditLogs={auditLogs} />;
  } catch { notFound(); }
}
