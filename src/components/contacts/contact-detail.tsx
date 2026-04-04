"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/documents/status-badge";
import { deleteContact } from "@/lib/actions/contacts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Contact, Document, RecurringPattern } from "@/types";
import {
  Building2, Phone, Mail, MapPin, FileText, Edit, Trash2,
  Receipt, User, Hash, Landmark, StickyNote, Repeat, Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ContactDetailProps {
  contact: Contact;
  documents: Document[];
  patterns?: RecurringPattern[];
}

const frequencyLabels: Record<string, string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  yearly: "Yıllık",
};

const frequencyColors: Record<string, string> = {
  weekly: "bg-violet-50 text-violet-700 border-violet-200/60",
  monthly: "bg-blue-50 text-blue-700 border-blue-200/60",
  quarterly: "bg-amber-50 text-amber-700 border-amber-200/60",
  yearly: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
};

const typeLabels: Record<string, string> = {
  supplier: "Tedarikçi",
  customer: "Müşteri",
  both: "Tedarikçi / Müşteri",
};

export function ContactDetail({ contact, documents, patterns = [] }: ContactDetailProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu firmayı silmek istediğinize emin misiniz?")) return;
    setDeleting(true);
    try {
      await deleteContact(contact.id);
      toast.success("Firma silindi");
      router.push("/rehber");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silinemedi");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="receipt-card rounded p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-receipt-gold/12 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-receipt-brown" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{contact.company_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{typeLabels[contact.type]}</Badge>
                <Badge variant={contact.is_active ? "default" : "secondary"} className="text-xs">
                  {contact.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/rehber/${contact.id}/duzenle`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1.5" /> Düzenle
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-500 hover:text-red-600 hover:border-red-200">
              <Trash2 className="h-4 w-4 mr-1.5" /> Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="receipt-card rounded p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-ink-muted font-medium">Toplam Belge</p>
            <FileText className="h-4 w-4 text-receipt-brown/40" />
          </div>
          <p className="text-2xl font-bold text-ink">{contact.stats?.document_count || 0}</p>
        </div>
        <div className="receipt-card rounded p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-ink-muted font-medium">Toplam Tutar</p>
            <Receipt className="h-4 w-4 text-receipt-brown/40" />
          </div>
          <p className="text-2xl font-bold text-ink">{formatCurrency(contact.stats?.total_amount || 0)}</p>
        </div>
        <div className="receipt-card rounded p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-ink-muted font-medium">Son Belge</p>
            <FileText className="h-4 w-4 text-receipt-brown/40" />
          </div>
          <p className="text-2xl font-bold text-ink">
            {contact.stats?.last_document_date ? formatDate(contact.stats.last_document_date) : "-"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="receipt-card rounded p-6">
          <h3 className="font-semibold text-ink mb-4">Firma Bilgileri</h3>
          <div className="space-y-3">
            {contact.tax_id && (
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-ink-faint" />
                <span className="text-ink-muted">VKN:</span>
                <span className="text-ink font-medium">{contact.tax_id}</span>
              </div>
            )}
            {contact.tax_office && (
              <div className="flex items-center gap-3 text-sm">
                <Landmark className="h-4 w-4 text-ink-faint" />
                <span className="text-ink-muted">Vergi Dairesi:</span>
                <span className="text-ink font-medium">{contact.tax_office}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-ink-faint" />
                <span className="text-ink font-medium">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-ink-faint" />
                <span className="text-ink font-medium">{contact.email}</span>
              </div>
            )}
            {contact.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-ink-faint" />
                <span className="text-ink font-medium">{contact.city}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-ink-faint mt-0.5" />
                <span className="text-ink">{contact.address}</span>
              </div>
            )}
            {contact.notes && (
              <div className="flex items-start gap-3 text-sm pt-2 border-t border-paper-lines">
                <StickyNote className="h-4 w-4 text-ink-faint mt-0.5" />
                <span className="text-ink-muted">{contact.notes}</span>
              </div>
            )}
            {!contact.tax_id && !contact.phone && !contact.email && !contact.city && (
              <p className="text-sm text-ink-faint">Henüz bilgi eklenmemiş.</p>
            )}
          </div>
        </div>

        {/* Contact Persons */}
        <div className="receipt-card rounded p-6">
          <h3 className="font-semibold text-ink mb-4">İlgili Kişiler</h3>
          {contact.persons && contact.persons.length > 0 ? (
            <div className="space-y-3">
              {contact.persons.map((person) => (
                <div key={person.id} className="flex items-center gap-3 p-3 rounded bg-receipt-gold/5">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-receipt-brown" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{person.full_name}</p>
                    <p className="text-xs text-ink-faint">
                      {[person.title, person.phone, person.email].filter(Boolean).join(" · ") || "Bilgi yok"}
                    </p>
                  </div>
                  {person.is_primary && <Badge variant="outline" className="text-xs ml-auto">Birincil</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">Henüz ilgili kişi eklenmemiş.</p>
          )}
        </div>
      </div>

      {/* Recurring Patterns */}
      {patterns.length > 0 && (
        <div className="receipt-card rounded">
          <div className="px-5 py-4 border-b border-paper-lines flex items-center gap-2">
            <Repeat className="h-4 w-4 text-receipt-brown" />
            <h3 className="font-semibold text-ink text-sm">Tekrarlayan Harcamalar</h3>
          </div>
          <div className="divide-y divide-paper-lines/50">
            {patterns.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{p.pattern_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                      frequencyColors[p.frequency] || frequencyColors.monthly
                    )}>
                      {frequencyLabels[p.frequency] || p.frequency}
                    </span>
                    {p.next_expected && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                        <Calendar className="h-3 w-3" />
                        Sonraki: {formatDate(p.next_expected)}
                      </span>
                    )}
                    <span className="text-[10px] text-ink-faint">{p.occurrence_count}x tekrar</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-ink tabular-nums">
                  ~{formatCurrency(p.avg_amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="receipt-card rounded">
        <div className="px-6 py-4 border-b border-paper-lines">
          <h3 className="font-semibold text-ink">Bağlı Belgeler ({documents.length})</h3>
        </div>
        {documents.length > 0 ? (
          <div className="divide-y divide-paper-lines/50">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/belge/${doc.id}`}
                className="flex items-center justify-between p-4 hover:bg-receipt-gold/3 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{doc.supplier_name || contact.company_name}</p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {doc.issue_date ? formatDate(doc.issue_date) : "-"} · {doc.document_type || "Belge"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {doc.total_amount !== null ? formatCurrency(doc.total_amount, doc.currency) : "-"}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-ink-faint">Bu firmaya bağlı belge yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
