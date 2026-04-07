import { FilePlus } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getCompanyInfo } from "@/lib/actions/e-fatura";
import { getContacts } from "@/lib/actions/contacts";

export default async function FaturaKesPage() {
  const [company, contacts] = await Promise.all([
    getCompanyInfo(),
    getContacts({ is_active: true }),
  ]);

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    company_name: c.company_name,
    tax_id: c.tax_id,
    type: c.type,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12">
          <FilePlus className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Fatura Kes
          </h1>
          <p className="text-ink-muted text-sm">
            Yeni bir giden fatura oluşturun.
          </p>
        </div>
      </div>

      <InvoiceForm contacts={contactOptions} company={company} />
    </div>
  );
}
