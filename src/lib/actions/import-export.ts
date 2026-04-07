"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { ImportResult, DocumentFilters } from "@/types";

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export async function exportDocumentsData(filters?: DocumentFilters) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  let query = supabase
    .from("documents")
    .select("*, category:categories(name)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `supplier_name.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%`
    );
  }
  if (filters?.category_id) query = query.eq("category_id", filters.category_id);
  if (filters?.document_type) query = query.eq("document_type", filters.document_type);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.direction) query = query.eq("direction", filters.direction);
  if (filters?.date_from) query = query.gte("issue_date", filters.date_from);
  if (filters?.date_to) query = query.lte("issue_date", filters.date_to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function exportContactsData() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("company_name");

  if (error) throw new Error(error.message);
  return data || [];
}

export async function exportProductsData() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("name");

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── IMPORT ────────────────────────────────────────────────────────────────────

export async function importDocuments(formData: FormData): Promise<ImportResult> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Dosya bulunamadı");

  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buffer);

  const { parseDocumentCsv } = await import("@/lib/import/document-importer");
  const { valid, errors } = parseDocumentCsv(text);

  const importErrors: string[] = errors.map(
    (e) => `Satır ${e.row}: ${e.field} - ${e.message}`
  );

  let imported = 0;
  let skipped = 0;

  // Look up categories by name for mapping
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("workspace_id", workspace.id);
  const categoryMap = new Map(
    (categories || []).map((c: { id: string; name: string }) => [c.name.toLowerCase(), c.id])
  );

  for (const row of valid) {
    try {
      const categoryId = row.category
        ? categoryMap.get(row.category.toLowerCase()) || null
        : null;

      const { error: insertError } = await supabase.from("documents").insert({
        workspace_id: workspace.id,
        user_id: (await supabase.auth.getUser()).data.user!.id,
        original_file_url: "",
        file_type: "import",
        document_type: row.document_type as string | null,
        supplier_name: row.supplier,
        document_number: row.document_number,
        issue_date: row.date,
        subtotal_amount: row.subtotal,
        vat_amount: row.vat,
        total_amount: row.total,
        direction: row.direction,
        notes: row.notes,
        category_id: categoryId,
        currency: "TRY",
        status: "verified",
        confidence_score: 100,
        sub_index: 0,
      });

      if (insertError) {
        importErrors.push(`Satır: ${row.supplier || row.document_number} - ${insertError.message}`);
        skipped++;
      } else {
        imported++;
      }
    } catch (err) {
      skipped++;
      importErrors.push(`Satır: ${row.supplier || "?"} - ${String(err)}`);
    }
  }

  return { imported, skipped, errors: importErrors };
}

export async function importContacts(formData: FormData): Promise<ImportResult> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Dosya bulunamadı");

  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buffer);

  const { parseContactCsv, findDuplicates } = await import("@/lib/import/contact-importer");
  const { valid, errors } = parseContactCsv(text);

  const importErrors: string[] = errors.map(
    (e) => `Satır ${e.row}: ${e.field} - ${e.message}`
  );

  // Get existing contacts for duplicate detection
  const { data: existing } = await supabase
    .from("contacts")
    .select("company_name, tax_id")
    .eq("workspace_id", workspace.id);

  const { unique, duplicates } = findDuplicates(valid, existing || []);
  const skipped = duplicates.length;

  if (duplicates.length > 0) {
    importErrors.push(
      `${duplicates.length} kayıt zaten mevcut (vergi no veya firma adı eşleşmesi)`
    );
  }

  let imported = 0;

  for (const row of unique) {
    try {
      const { error: insertError } = await supabase.from("contacts").insert({
        workspace_id: workspace.id,
        company_name: row.company_name,
        type: row.type,
        tax_id: row.tax_id,
        tax_office: row.tax_office,
        phone: row.phone,
        email: row.email,
        address: row.address,
        city: row.city,
      });

      if (insertError) {
        importErrors.push(`${row.company_name}: ${insertError.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      importErrors.push(`${row.company_name}: ${String(err)}`);
    }
  }

  return { imported, skipped, errors: importErrors };
}

export async function importProducts(formData: FormData): Promise<ImportResult> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Dosya bulunamadı");

  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buffer);

  const { parseProductCsv, findProductDuplicates } = await import("@/lib/import/product-importer");
  const { valid, errors } = parseProductCsv(text);

  const importErrors: string[] = errors.map(
    (e) => `Satır ${e.row}: ${e.field} - ${e.message}`
  );

  // Get existing products for duplicate detection
  const { data: existing } = await supabase
    .from("products")
    .select("code")
    .eq("workspace_id", workspace.id);

  const { unique, duplicates } = findProductDuplicates(valid, existing || []);
  const skipped = duplicates.length;

  if (duplicates.length > 0) {
    importErrors.push(
      `${duplicates.length} ürün zaten mevcut (kod eşleşmesi)`
    );
  }

  let imported = 0;

  for (const row of unique) {
    try {
      const { error: insertError } = await supabase.from("products").insert({
        workspace_id: workspace.id,
        code: row.code,
        name: row.name,
        unit: row.unit,
        current_quantity: row.current_quantity,
        unit_cost: row.unit_cost,
        unit_price: row.unit_price,
        category: row.category,
        reorder_level: row.reorder_level,
      });

      if (insertError) {
        importErrors.push(`${row.code}: ${insertError.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      importErrors.push(`${row.code}: ${String(err)}`);
    }
  }

  return { imported, skipped, errors: importErrors };
}

// ─── TEMPLATES ─────────────────────────────────────────────────────────────────

export async function getImportTemplate(
  type: "documents" | "contacts" | "products"
): Promise<string> {
  const { DOCUMENT_TEMPLATE_HEADERS } = await import("@/lib/import/document-importer");
  const { CONTACT_TEMPLATE_HEADERS } = await import("@/lib/import/contact-importer");
  const { PRODUCT_TEMPLATE_HEADERS } = await import("@/lib/import/product-importer");

  const headersMap = {
    documents: DOCUMENT_TEMPLATE_HEADERS,
    contacts: CONTACT_TEMPLATE_HEADERS,
    products: PRODUCT_TEMPLATE_HEADERS,
  };

  const sampleData: Record<string, string[][]> = {
    documents: [
      ["2024-01-15", "ABC Ltd.", "FTR-001", "1000", "180", "1180", "fatura", "Gider", "Ofis malzemeleri", "Genel"],
    ],
    contacts: [
      ["ABC Ticaret Ltd.", "1234567890", "Kadıköy", "0212 555 1234", "info@abc.com", "İstanbul Cad. No:1", "İstanbul", "Tedarikçi"],
    ],
    products: [
      ["URN-001", "A4 Kağıt", "Paket", "100", "25,50", "35,00", "Ofis", "10"],
    ],
  };

  const headers = headersMap[type];
  const samples = sampleData[type] || [];

  const csv = [
    headers.join(","),
    ...samples.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return "\uFEFF" + csv;
}
