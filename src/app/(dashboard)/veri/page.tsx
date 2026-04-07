"use client";

import { DatabaseZap, FileText, Users, Package } from "lucide-react";
import { ExportCards } from "@/components/import-export/export-cards";
import { ImportCard } from "@/components/import-export/import-card";
import {
  importDocuments,
  importContacts,
  importProducts,
} from "@/lib/actions/import-export";

export default function VeriPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-receipt-gold/12 flex-shrink-0">
          <DatabaseZap className="h-5 w-5 text-receipt-brown" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Veri Yonetimi
          </h1>
          <p className="text-ink-muted text-sm">
            Verilerinizi iceri/disari aktarin, yedekleyin.
          </p>
        </div>
      </div>

      {/* Export section */}
      <ExportCards />

      {/* Divider */}
      <div className="border-t border-paper-lines" />

      {/* Import section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Ice Aktar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImportCard
            title="Belgeler"
            description="CSV dosyasindan belge ice aktar"
            icon={<FileText className="h-5 w-5 text-receipt-brown" />}
            templateType="documents"
            onImport={importDocuments}
            previewHeaders={[
              "Tarih", "Tedarikçi", "Belge No", "Tutar", "KDV",
              "Toplam", "Tür", "Yön", "Açıklama", "Kategori",
            ]}
          />
          <ImportCard
            title="Cariler"
            description="CSV dosyasindan cari hesap ice aktar"
            icon={<Users className="h-5 w-5 text-receipt-brown" />}
            templateType="contacts"
            onImport={importContacts}
            previewHeaders={[
              "Ad", "Vergi No", "Vergi Dairesi", "Telefon",
              "Email", "Adres", "Şehir", "Tür",
            ]}
          />
          <ImportCard
            title="Urunler"
            description="CSV dosyasindan urun ice aktar"
            icon={<Package className="h-5 w-5 text-receipt-brown" />}
            templateType="products"
            onImport={importProducts}
            previewHeaders={[
              "Kod", "Ad", "Birim", "Miktar", "Alış Fiyatı",
              "Satış Fiyatı", "Kategori", "Min Stok",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
