import type { Document, CompanyInfo } from "@/types";

function formatAmount(val: number | null | undefined): string {
  return (val ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function generateInvoicePdf(
  doc: Document,
  company: CompanyInfo & { name: string }
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let pageNumber = 1;

  const addPageNumber = () => {
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150);
    pdf.text(`Sayfa ${pageNumber}`, pageWidth / 2, 290, { align: "center" });
    pdf.setTextColor(0);
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 270) {
      addPageNumber();
      pdf.addPage();
      pageNumber++;
      y = margin;
    }
  };

  // ─── Logo placeholder area ───
  pdf.setFillColor(245, 240, 230);
  pdf.roundedRect(margin, y, 25, 25, 2, 2, "F");
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(160, 132, 92);
  pdf.text("LOGO", margin + 12.5, y + 14, { align: "center" });
  pdf.setTextColor(0);

  // ─── Baslik ───
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(company.name || "Firma", margin + 30, y + 6);
  y += 10;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  if (company.company_tax_id) pdf.text(`VKN: ${company.company_tax_id}`, margin + 30, y);
  if (company.company_tax_office) pdf.text(`V.D.: ${company.company_tax_office}`, margin + 70, y);
  y += 4;
  if (company.company_address) { pdf.text(company.company_address, margin + 30, y); y += 4; }
  if (company.company_phone) pdf.text(`Tel: ${company.company_phone}`, margin + 30, y);
  if (company.company_email) pdf.text(`E-posta: ${company.company_email}`, margin + 80, y);
  y = margin + 28;

  // ─── Cizgi ───
  pdf.setDrawColor(160, 132, 92); // receipt-brown
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ─── Fatura Bilgileri ───
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(160, 132, 92);
  pdf.text("FATURA", pageWidth - margin, y, { align: "right" });
  pdf.setTextColor(0);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Fatura No: ${doc.document_number || "-"}`, pageWidth - margin, y + 6, { align: "right" });
  pdf.text(`Tarih: ${doc.issue_date || "-"}`, pageWidth - margin, y + 11, { align: "right" });

  // Due date
  if (doc.notes && doc.notes.includes("Vade:")) {
    pdf.text(`Vade: ${doc.notes.split("Vade:")[1]?.trim() || "-"}`, pageWidth - margin, y + 16, { align: "right" });
  }

  // ─── Alici Bilgileri ───
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("ALICI", margin, y);
  y += 5;
  pdf.setFont("helvetica", "normal");

  const buyerName = doc.direction === "income"
    ? (doc.buyer_name || doc.supplier_name || "-")
    : (doc.supplier_name || "-");
  const buyerTaxId = doc.direction === "income"
    ? (doc.buyer_tax_id || doc.supplier_tax_id || "")
    : (doc.supplier_tax_id || "");
  const buyerTaxOffice = doc.direction === "income"
    ? (doc.buyer_tax_office || "")
    : "";
  const buyerAddress = doc.direction === "income"
    ? (doc.buyer_address || doc.supplier_address || "")
    : (doc.supplier_address || "");

  pdf.text(buyerName, margin, y); y += 4;
  if (buyerTaxId) { pdf.text(`VKN: ${buyerTaxId}`, margin, y); y += 4; }
  if (buyerTaxOffice) { pdf.text(`V.D.: ${buyerTaxOffice}`, margin, y); y += 4; }
  if (buyerAddress) { pdf.text(buyerAddress, margin, y); y += 4; }
  y += 10;

  // ─── Kalemler Tablosu ───
  const colX = [margin, margin + 10, margin + 90, margin + 110, margin + 135, margin + 160];
  const headers = ["#", "Aciklama", "Miktar", "Birim Fiyat", "KDV %", "Tutar"];

  // Tablo basligi
  pdf.setFillColor(245, 240, 230);
  pdf.rect(margin, y - 1, contentWidth, 7, "F");
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  headers.forEach((h, i) => pdf.text(h, colX[i], y + 4));
  y += 9;

  // Kalemler
  pdf.setFont("helvetica", "normal");
  const items = doc.line_items || [];

  if (items.length > 0) {
    items.forEach((item, i) => {
      checkPageBreak(6);
      // Alternating row background
      if (i % 2 === 1) {
        pdf.setFillColor(252, 250, 245);
        pdf.rect(margin, y - 3.5, contentWidth, 5, "F");
      }
      pdf.text(String(i + 1), colX[0], y);
      pdf.text((item.name || "").substring(0, 40), colX[1], y);
      pdf.text(String(item.quantity), colX[2], y);
      pdf.text(formatAmount(item.unit_price), colX[3], y);
      pdf.text(item.vat_rate != null ? `%${item.vat_rate}` : "-", colX[4], y);
      pdf.text(formatAmount(item.total), colX[5], y);
      y += 5;
    });
  } else {
    pdf.text("1", colX[0], y);
    pdf.text("Genel", colX[1], y);
    pdf.text("1", colX[2], y);
    pdf.text(formatAmount(doc.subtotal_amount || doc.total_amount), colX[3], y);
    pdf.text(doc.vat_rate ? `%${doc.vat_rate}` : "-", colX[4], y);
    pdf.text(formatAmount(doc.total_amount), colX[5], y);
    y += 5;
  }

  y += 5;
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ─── Toplamlar ───
  checkPageBreak(30);
  const totalsX = pageWidth - margin - 60;
  pdf.setFontSize(9);

  if (doc.subtotal_amount != null) {
    pdf.text("Ara Toplam:", totalsX, y);
    pdf.text(formatAmount(doc.subtotal_amount), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  if (doc.vat_amount != null) {
    pdf.text(`KDV (${doc.vat_rate ? `%${doc.vat_rate}` : ""})`, totalsX, y);
    pdf.text(formatAmount(doc.vat_amount), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  if (doc.withholding_amount) {
    pdf.text("Stopaj:", totalsX, y);
    pdf.text(`-${formatAmount(doc.withholding_amount)}`, pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  y += 2;
  pdf.text("TOPLAM:", totalsX, y);
  pdf.text(`${formatAmount(doc.total_amount)} ${doc.currency || "TRY"}`, pageWidth - margin, y, { align: "right" });
  y += 10;

  // ─── Notes section ───
  if (doc.notes) {
    checkPageBreak(15);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notlar:", margin, y);
    y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const noteLines = pdf.splitTextToSize(doc.notes, contentWidth);
    pdf.text(noteLines, margin, y);
    y += noteLines.length * 3.5 + 5;
  }

  // ─── Footer ───
  addPageNumber();
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(150);
  pdf.text("Otomakbuz ile olusturulmustur", pageWidth / 2, 285, { align: "center" });

  return pdf.output("blob");
}
