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
      {/* Sticky frosted glass navbar */}
      <nav className="sticky top-0 z-50 bg-paper/80 backdrop-blur-xl border-b border-paper-lines/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link href="#nasil-calisir" className="text-sm text-ink-muted hover:text-ink transition-colors font-medium">
              Nasıl Çalışır
            </Link>
            <Link href="#ozellikler" className="text-sm text-ink-muted hover:text-ink transition-colors font-medium">
              Özellikler
            </Link>
            <PricingDialog>
              Fiyatlandırma
            </PricingDialog>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/giris">
              <Button variant="ghost" size="sm" className="text-ink-muted hover:text-ink font-medium text-sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm" className="bg-ink hover:bg-ink-light text-white font-medium text-sm rounded-full px-5">
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
