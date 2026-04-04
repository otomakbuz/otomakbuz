"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { Contact, ContactFilters, ContactPerson } from "@/types";

export async function getContacts(filters?: ContactFilters) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  let query = supabase
    .from("contacts")
    .select("*, persons:contact_persons(*)")
    .eq("workspace_id", workspace.id)
    .order("company_name", { ascending: true });

  if (filters?.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
  if (filters?.city) query = query.eq("city", filters.city);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as Contact[];
}

export async function getContact(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, persons:contact_persons(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  // Get stats via RPC
  const { data: stats } = await supabase.rpc("get_contact_stats", { p_contact_id: id });

  return { ...data, stats: stats || { document_count: 0, total_amount: 0, last_document_date: null } } as Contact;
}

export async function getContactDocuments(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, category:categories(*)")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Workspace bulunamadi");

  const contactData = {
    workspace_id: workspace.id,
    company_name: formData.get("company_name") as string,
    type: (formData.get("type") as string) || "supplier",
    tax_id: (formData.get("tax_id") as string) || null,
    tax_office: (formData.get("tax_office") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert(contactData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Contact;
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  const fields = ["company_name", "type", "tax_id", "tax_office", "phone", "email", "address", "city", "notes"];
  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) {
      updates[field] = (value as string) || null;
    }
  }
  const isActive = formData.get("is_active");
  if (isActive !== null) updates.is_active = isActive === "true";

  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Contact;
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function searchContacts(query: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  const { data, error } = await supabase
    .from("contacts")
    .select("id, company_name, tax_id, type")
    .eq("workspace_id", workspace.id)
    .eq("is_active", true)
    .ilike("company_name", `%${query}%`)
    .order("company_name")
    .limit(10);

  if (error) throw new Error(error.message);
  return data || [];
}

// OCR sonrası firma adıyla eşleştirme
export async function matchContactByName(supplierName: string) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace || !supplierName) return null;

  // Exact match first
  const { data: exact } = await supabase
    .from("contacts")
    .select("id, company_name")
    .eq("workspace_id", workspace.id)
    .ilike("company_name", supplierName)
    .limit(1);

  if (exact && exact.length > 0) return exact[0];

  // Fuzzy: ilk 3+ karakter içeren eşleşme
  const shortName = supplierName.split(/\s+/)[0]; // İlk kelime
  if (shortName.length < 3) return null;

  const { data: fuzzy } = await supabase
    .from("contacts")
    .select("id, company_name")
    .eq("workspace_id", workspace.id)
    .ilike("company_name", `%${shortName}%`)
    .limit(3);

  if (fuzzy && fuzzy.length === 1) return fuzzy[0]; // Tek eşleşme → güvenli
  return null;
}

// Contact person CRUD
export async function addContactPerson(contactId: string, person: Omit<ContactPerson, "id" | "contact_id" | "created_at">) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_persons")
    .insert({ contact_id: contactId, ...person })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ContactPerson;
}

export async function deleteContactPerson(personId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_persons").delete().eq("id", personId);
  if (error) throw new Error(error.message);
}
