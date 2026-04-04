import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/giris"><Button variant="ghost" size="sm">Giris Yap</Button></Link>
            <Link href="/kayit"><Button size="sm">Ucretsiz Dene</Button></Link>
          </div>
        </div>
      </nav>
      <Hero />
      <HowItWorks />
      <Features />
      <section className="bg-slate-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Evrak islemede yeni doneme gecin</h2>
          <p className="text-slate-400 mb-8">Hemen kayit olun, belgelerinizi yuklemeye baslayin.</p>
          <Link href="/kayit"><Button size="lg" className="text-base px-8">Ucretsiz Dene</Button></Link>
        </div>
      </section>
      <footer className="bg-white border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Otomakbuz. Tum haklari saklidir.
        </div>
      </footer>
    </div>
  );
}
