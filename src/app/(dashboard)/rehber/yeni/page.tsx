import { ContactForm } from "@/components/contacts/contact-form";
import { Building2 } from "lucide-react";

export default function YeniFirmaPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Yeni Firma Ekle</h1>
          <p className="text-sm text-ink-muted">Tedarikci veya musteri bilgilerini girin.</p>
        </div>
      </div>

      <ContactForm mode="create" />
    </div>
  );
}
