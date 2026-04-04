import { Upload, Scan, FolderCheck } from "lucide-react";

const steps = [
  { icon: Upload, title: "1. Yukleyin", description: "Makbuz, fis veya faturayi surukleyip birakin ya da dosya secin. Tekli veya toplu yukleme yapabilirsiniz." },
  { icon: Scan, title: "2. Otomatik Taransin", description: "Sistem belgeyi aninda okur, firma adi, tarih, tutar, KDV gibi onemli alanlari otomatik cikarir." },
  { icon: FolderCheck, title: "3. Yonetin", description: "Dogrulayin, kategorize edin, arsivleyin. Istediginiz zaman filtreleyin ve disa aktarin." },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Nasil Calisir?</h2>
        <p className="text-center text-slate-600 mb-12 max-w-xl mx-auto">Uc basit adimda belgelerinizi dijitallestirin ve duzenleyin.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="bg-white rounded-xl p-8 text-center shadow-sm border">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-5">
                <step.icon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
