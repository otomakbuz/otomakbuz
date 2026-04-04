import { getContact } from "@/lib/actions/contacts";
import { getContactBalance, getContactLedgerEntries } from "@/lib/actions/ledger";
import { LedgerSummary } from "@/components/ledger/ledger-summary";
import { LedgerTable } from "@/components/ledger/ledger-table";
import { ManualEntryForm } from "@/components/ledger/manual-entry-form";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CariDetayPage({ params }: PageProps) {
  const { id } = await params;

  const [contact, balance, entries] = await Promise.all([
    getContact(id),
    getContactBalance(id),
    getContactLedgerEntries(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/cari" className="w-9 h-9 rounded bg-surface flex items-center justify-center hover:bg-receipt-gold/10 transition-colors">
            <ArrowLeft className="h-4 w-4 text-ink-muted" />
          </Link>
          <div className="w-10 h-10 rounded bg-receipt-gold/12 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-receipt-brown" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">{contact.company_name}</h1>
            <p className="text-ink-muted text-sm">Cari hesap ekstresi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ManualEntryForm contactId={id} />
          <Link href={`/rehber/${id}`} className="text-xs text-receipt-brown hover:underline">
            Firma Detay &rarr;
          </Link>
        </div>
      </div>

      {/* Balance summary */}
      <LedgerSummary summary={balance} />

      {/* Entries */}
      <LedgerTable entries={entries} contactId={id} />
    </div>
  );
}
