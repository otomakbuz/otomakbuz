import { FileText, Search, Download, Shield, Zap, Tags } from "lucide-react";

const features = [
  { icon: Zap, title: "Anlik OCR", description: "Belgeleriniz yuklendiginde aninda taranir ve veriler cikarilir." },
  { icon: Shield, title: "Guven Skoru", description: "Her alan icin guven skoru gosterilir. Dusuk skorlu alanlar vurgulanir." },
  { icon: Tags, title: "Kategori ve Etiket", description: "Belgelerinizi kategorilere ayirin, etiketlerle isaretin." },
  { icon: Search, title: "Guclu Arama", description: "Firma, tarih, tutar, kategori veya OCR icerigi ile hizlica arayip bulun." },
  { icon: FileText, title: "Toplu Yukleme", description: "Birden fazla belgeyi ayni anda yukleyin, paralel olarak taratin." },
  { icon: Download, title: "Disa Aktarma", description: "Belgelerinizi CSV veya Excel formatinda disa aktarin." },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Ozellikler</h2>
        <p className="text-center text-slate-600 mb-12 max-w-xl mx-auto">Evrak isleme surecini bastan sona kolaylastiran araclar.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-4">
                <feature.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
