import { getContact, getContactDocuments } from "@/lib/actions/contacts";
import { getContactPatterns } from "@/lib/actions/patterns";
import { ContactDetail } from "@/components/contacts/contact-detail";
import type { Document } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FirmaDetayPage({ params }: PageProps) {
  const { id } = await params;
  const [contact, documents, patterns] = await Promise.all([
    getContact(id),
    getContactDocuments(id) as Promise<Document[]>,
    getContactPatterns(id),
  ]);

  return <ContactDetail contact={contact} documents={documents} patterns={patterns} />;
}
