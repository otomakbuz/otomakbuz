import type { DocumentType } from "@/types";

/**
 * Türk vergi mevzuatına göre belge türü tanımları ve alan zorunluluk matrisi.
 *
 * Kaynak: Vergi Usul Kanunu (VUK) Madde 229-237
 * Her belge türü için hangi alanların yasal olarak zorunlu, opsiyonel veya
 * geçersiz olduğu burada tanımlanır.
 */

export type FieldRequirement = "required" | "optional" | "hidden";

export interface DocumentTypeConfig {
  /** Veritabanı değeri */
  value: NonNullable<DocumentType>;
  /** Kısa etiket (UI) */
  label: string;
  /** Uzun açıklama (tooltip, seçim ekranı) */
  description: string;
  /** Kanun maddesi referansı */
  legalRef: string;
  /** MVP'de destekleniyor mu */
  isMvp: boolean;
  /** Hangi akışta kullanılır — gelir mi gider mi (iki yönlü = null) */
  typicalDirection: "income" | "expense" | null;
  /** Alan zorunlulukları */
  fields: {
    // Düzenleyen
    supplier_name: FieldRequirement;
    supplier_tax_id: FieldRequirement;
    supplier_tax_office: FieldRequirement;
    supplier_address: FieldRequirement;
    // Alıcı
    buyer_name: FieldRequirement;
    buyer_tax_id: FieldRequirement;
    buyer_tax_office: FieldRequirement;
    buyer_address: FieldRequirement;
    // Meta
    document_number: FieldRequirement;
    issue_date: FieldRequirement;
    issue_time: FieldRequirement;
    waybill_number: FieldRequirement;
    // Tutarlar
    subtotal_amount: FieldRequirement;
    vat_amount: FieldRequirement;
    vat_rate: FieldRequirement;
    withholding_amount: FieldRequirement;
    total_amount: FieldRequirement;
    // Kalemler
    line_items: FieldRequirement;
  };
}

