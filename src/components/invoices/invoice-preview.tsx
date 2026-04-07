"use client";

import type { InvoiceLineItem } from "@/types";

interface InvoicePreviewProps {
  companyName: string;
  companyTaxId?: string | null;
  companyTaxOffice?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  documentNumber: string;
  issueDate: string;
  dueDate?: string;
  buyerName: string;
  buyerTaxId?: string;
  buyerTaxOffice?: string;
  buyerAddress?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  vatAmount: number;
  withholdingAmount?: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms?: string;
}

function formatNum(val: number): string {
  return val.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InvoicePreview({
  companyName,
  companyTaxId,
  companyTaxOffice,
  companyAddress,
  companyPhone,
  companyEmail,
  documentNumber,
  issueDate,
  dueDate,
  buyerName,
  buyerTaxId,
  buyerTaxOffice,
  buyerAddress,
  buyerPhone,
  buyerEmail,
  lineItems,
  subtotal,
  vatAmount,
  withholdingAmount,
  total,
  currency,
  notes,
  paymentTerms,
}: InvoicePreviewProps) {
  // VAT breakdown
  const vatBreakdown = lineItems.reduce<
    Record<number, { base: number; vat: number }>
  >((acc, li) => {
    if (!acc[li.vat_rate]) acc[li.vat_rate] = { base: 0, vat: 0 };
    acc[li.vat_rate].base += li.line_total;
    acc[li.vat_rate].vat += li.vat_amount;
    return acc;
  }, {});

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto shadow-sm border border-paper-lines print:shadow-none print:border-none text-[#2C1810]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">{companyName || "Firma Adi"}</h1>
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            {companyTaxId && (
              <div>
                VKN: {companyTaxId}
                {companyTaxOffice && ` - V.D.: ${companyTaxOffice}`}
              </div>
            )}
            {companyAddress && <div>{companyAddress}</div>}
            <div className="flex gap-3">
              {companyPhone && <span>Tel: {companyPhone}</span>}
              {companyEmail && <span>{companyEmail}</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#A0845C]">FATURA</div>
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            <div>
              <span className="font-medium">Fatura No:</span> {documentNumber}
            </div>
            <div>
              <span className="font-medium">Tarih:</span> {issueDate}
            </div>
            {dueDate && (
              <div>
                <span className="font-medium">Vade:</span> {dueDate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b-2 border-[#A0845C] mb-6" />

      {/* Buyer info */}
      <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 mb-1">
          ALICI BİLGİLERİ
        </div>
        <div className="text-sm">
          <div className="font-semibold">{buyerName || "-"}</div>
          {buyerTaxId && (
            <div className="text-xs text-gray-600">
              VKN: {buyerTaxId}
              {buyerTaxOffice && ` - V.D.: ${buyerTaxOffice}`}
            </div>
          )}
          {buyerAddress && (
            <div className="text-xs text-gray-600">{buyerAddress}</div>
          )}
          <div className="flex gap-3 text-xs text-gray-600">
            {buyerPhone && <span>Tel: {buyerPhone}</span>}
            {buyerEmail && <span>{buyerEmail}</span>}
          </div>
        </div>
      </div>

      {/* Line items table */}
      <table className="w-full text-xs mb-6">
        <thead>
          <tr className="bg-[#F5F0E6]">
            <th className="text-left px-2 py-2 font-medium">#</th>
            <th className="text-left px-2 py-2 font-medium">Açıklama</th>
            <th className="text-center px-2 py-2 font-medium">Miktar</th>
            <th className="text-center px-2 py-2 font-medium">Birim</th>
            <th className="text-right px-2 py-2 font-medium">Birim Fiyat</th>
            <th className="text-center px-2 py-2 font-medium">KDV %</th>
            <th className="text-right px-2 py-2 font-medium">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="px-2 py-1.5 text-gray-500">{i + 1}</td>
              <td className="px-2 py-1.5">{item.description || "-"}</td>
              <td className="px-2 py-1.5 text-center">{item.quantity}</td>
              <td className="px-2 py-1.5 text-center">{item.unit}</td>
              <td className="px-2 py-1.5 text-right">
                {formatNum(item.unit_price)}
              </td>
              <td className="px-2 py-1.5 text-center">%{item.vat_rate}</td>
              <td className="px-2 py-1.5 text-right font-medium">
                {formatNum(item.line_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Ara Toplam:</span>
            <span>
              {formatNum(subtotal)} {currency}
            </span>
          </div>
          {Object.entries(vatBreakdown).map(([rate, { vat }]) => (
            <div key={rate} className="flex justify-between">
              <span className="text-gray-600">KDV %{rate}:</span>
              <span>
                {formatNum(vat)} {currency}
              </span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-gray-600">Toplam KDV:</span>
            <span>
              {formatNum(vatAmount)} {currency}
            </span>
          </div>
          {withholdingAmount != null && withholdingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Stopaj:</span>
              <span>
                -{formatNum(withholdingAmount)} {currency}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-300 font-bold text-sm">
            <span>GENEL TOPLAM:</span>
            <span>
              {formatNum(total)} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(notes || paymentTerms) && (
        <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-1">
          {paymentTerms && (
            <div>
              <span className="font-medium">Vade Koşulları:</span>{" "}
              {paymentTerms}
            </div>
          )}
          {notes && (
            <div>
              <span className="font-medium">Notlar:</span> {notes}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400">
        Otomakbuz ile oluşturulmuştur
      </div>
    </div>
  );
}
