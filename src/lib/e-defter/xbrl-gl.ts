import type { JournalEntry, JournalLine, CompanyInfo } from "@/types";

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function amount(val: number | null | undefined): string {
  return (val ?? 0).toFixed(2);
}

export function generateXbrlGlXml(
  entries: (JournalEntry & { lines: JournalLine[] })[],
  company: CompanyInfo & { name: string },
  period: { month: number; year: number }
): string {
  const periodStr = `${period.year}-${String(period.month).padStart(2, "0")}`;
  const now = new Date().toISOString();

  const entriesXml = entries.map((entry) => {
    const linesXml = entry.lines.map((line) => `
        <gl-cor:entryDetail>
          <gl-cor:account>
            <gl-cor:accountMainID>${esc(line.account_code)}</gl-cor:accountMainID>
          </gl-cor:account>
          <gl-cor:amount>
            <gl-cor:debitCreditCode>${Number(line.debit_amount) > 0 ? "D" : "C"}</gl-cor:debitCreditCode>
            <gl-cor:monetaryAmount>${amount(Number(line.debit_amount) > 0 ? line.debit_amount : line.credit_amount)}</gl-cor:monetaryAmount>
          </gl-cor:amount>
          <gl-cor:postingDate>${entry.entry_date}</gl-cor:postingDate>
          ${line.description ? `<gl-cor:detailComment>${esc(line.description)}</gl-cor:detailComment>` : ""}
        </gl-cor:entryDetail>`).join("");

    return `
      <gl-cor:entryHeader>
        <gl-cor:enteredDate>${entry.entry_date}</gl-cor:enteredDate>
        <gl-cor:entryNumber>${entry.entry_number}</gl-cor:entryNumber>
        <gl-cor:entryComment>${esc(entry.description)}</gl-cor:entryComment>
        ${linesXml}
      </gl-cor:entryHeader>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gl-cor:accountingEntries
  xmlns:gl-cor="http://www.xbrl.org/int/gl/cor/2016-12-01"
  xmlns:gl-bus="http://www.xbrl.org/int/gl/bus/2016-12-01"
  xmlns:gl-muc="http://www.xbrl.org/int/gl/muc/2016-12-01"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <gl-cor:documentInfo>
    <gl-cor:creationDate>${now.split("T")[0]}</gl-cor:creationDate>
    <gl-cor:periodCoveredStart>${periodStr}-01</gl-cor:periodCoveredStart>
    <gl-cor:periodCoveredEnd>${periodStr}-${new Date(period.year, period.month, 0).getDate()}</gl-cor:periodCoveredEnd>
    <gl-cor:defaultCurrency>TRY</gl-cor:defaultCurrency>
    <gl-cor:entriesType>journal</gl-cor:entriesType>
    <gl-bus:sourceApplication>Otomakbuz</gl-bus:sourceApplication>
  </gl-cor:documentInfo>

  <gl-cor:entityInformation>
    <gl-bus:organizationIdentifiers>
      <gl-bus:organizationIdentifier>${esc(company.company_tax_id)}</gl-bus:organizationIdentifier>
      <gl-bus:organizationDescription>${esc(company.name)}</gl-bus:organizationDescription>
    </gl-bus:organizationIdentifiers>
    <gl-bus:organizationAddress>
      <gl-bus:organizationBuildingNumber>${esc(company.company_address)}</gl-bus:organizationBuildingNumber>
    </gl-bus:organizationAddress>
  </gl-cor:entityInformation>

  <gl-cor:accountingEntries>
    ${entriesXml}
  </gl-cor:accountingEntries>

</gl-cor:accountingEntries>`;
}