export const DOCUMENT_TYPES: Record<NonNullable<DocumentType>, DocumentTypeConfig> = {
  fatura: {
    value: "fatura",
    label: "Fatura",
    description: "Fatura / e-Fatura / e-Arşiv Fatura",
    legalRef: "VUK 229-232",
    isMvp: true,
    typicalDirection: null,
    fields: {
      supplier_name: "required",
      supplier_tax_id: "required",
      supplier_tax_office: "required",
      supplier_address: "required",
      buyer_name: "required",
      buyer_tax_id: "optional", // "varsa" — yalnızca alıcı vergi mükellefiyse
      buyer_tax_office: "optional",
      buyer_address: "required",
      document_number: "required",
      issue_date: "required",
      issue_time: "optional",
      waybill_number: "optional",
      subtotal_amount: "required",
      vat_amount: "required",
      vat_rate: "required",
      withholding_amount: "hidden",
      total_amount: "required",
      line_items: "required",
    },
  },

  perakende_fis: {
    value: "perakende_fis",
    label: "Perakende Fişi",
    description: "Perakende satış fişi / ÖKC fişi / POS fişi",
    legalRef: "VUK 233",
    isMvp: true,
    typicalDirection: "expense",
    fields: {
      supplier_name: "required",
      supplier_tax_id: "required",
      supplier_tax_office: "required",
      supplier_address: "optional",
      buyer_name: "hidden", // perakende fişinde alıcı bilgisi olmaz
      buyer_tax_id: "hidden",
      buyer_tax_office: "hidden",
      buyer_address: "hidden",
      document_number: "required",
      issue_date: "required",
      issue_time: "required",
      waybill_number: "hidden",
      subtotal_amount: "optional",
      vat_amount: "required",
      vat_rate: "required",
      withholding_amount: "hidden",
      total_amount: "required",
      line_items: "optional",
    },
  },

  serbest_meslek_makbuzu: {
    value: "serbest_meslek_makbuzu",
    label: "Serbest Meslek Makbuzu",
    description: "Serbest Meslek Makbuzu / e-SMM",
    legalRef: "VUK 236-237",
    isMvp: true,
    typicalDirection: null,
    fields: {
      supplier_name: "required",
      supplier_tax_id: "required",
      supplier_tax_office: "required",
      supplier_address: "required",
      buyer_name: "required",
      buyer_tax_id: "optional",
      buyer_tax_office: "hidden",
      buyer_address: "required",
      document_number: "required",
      issue_date: "required",
      issue_time: "hidden",
      waybill_number: "hidden",
      subtotal_amount: "required", // brüt tutar
      vat_amount: "optional",
      vat_rate: "optional",
      withholding_amount: "required", // stopaj SMM'de çok sık
      total_amount: "required", // net ödenen
      line_items: "hidden",
    },
  },

  gider_pusulasi: {
    value: "gider_pusulasi",
    label: "Gider Pusulası",
    description: "Gider Pusulası / e-Gider Pusulası",
    legalRef: "VUK 234",
    isMvp: true,
    typicalDirection: "expense",
    fields: {
      supplier_name: "required", // satan (vergi mükellefi olmayan)
      supplier_tax_id: "optional", // TCKN olabilir
      supplier_tax_office: "hidden",
      supplier_address: "required",
      buyer_name: "required", // alan — işi yaptıran
      buyer_tax_id: "required",
      buyer_tax_office: "required",
      buyer_address: "required",
      document_number: "required",
      issue_date: "required",
      issue_time: "hidden",
      waybill_number: "hidden",
      subtotal_amount: "required",
      vat_amount: "hidden",
      vat_rate: "hidden",
      withholding_amount: "required", // stopaj zorunlu
      total_amount: "required",
      line_items: "optional",
    },
  },

  mustahsil_makbuzu: {
    value: "mustahsil_makbuzu",
    label: "Müstahsil Makbuzu",
    description: "Müstahsil Makbuzu / e-Müstahsil Makbuzu",
    legalRef: "VUK 235",
    isMvp: false,
    typicalDirection: "expense",
    fields: {
      supplier_name: "required", // çiftçi
      supplier_tax_id: "optional", // TCKN
      supplier_tax_office: "hidden",
      supplier_address: "required",
      buyer_name: "required", // tüccar
      buyer_tax_id: "required",
      buyer_tax_office: "required",
      buyer_address: "required",
      document_number: "required",
      issue_date: "required",
      issue_time: "hidden",
      waybill_number: "hidden",
      subtotal_amount: "required",
      vat_amount: "hidden",
      vat_rate: "hidden",
      withholding_amount: "required", // Bağ-Kur + Gelir Vergisi stopajı
      total_amount: "required",
      line_items: "required", // ürün, miktar, bedel
    },
  },

  irsaliye: {
    value: "irsaliye",
    label: "Sevk İrsaliyesi",
    description: "Sevk İrsaliyesi / e-İrsaliye / İrsaliyeli Fatura",
    legalRef: "VUK 230",
    isMvp: false,
    typicalDirection: null,
    fields: {
      supplier_name: "required",
      supplier_tax_id: "required",
      supplier_tax_office: "required",
      supplier_address: "required",
      buyer_name: "required",
      buyer_tax_id: "optional",
      buyer_tax_office: "optional",
      buyer_address: "required", // sevk adresi
      document_number: "required",
      issue_date: "required",
      issue_time: "required", // düzenleme saati zorunlu
      waybill_number: "hidden",
      subtotal_amount: "hidden", // irsaliyede fiyat olmaz
      vat_amount: "hidden",
      vat_rate: "hidden",
      withholding_amount: "hidden",
      total_amount: "hidden",
      line_items: "required", // ürünler, miktarlar
    },
  },
};

/**
 * Belge türünün label'ını döndürür.
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  if (!type) return "Belirtilmemiş";
  return DOCUMENT_TYPES[type]?.label ?? type;
}

/**
 * Belge türünün konfigürasyonunu döndürür.
 */
export function getDocumentTypeConfig(type: DocumentType): DocumentTypeConfig | null {
  if (!type) return null;
  return DOCUMENT_TYPES[type] ?? null;
}

/**
 * Bir alanın verilen belge türü için zorunluluğunu döndürür.
 */
export function getFieldRequirement(
  type: DocumentType,
  field: keyof DocumentTypeConfig["fields"]
): FieldRequirement {
  if (!type) return "optional";
  return DOCUMENT_TYPES[type]?.fields[field] ?? "optional";
}

/**
 * Belge türünün zorunlu alanlarının eksik olup olmadığını kontrol eder.
 * Yalnızca `required` alanlar için null/boş kontrolü yapar.
 */
export function validateDocumentFields(
  type: DocumentType,
  data: Record<string, unknown>
): { valid: boolean; missingFields: string[] } {
  const config = getDocumentTypeConfig(type);
  if (!config) return { valid: true, missingFields: [] };

  const missing: string[] = [];
  for (const [field, requirement] of Object.entries(config.fields)) {
    if (requirement !== "required") continue;
    const value = data[field];
    if (value === null || value === undefined || value === "") {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missingFields: missing };
}

/**
 * MVP'de desteklenen belge türlerinin listesi.
 */
export const MVP_DOCUMENT_TYPES = Object.values(DOCUMENT_TYPES).filter((t) => t.isMvp);

/**
 * Tüm belge türlerinin listesi (MVP + Faz 2).
 */
export const ALL_DOCUMENT_TYPES = Object.values(DOCUMENT_TYPES);
