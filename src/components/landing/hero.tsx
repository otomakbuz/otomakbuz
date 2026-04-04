import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Makbuz ve faturalari yukleyin,{" "}
          <span className="text-blue-600">gerisini Otomakbuz halletsin.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Makbuz, fis ve faturalarinizi saniyeler icinde okuyup duzenlemenizi saglayan akilli evrak isleme platformu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/kayit"><Button size="lg" className="text-base px-8">Ucretsiz Dene</Button></Link>
          <Link href="#nasil-calisir"><Button variant="outline" size="lg" className="text-base px-8">Nasil Calisir?</Button></Link>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-sm text-slate-500">
          <div className="flex items-center gap-2"><Upload className="h-4 w-4" /><span>Hizli Yukleme</span></div>
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span>Otomatik Tanima</span></div>
          <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /><span>Detayli Raporlama</span></div>
        </div>
      </div>
    </section>
  );
}
