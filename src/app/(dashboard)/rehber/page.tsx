import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ContactFilters } from "@/components/contacts/contact-filters";
import { SeedContactsButton } from "@/components/contacts/seed-contacts-button";
import { getContacts } from "@/lib/actions/contacts";
import { Building2, Plus } from "lucide-react";
import type { ContactType } from "@/types";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function RehberPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    search: params.search || undefined,
    type: (params.type as ContactType) || undefined,
    is_active: params.is_active ? params.is_active === "true" : undefined,
  };

  const contacts = await getContacts(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Rehber</h1>
            <p className="text-sm text-ink-muted">Tedarikçi ve müşterilerinizi yönetin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contacts.length === 0 && <SeedContactsButton />}
          <Link href="/rehber/yeni">
            <Button className="bg-brand hover:bg-brand-dark">
              <Plus className="h-4 w-4 mr-1.5" />
              Yeni Firma
            </Button>
          </Link>
        </div>
      </div>

      <ContactFilters />
      <ContactsTable contacts={contacts} />
    </div>
  );
}
