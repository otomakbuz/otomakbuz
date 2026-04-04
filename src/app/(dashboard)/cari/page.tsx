import { getAllBalances } from "@/lib/actions/ledger";
import { BalancesTable } from "@/components/ledger/balances-table";
import { Scale } from "lucide-react";

export default async function CariHesapPage() {
  const balances = await getAllBalances();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <Scale className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Cari Hesap</h1>
          <p className="text-ink-muted text-sm">Firma bazlı borç ve alacak bakiyeleri.</p>
        </div>
      </div>

      <BalancesTable balances={balances} />
    </div>
  );
}
