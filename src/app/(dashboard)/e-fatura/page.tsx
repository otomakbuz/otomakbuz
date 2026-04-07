import { FileCheck } from "lucide-react";
import Link from "next/link";
import { getDocuments } from "@/lib/actions/documents";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function EFaturaPage() {
  const allDocs = await getDocuments();
  // Sadece doğrulanmış veya e-fatura durumu olan belgeler
  const docs = allDocs.filter(
    (d) => d.status === "verified" || d.e_invoice_status
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <FileCheck className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">E-Fatura</h1>
          <p className="text-ink-muted text-sm">Doğrulanmış belgelerden UBL-TR e-fatura XML&apos;i oluşturun.</p>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="receipt-card rounded p-12 text-center">
          <FileCheck className="h-12 w-12 text-ink-faint mx-auto mb-3" />
          <h3 className="text-base font-semibold text-ink mb-1">Henüz e-fatura oluşturulabilecek belge yok</h3>
          <p className="text-sm text-ink-muted">
            Belgeleri doğruladığınızda burada e-fatura olarak dışa aktarabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="receipt-card rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-lines bg-surface/50">
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Tarih</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-ink-muted">Belge No</th>
                <th className="text-right px-4 py-3 font-medium text-ink-muted">Tutar</th>
                <th className="text-center px-4 py-3 font-medium text-ink-muted">E-Fatura Durumu</th>
                <th className="text-right px-4 py-3 font-medium text-ink-muted"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-paper-lines last:border-0 hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 text-ink">{doc.issue_date ? formatDate(doc.issue_date) : "-"}</td>
                  <td className="px-4 py-3 text-ink font-medium">{doc.supplier_name || "Bilinmiyor"}</td>
                  <td className="px-4 py-3 text-ink-muted font-mono text-xs">{doc.document_number || "-"}</td>
                  <td className="px-4 py-3 text-right text-ink">{doc.total_amount != null ? formatCurrency(doc.total_amount, doc.currency) : "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <EInvoiceStatusBadge status={doc.e_invoice_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/belge/${doc.id}`}
                      className="text-xs text-receipt-brown hover:underline font-medium"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded bg-amber-50 border border-amber-200/60">
        <span className="text-amber-600 text-xs">i</span>
        <p className="text-xs text-amber-800">
          E-fatura XML&apos;i oluşturmak için önce{" "}
          <Link href="/ayarlar?tab=efatura" className="text-receipt-brown font-medium underline">
            Ayarlar &gt; E-Fatura
          </Link>{" "}
          sekmesinden firma bilgilerinizi girin.
        </p>
      </div>
    </div>
  );
}

function EInvoiceStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-ink-faint">-</span>;
  }
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Taslak", className: "bg-gray-100 text-gray-700" },
    sent: { label: "Gönderildi", className: "bg-blue-100 text-blue-700" },
    delivered: { label: "İletildi", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Reddedildi", className: "bg-red-100 text-red-700" },
  };
  const info = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.className}`}>
      {info.label}
    </span>
  );
}
