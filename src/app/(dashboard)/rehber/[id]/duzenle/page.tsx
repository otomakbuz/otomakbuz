import { getContact } from "@/lib/actions/contacts";
import { ContactForm } from "@/components/contacts/contact-form";
import { Building2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FirmaDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContact(id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">{contact.company_name}</h1>
          <p className="text-sm text-ink-muted">Firma bilgilerini duzenleyin.</p>
        </div>
      </div>

      <ContactForm contact={contact} mode="edit" />
    </div>
  );
}
