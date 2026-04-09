"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace, getUser } from "./auth";
import { revalidatePath } from "next/cache";
import { getTcmbRates, convertToTry } from "@/lib/tcmb";
import type {
  Document,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceStats,
  DocumentDirection,
} from "@/types";

// Bir sonraki fatura numarasını al
export async function getNextInvoiceNumber(
  prefix: string = "OTM"
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_next_invoice_number", {
    p_prefix: prefix,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

// Yeni giden fatura oluştur
export async function createOutgoingInvoice(formData: FormData): Promise<Document> {
  const supabase = await createClient();
  const user = await getUser();
  const workspace = await getUserWorkspace();
  if (!user || !workspace) throw new Error("Oturum açılmamış");

  // Line items parse
  const lineItemsRaw = formData.get("line_items") as string;
  const lineItems: InvoiceLineItem[] = lineItemsRaw
    ? JSON.parse(lineItemsRaw)
    : [];

  // Tutarları hesapla
  const subtotal = lineItems.reduce((sum, li) => sum + li.line_total, 0);
  const vatAmount = lineItems.reduce((sum, li) => sum + li.vat_amount, 0);
  const withholding = parseFloat(
    (formData.get("withholding_amount") as string) || "0"
  );
  const total = subtotal + vatAmount - withholding;

  // Fatura numarası al
  const prefix = (formData.get("invoice_prefix") as string) || "OTM";
  const documentNumber = await getNextInvoiceNumber(prefix);

  const contactId = (formData.get("contact_id") as string) || null;

  // Document line_items formatına dönüştür (DB'deki DocumentLineItem yapısı)
  const dbLineItems = lineItems.map((li) => ({
    name: li.description,
    quantity: li.quantity,
    unit_price: li.unit_price,
    vat_rate: li.vat_rate,
    total: li.line_total + li.vat_amount,
  }));

  const invoiceData = {
    workspace_id: workspace.id,
    user_id: user.id,
    original_file_url: "",
    file_type: "invoice",
    document_type: "fatura" as const,
    direction: "income" as DocumentDirection,
    status: (formData.get("status") as string) === "draft" ? "needs_review" as const : "verified" as const,
    document_number: documentNumber,
    issue_date: (formData.get("issue_date") as string) || new Date().toISOString().split("T")[0],
    // Alıcı bilgileri
    buyer_name: (formData.get("buyer_name") as string) || null,
    buyer_tax_id: (formData.get("buyer_tax_id") as string) || null,
    buyer_tax_office: (formData.get("buyer_tax_office") as string) || null,
    buyer_address: (formData.get("buyer_address") as string) || null,
    // Düzenleyen (kendi firmamız)
    supplier_name: workspace.name,
    supplier_tax_id: null as string | null,
    supplier_tax_office: null as string | null,
    supplier_address: null as string | null,
    // Tutarlar
    subtotal_amount: subtotal,
    vat_amount: vatAmount,
    vat_rate: lineItems.length > 0 ? lineItems[0].vat_rate : null,
    withholding_amount: withholding || null,
    total_amount: total,
    currency: (formData.get("currency") as string) || "TRY",
    payment_method: (formData.get("payment_method") as string) || null,
    line_items: dbLineItems,
    notes: (formData.get("notes") as string) || null,
    contact_id: contactId,
    confidence_score: 100,
    sub_index: 0,
    e_invoice_status: (formData.get("status") as string) === "draft" ? "draft" as const : null,
  };

  // Firma bilgilerini workspace'den al
  const { data: companyData } = await supabase
    .from("workspaces")
    .select("company_tax_id, company_tax_office, company_address")
    .eq("id", workspace.id)
    .single();

  if (companyData) {
    invoiceData.supplier_tax_id = companyData.company_tax_id;
    invoiceData.supplier_tax_office = companyData.company_tax_office;
    invoiceData.supplier_address = companyData.company_address;
  }

  const { data, error } = await supabase
    .from("documents")
    .insert(invoiceData)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  // Cari hareket oluştur
  if (contactId && total > 0) {
    const { createLedgerEntryFromDocument } = await import("./ledger");
    await createLedgerEntryFromDocument(
      data.id,
      contactId,
      total,
      "income",
      (formData.get("buyer_name") as string) || "Alıcı",
      invoiceData.issue_date || undefined
    );
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    document_id: data.id,
    user_id: user.id,
    action_type: "created",
    old_value: null,
    new_value: { source: "outgoing_invoice" },
  });

  // Tekrarlayan fatura ise hatırlatıcı oluştur
  const isRecurring = formData.get("is_recurring") === "true";
  if (isRecurring) {
    const interval = (formData.get("recurring_interval") as string) || "monthly";
    const issueDate = (formData.get("issue_date") as string) || new Date().toISOString().split("T")[0];
    const nextDate = new Date(issueDate);
    if (interval === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
    else if (interval === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
    else nextDate.setFullYear(nextDate.getFullYear() + 1);

    const freqMap: Record<string, string> = { monthly: "monthly", quarterly: "quarterly", yearly: "yearly" };
    await supabase.from("reminders").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      title: `Tekrarlayan fatura: ${(formData.get("buyer_name") as string) || "Alıcı"}`,
      description: `${documentNumber} numaralı faturanın tekrarı. Tutar: ${total.toFixed(2)} ${(formData.get("currency") as string) || "TRY"}`,
      type: "payment",
      due_date: nextDate.toISOString().split("T")[0],
      contact_id: contactId,
      document_id: data.id,
      is_recurring: true,
      recurrence_frequency: freqMap[interval] || "monthly",
    });
  }

  revalidatePath("/faturalarim");
  revalidatePath("/belgeler");
  revalidatePath("/panel");

  return data as Document;
}

