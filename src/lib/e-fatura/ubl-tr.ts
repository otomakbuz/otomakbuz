import type { Document, CompanyInfo } from "@/types";

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function amount(val: number | null | undefined): string {
  return (val ?? 0).toFixed(2);
}

function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split("T")[0];
  // YYYY-MM-DD format
  if (date.includes(".")) {
    const parts = date.split(".");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return date;
}

export interface UblTrValidationError {
  field: string;
  message: string;
}

export function validateForEInvoice(
  doc: Document,
  company: CompanyInfo
): UblTrValidationError[] {
  const errors: UblTrValidationError[] = [];

  if (!company.company_tax_id) errors.push({ field: "company_tax_id", message: "Firma VKN/TCKN gerekli" });
  if (!doc.supplier_name && !doc.buyer_name) errors.push({ field: "supplier_name", message: "Düzenleyen veya alıcı bilgisi gerekli" });
  if (!doc.document_number) errors.push({ field: "document_number", message: "Belge numarası gerekli" });
  if (!doc.issue_date) errors.push({ field: "issue_date", message: "Düzenleme tarihi gerekli" });
  if (doc.total_amount == null) errors.push({ field: "total_amount", message: "Toplam tutar gerekli" });

  return errors;
}

export function generateUblTrXml(
  doc: Document,
  company: CompanyInfo,
  workspaceName: string
): string {
  const uuid = doc.e_invoice_uuid || crypto.randomUUID();
  const issueDate = formatDate(doc.issue_date);
  const issueTime = doc.issue_time || "00:00:00";
  const currency = doc.currency || "TRY";
  const docNumber = doc.document_number || `INV-${Date.now()}`;

  // Düzenleyen = workspace firması, Alıcı = belgedeki supplier (çünkü gelen fatura)
  // Giden faturada tersi olur ama şimdilik gelen fatura XML'i üretiyoruz
  const isOutgoing = doc.direction === "income";

  const supplierName = isOutgoing ? workspaceName : esc(doc.supplier_name);
  const supplierTaxId = isOutgoing ? esc(company.company_tax_id) : esc(doc.supplier_tax_id);
  const supplierTaxOffice = isOutgoing ? esc(company.company_tax_office) : esc(doc.supplier_tax_office);
  const supplierAddress = isOutgoing ? esc(company.company_address) : esc(doc.supplier_address);

  const buyerName = isOutgoing ? esc(doc.buyer_name || doc.supplier_name) : esc(workspaceName);
  const buyerTaxId = isOutgoing ? esc(doc.buyer_tax_id || doc.supplier_tax_id) : esc(company.company_tax_id);
  const buyerTaxOffice = isOutgoing ? esc(doc.buyer_tax_office || doc.supplier_tax_office) : esc(company.company_tax_office);
  const buyerAddress = isOutgoing ? esc(doc.buyer_address || doc.supplier_address) : esc(company.company_address);

  const lineItems = doc.line_items || [];

  const linesXml = lineItems.length > 0
    ? lineItems.map((item, i) => {
        const lineVatRate = item.vat_rate ?? doc.vat_rate ?? 18;
        const lineVatAmount = (item.total * lineVatRate) / (100 + lineVatRate);
        const lineNetAmount = item.total - lineVatAmount;
        return `
    <cac:InvoiceLine>
      <cbc:ID>${i + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${amount(lineNetAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${amount(lineVatAmount)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="${currency}">${amount(lineNetAmount)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="${currency}">${amount(lineVatAmount)}</cbc:TaxAmount>
          <cbc:Percent>${lineVatRate}</cbc:Percent>
          <cac:TaxCategory>
            <cac:TaxScheme>
              <cbc:Name>KDV</cbc:Name>
              <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${esc(item.name)}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${amount(item.unit_price)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
      }).join("")
    : `
    <cac:InvoiceLine>
      <cbc:ID>1</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${amount(doc.subtotal_amount ?? doc.total_amount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${amount(doc.vat_amount)}</cbc:TaxAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>Genel</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${amount(doc.subtotal_amount ?? doc.total_amount)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TICARIFATURA</cbc:ProfileID>
  <cbc:ID>${esc(docNumber)}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>

  <!-- Düzenleyen -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${supplierTaxId}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${supplierName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${supplierAddress}</cbc:StreetName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${supplierName}</cbc:RegistrationName>
        <cbc:CompanyID>${supplierTaxId}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:Name>${supplierTaxOffice}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${esc(company.company_phone)}</cbc:Telephone>
        <cbc:ElectronicMail>${esc(company.company_email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Alıcı -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${buyerTaxId}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${buyerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${buyerAddress}</cbc:StreetName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${buyerName}</cbc:RegistrationName>
        <cbc:CompanyID>${buyerTaxId}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:Name>${buyerTaxOffice}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- KDV Toplam -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${amount(doc.vat_amount)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${amount(doc.subtotal_amount)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${amount(doc.vat_amount)}</cbc:TaxAmount>
      <cbc:Percent>${doc.vat_rate ?? 18}</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Toplam Tutarlar -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${amount(doc.subtotal_amount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${amount(doc.subtotal_amount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${amount(doc.total_amount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${amount(doc.total_amount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Kalemler -->
${linesXml}
</Invoice>`;
}
