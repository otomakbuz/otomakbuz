import { FileOutput } from "lucide-react";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { getInvoicePageData } from "@/lib/actions/outgoing-invoices";

export default async function FaturalarimPage() {
  const { invoices, stats } = await getInvoicePageData();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <FileOutput className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Faturalarım
          </h1>
          <p className="text-ink-muted text-sm">
            Kestiğiniz faturaları görüntüleyin ve yönetin.
          </p>
        </div>
      </div>

      <InvoiceList invoices={invoices} stats={stats} />
    </div>
  );
}
