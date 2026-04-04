import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/documents/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Document } from "@/types";

export function RecentDocuments({ documents }: { documents: Document[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Son Belgeler</CardTitle>
          <Link href="/belgeler" className="text-sm text-blue-600 hover:underline">Tumunu Gor</Link>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Henuz belge yok.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/belge/${doc.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{doc.supplier_name || "Bilinmiyor"}</p>
                  <p className="text-xs text-slate-500">{doc.issue_date ? formatDate(doc.issue_date) : "-"}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-medium text-slate-900">
                    {doc.total_amount !== null ? formatCurrency(doc.total_amount, doc.currency) : "-"}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
