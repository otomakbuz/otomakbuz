import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 90) return "Yuksek";
  if (score >= 70) return "Orta";
  return "Dusuk";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    uploaded: "Yuklendi",
    processing: "Isleniyor",
    needs_review: "Inceleme Bekliyor",
    verified: "Dogrulandi",
    archived: "Arsivlendi",
    failed: "Basarisiz",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    uploaded: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    needs_review: "bg-amber-100 text-amber-700",
    verified: "bg-green-100 text-green-700",
    archived: "bg-slate-100 text-slate-700",
    failed: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getDocumentTypeLabel(type: string | null): string {
  if (!type) return "Bilinmiyor";
  const labels: Record<string, string> = {
    fatura: "Fatura",
    fis: "Fis",
    makbuz: "Makbuz",
    pos_slip: "POS Slip",
    gider_fisi: "Gider Fisi",
  };
  return labels[type] || type;
}