// Giden fatura güncelle
export async function updateOutgoingInvoice(
  id: string,
  formData: FormData
): Promise<Document> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) throw new Error("Oturum açılmamış");

  const lineItemsRaw = formData.get("line_items") as string;
  const lineItems: InvoiceLineItem[] = lineItemsRaw
    ? JSON.parse(lineItemsRaw)
    : [];

  const subtotal = lineItems.reduce((sum, li) => sum + li.line_total, 0);
  const vatAmount = lineItems.reduce((sum, li) => sum + li.vat_amount, 0);
  const withholding = parseFloat(
    (formData.get("withholding_amount") as string) || "0"
  );
  const total = subtotal + vatAmount - withholding;

  const dbLineItems = lineItems.map((li) => ({
    name: li.description,
    quantity: li.quantity,
    unit_price: li.unit_price,
    vat_rate: li.vat_rate,
    total: li.line_total + li.vat_amount,
  }));

  const updates = {
    issue_date: (formData.get("issue_date") as string) || null,
    buyer_name: (formData.get("buyer_name") as string) || null,
    buyer_tax_id: (formData.get("buyer_tax_id") as string) || null,
    buyer_tax_office: (formData.get("buyer_tax_office") as string) || null,
    buyer_address: (formData.get("buyer_address") as string) || null,
    subtotal_amount: subtotal,
    vat_amount: vatAmount,
    vat_rate: lineItems.length > 0 ? lineItems[0].vat_rate : null,
    withholding_amount: withholding || null,
    total_amount: total,
    currency: (formData.get("currency") as string) || "TRY",
    payment_method: (formData.get("payment_method") as string) || null,
    line_items: dbLineItems,
    notes: (formData.get("notes") as string) || null,
    contact_id: (formData.get("contact_id") as string) || null,
  };

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    document_id: id,
    user_id: user.id,
    action_type: "updated",
    old_value: null,
    new_value: { source: "outgoing_invoice_update" },
  });

  revalidatePath("/faturalarim");
  revalidatePath(`/belge/${id}`);

  return data as Document;
}

// Giden faturaları listele
export async function getOutgoingInvoices(filters?: {
  status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
  contact_id?: string;
  search?: string;
}): Promise<Document[]> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  let query = supabase
    .from("documents")
    .select("*, category:categories(*), contact:contacts(*)")
    .eq("workspace_id", workspace.id)
    .eq("direction", "income")
    .eq("document_type", "fatura")
    .eq("file_type", "invoice")
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `buyer_name.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%`
    );
  }

  if (filters?.date_from) query = query.gte("issue_date", filters.date_from);
  if (filters?.date_to) query = query.lte("issue_date", filters.date_to);
  if (filters?.contact_id) query = query.eq("contact_id", filters.contact_id);

  // Status filtresi: draft=needs_review, paid/sent = e_invoice_status alanında
  if (filters?.status === "draft") {
    query = query.eq("status", "needs_review");
  } else if (filters?.status === "sent") {
    query = query.eq("e_invoice_status", "sent");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as Document[];
}

// Fatura kopyala
export async function duplicateInvoice(id: string): Promise<Document> {
  const supabase = await createClient();
  const user = await getUser();
  const workspace = await getUserWorkspace();
  if (!user || !workspace) throw new Error("Oturum açılmamış");

  const { data: original, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) throw new Error("Fatura bulunamadı");

  const prefix = "OTM";
  const documentNumber = await getNextInvoiceNumber(prefix);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      original_file_url: "",
      file_type: "invoice",
      document_type: "fatura",
      direction: "income",
      status: "needs_review",
      document_number: documentNumber,
      issue_date: new Date().toISOString().split("T")[0],
      buyer_name: original.buyer_name,
      buyer_tax_id: original.buyer_tax_id,
      buyer_tax_office: original.buyer_tax_office,
      buyer_address: original.buyer_address,
      supplier_name: original.supplier_name,
      supplier_tax_id: original.supplier_tax_id,
      supplier_tax_office: original.supplier_tax_office,
      supplier_address: original.supplier_address,
      subtotal_amount: original.subtotal_amount,
      vat_amount: original.vat_amount,
      vat_rate: original.vat_rate,
      withholding_amount: original.withholding_amount,
      total_amount: original.total_amount,
      currency: original.currency,
      payment_method: original.payment_method,
      line_items: original.line_items,
      notes: original.notes,
      contact_id: original.contact_id,
      confidence_score: 100,
      sub_index: 0,
      e_invoice_status: "draft",
    })
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/faturalarim");
  return data as Document;
}

