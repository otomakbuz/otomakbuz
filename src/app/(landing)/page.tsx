import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonial } from "@/components/landing/testimonial";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { PricingDialog } from "@/components/landing/pricing-dialog";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Sticky kahverengi navbar */}
      <nav className="sticky top-0 z-50 bg-receipt-brown/95 backdrop-blur-xl border-b border-receipt-brown-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="light" />
          <div className="hidden md:flex items-center gap-8 text-white">
            <Link href="#nasil-calisir" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
              Nasıl Çalışır
            </Link>
            <Link href="#ozellikler" className="text-sm text-white/70 hover:text-white transition-colors font-medium">
              Özellikler
            </Link>
            <PricingDialog>
              Fiyatlandırma
            </PricingDialog>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/giris" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 font-medium text-sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm" className="bg-white hover:bg-white/90 text-receipt-brown font-medium text-sm rounded-full px-5">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <Hero />
      <LogoStrip />
      <section id="ozellikler">
        <Features />
      </section>
      <HowItWorks />
      <Testimonial />
      <CtaSection />
      <Footer />
    </div>
  );
}
