"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  FileCode,
  Copy,
  CheckCircle2,
  MoreHorizontal,
  Search,
  FilePlus,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  duplicateInvoice,
  markInvoiceSent,
  markInvoicePaid,
} from "@/lib/actions/outgoing-invoices";
import { generateEFaturaXml } from "@/lib/actions/e-fatura";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Document, InvoiceStats } from "@/types";

interface InvoiceListProps {
  invoices: Document[];
  stats: InvoiceStats;
}

function getInvoiceStatus(doc: Document): {
  label: string;
  className: string;
  key: string;
} {
  if (doc.notes === "Ödendi" || (doc.e_invoice_status as string) === "delivered") {
    return {
      label: "Ödendi",
      className: "bg-emerald-100 text-emerald-700",
      key: "paid",
    };
  }
  if (doc.e_invoice_status === "sent") {
    return {
      label: "Gönderildi",
      className: "bg-blue-100 text-blue-700",
      key: "sent",
    };
  }
  if (doc.status === "needs_review" || doc.e_invoice_status === "draft") {
    return {
      label: "Taslak",
      className: "bg-gray-100 text-gray-700",
      key: "draft",
    };
  }
  // Check overdue (simple: issue_date older than 30 days and not paid)
  if (doc.issue_date) {
    const issueDate = new Date(doc.issue_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (
      issueDate < thirtyDaysAgo &&
      doc.e_invoice_status !== "delivered" &&
      doc.notes !== "Ödendi"
    ) {
      return {
        label: "Vadesi Geçmiş",
        className: "bg-red-100 text-red-700",
        key: "overdue",
      };
    }
  }
  return {
    label: "Kesildi",
    className: "bg-amber-100 text-amber-700",
    key: "issued",
  };
}

export function InvoiceList({ invoices: initialInvoices, stats }: InvoiceListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = initialInvoices.filter((inv) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        (inv.buyer_name || "").toLowerCase().includes(q) ||
        (inv.document_number || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "all") {
      const s = getInvoiceStatus(inv);
      if (s.key !== statusFilter) return false;
    }
    return true;
  });

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateInvoice(id);
      toast.success("Fatura kopyalandı");
      router.refresh();
    } catch (err) {
      toast.error("Kopyalama başarısız");
    }
    setOpenMenuId(null);
  };

  const handleMarkSent = async (id: string) => {
    try {
      await markInvoiceSent(id);
      toast.success("Fatura gönderildi olarak işaretlendi");
      router.refresh();
    } catch (err) {
      toast.error("İşlem başarısız");
    }
    setOpenMenuId(null);
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markInvoicePaid(
        id,
        new Date().toISOString().split("T")[0],
        "havale"
      );
      toast.success("Fatura ödendi olarak işaretlendi");
      router.refresh();
    } catch (err) {
      toast.error("İşlem başarısız");
    }
    setOpenMenuId(null);
  };

  const handleDownloadPdf = async (doc: Document) => {
    try {
      const { getCompanyInfo } = await import("@/lib/actions/e-fatura");
      const company = await getCompanyInfo();
      const { generateInvoicePdf } = await import(
        "@/lib/invoices/pdf-generator"
      );
      const blob = await generateInvoicePdf(doc, company);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fatura_${doc.document_number || doc.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF indirildi");
    } catch (err) {
      toast.error("PDF oluşturulamadı");
    }
    setOpenMenuId(null);
  };

  const handleDownloadXml = async (id: string) => {
    try {
      const { xml, filename } = await generateEFaturaXml(id);
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("XML indirildi");
    } catch (err) {
      toast.error(
        `XML oluşturulamadı: ${err instanceof Error ? err.message : ""}`
      );
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="receipt-card rounded p-4">
          <div className="text-xs text-ink-muted mb-1">Toplam Kesilen</div>
          <div className="text-xl font-bold text-ink">{stats.total_count}</div>
        </div>
        <div className="receipt-card rounded p-4">
          <div className="text-xs text-ink-muted mb-1">Toplam Tutar</div>
          <div className="text-xl font-bold text-ink">
            {formatCurrency(stats.total_amount)}
          </div>
        </div>
        <div className="receipt-card rounded p-4">
          <div className="text-xs text-ink-muted mb-1">Ödenmemiş</div>
          <div className="text-xl font-bold text-amber-600">
            {stats.unpaid_count}
          </div>
          <div className="text-xs text-ink-faint">
            {formatCurrency(stats.unpaid_amount)}
          </div>
        </div>
        <div className="receipt-card rounded p-4">
          <div className="text-xs text-ink-muted mb-1">Vadesi Geçmiş</div>
          <div className="text-xl font-bold text-red-600">
            {stats.overdue_count}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fatura ara..."
            className="pl-8 h-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-input bg-transparent px-2.5"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="issued">Kesildi</option>
          <option value="sent">Gönderildi</option>
          <option value="paid">Ödendi</option>
          <option value="overdue">Vadesi Geçmiş</option>
        </select>
        <Link href="/fatura-kes">
          <Button size="sm" className="gap-2 bg-receipt-brown hover:bg-receipt-brown-dark text-white h-9">
            <FilePlus className="h-4 w-4" />
            Yeni Fatura
          </Button>
        </Link>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="receipt-card rounded p-12 text-center">
          <FilePlus className="h-12 w-12 text-ink-faint mx-auto mb-3" />
          <h3 className="text-base font-semibold text-ink mb-1">
            Henüz fatura kesilmemiş
          </h3>
          <p className="text-sm text-ink-muted mb-4">
            İlk faturanızı oluşturmak için yukarıdaki &quot;Yeni Fatura&quot;
            butonunu kullanın.
          </p>
          <Link href="/fatura-kes">
            <Button
              size="sm"
              className="gap-2 bg-receipt-brown hover:bg-receipt-brown-dark text-white"
            >
              <FilePlus className="h-4 w-4" />
              Fatura Kes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="receipt-card rounded overflow-hidden">
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-lines bg-surface/50">
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">
                    Fatura No
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">
                    Tarih
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-ink-muted">
                    Alıcı
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">
                    Tutar
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-ink-muted">
                    Durum
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-ink-muted">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const status = getInvoiceStatus(inv);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-paper-lines last:border-0 hover:bg-surface/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-mono text-xs">
                        {inv.document_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {inv.issue_date ? formatDate(inv.issue_date) : "-"}
                      </td>
                      <td className="px-4 py-3 text-ink font-medium">
                        {inv.buyer_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-ink font-medium">
                        {inv.total_amount != null
                          ? formatCurrency(inv.total_amount, inv.currency)
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === inv.id ? null : inv.id
                              )
                            }
                            className="p-1 hover:bg-surface rounded transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4 text-ink-muted" />
                          </button>
                          {openMenuId === inv.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-popover rounded-lg shadow-lg border border-paper-lines z-50 py-1">
                              <button
                                type="button"
                                onClick={() => handleDownloadPdf(inv)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50 text-left"
                              >
                                <Download className="h-3.5 w-3.5" />
                                PDF İndir
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadXml(inv.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50 text-left"
                              >
                                <FileCode className="h-3.5 w-3.5" />
                                XML İndir
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(inv.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50 text-left"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Kopyala
                              </button>
                              <Link
                                href={`/belge/${inv.id}`}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Düzenle
                              </Link>
                              <div className="border-t border-paper-lines my-1" />
                              {status.key !== "sent" &&
                                status.key !== "paid" && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSent(inv.id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50 text-left text-blue-600"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Gönderildi İşaretle
                                  </button>
                                )}
                              {status.key !== "paid" && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkPaid(inv.id)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface/50 text-left text-emerald-600"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Ödendi İşaretle
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-paper-lines">
            {filtered.map((inv) => {
              const status = getInvoiceStatus(inv);
              return (
                <Link
                  key={inv.id}
                  href={`/belge/${inv.id}`}
                  className="block p-3 hover:bg-surface/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink truncate">
                      {inv.buyer_name || "Alıcı"}
                    </span>
                    <span className="text-sm font-semibold text-ink whitespace-nowrap ml-2">
                      {inv.total_amount != null
                        ? formatCurrency(inv.total_amount, inv.currency)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-ink-muted font-mono">
                      {inv.document_number}
                    </span>
                    {inv.issue_date && (
                      <span className="text-ink-muted">
                        {formatDate(inv.issue_date)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