// Fatura gönderildi olarak işaretle
export async function markInvoiceSent(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ e_invoice_status: "sent", status: "verified" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/faturalarim");
}

// Fatura ödendi olarak işaretle
export async function markInvoicePaid(
  id: string,
  _paymentDate: string,
  paymentMethod: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({
      e_invoice_status: "delivered",
      payment_method: paymentMethod,
      notes: `Ödendi`,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/faturalarim");
}

// Fatura istatistikleri
export async function getInvoiceStats(): Promise<InvoiceStats> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) {
    return {
      total_count: 0,
      total_amount: 0,
      unpaid_count: 0,
      unpaid_amount: 0,
      overdue_count: 0,
    };
  }

  const { data: invoices } = await supabase
    .from("documents")
    .select("total_amount, e_invoice_status, issue_date, notes")
    .eq("workspace_id", workspace.id)
    .eq("direction", "income")
    .eq("document_type", "fatura")
    .eq("file_type", "invoice");

  if (!invoices || invoices.length === 0) {
    return {
      total_count: 0,
      total_amount: 0,
      unpaid_count: 0,
      unpaid_amount: 0,
      overdue_count: 0,
    };
  }

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.total_amount || 0),
    0
  );
  const unpaid = invoices.filter(
    (inv) =>
      inv.e_invoice_status !== "delivered" &&
      inv.notes !== "Ödendi"
  );
  const today = new Date().toISOString().split("T")[0];
  const overdue = unpaid.filter(
    (inv) => inv.issue_date && inv.issue_date < today
  );

  return {
    total_count: invoices.length,
    total_amount: totalAmount,
    unpaid_count: unpaid.length,
    unpaid_amount: unpaid.reduce(
      (sum, inv) => sum + (inv.total_amount || 0),
      0
    ),
    overdue_count: overdue.length,
  };
}

/** Vadesi yaklaşan veya geçen faturaları getir */
export async function getOverdueInvoices(): Promise<{ overdue: Document[]; dueSoon: Document[] }> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return { overdue: [], dueSoon: [] };

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().split("T")[0];

  // Ödenmemiş giden faturalar
  const { data } = await supabase
    .from("documents")
    .select("id, document_number, buyer_name, total_amount, issue_date, currency, notes, e_invoice_status")
    .eq("workspace_id", workspace.id)
    .eq("direction", "income")
    .eq("document_type", "fatura")
    .eq("file_type", "invoice")
    .neq("e_invoice_status", "delivered")
    .not("notes", "eq", "Ödendi")
    .order("issue_date", { ascending: true });

  if (!data) return { overdue: [], dueSoon: [] };

  const overdue: Document[] = [];
  const dueSoon: Document[] = [];

  for (const inv of data) {
    // due_date yoksa issue_date + 30 gün
    const dueDate = (inv as unknown as Record<string, unknown>).due_date as string | undefined;
    const effectiveDue = dueDate || (() => {
      if (!inv.issue_date) return null;
      const d = new Date(inv.issue_date);
      d.setDate(d.getDate() + 30);
      return d.toISOString().split("T")[0];
    })();

    if (!effectiveDue) continue;

    if (effectiveDue < today) {
      overdue.push(inv as Document);
    } else if (effectiveDue <= sevenDaysStr) {
      dueSoon.push(inv as Document);
    }
  }

  return { overdue, dueSoon };
}

// Fatura verilerini ve firma bilgilerini tek seferde al (settings-page pattern)
export async function getInvoicePageData() {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Oturum açılmamış");

  const [invoicesResult, statsResult, companyResult, contactsResult] =
    await Promise.allSettled([
      getOutgoingInvoices(),
      getInvoiceStats(),
      supabase
        .from("workspaces")
        .select(
          "name, company_tax_id, company_tax_office, company_address, company_phone, company_email"
        )
        .eq("id", workspace.id)
        .single(),
      supabase
        .from("contacts")
        .select("id, company_name, tax_id, type")
        .eq("workspace_id", workspace.id)
        .eq("is_active", true)
        .order("company_name"),
    ]);

  return {
    invoices:
      invoicesResult.status === "fulfilled" ? invoicesResult.value : [],
    stats:
      statsResult.status === "fulfilled"
        ? statsResult.value
        : {
            total_count: 0,
            total_amount: 0,
            unpaid_count: 0,
            unpaid_amount: 0,
            overdue_count: 0,
          },
    company:
      companyResult.status === "fulfilled" && companyResult.value.data
        ? companyResult.value.data
        : { name: "", company_tax_id: null, company_tax_office: null, company_address: null, company_phone: null, company_email: null },
    contacts:
      contactsResult.status === "fulfilled" && contactsResult.value.data
        ? contactsResult.value.data
        : [],
  };
}

/** TCMB günlük döviz kurları */
export async function fetchExchangeRates() {
  const rates = await getTcmbRates();
  return rates.filter((r) => ["USD", "EUR", "GBP"].includes(r.code));
}

/** Döviz tutarını TL'ye çevir */
export async function convertCurrencyToTry(amount: number, currencyCode: string) {
  return convertToTry(amount, currencyCode);
}
