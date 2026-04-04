import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";
import { AnnouncementDialog } from "./announcement-dialog";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-0">
        <div className="text-center max-w-3xl mx-auto">
          {/* Announcement pill */}
          <div className="animate-fade-up">
            <AnnouncementDialog>
              <span className="text-xs font-medium">Yeni: Çoklu kullanıcı desteği ve gelişmiş raporlar</span>
              <ArrowRight className="h-3 w-3" />
            </AnnouncementDialog>
          </div>

          {/* Spacer */}
          <div className="h-8" />

          {/* H1 */}
          <h1 className="animate-fade-up animate-fade-up-delay-1 text-[40px] sm:text-[52px] lg:text-[62px] font-bold tracking-tight text-ink leading-[1.05] mb-6">
            Belge yönetiminde{" "}
            <br className="hidden sm:block" />
            yeni standart.
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up animate-fade-up-delay-2 text-lg sm:text-xl text-ink-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Makbuz ve faturalarınızı yükleyin, OCR ile otomatik tarayalım, gelir-gider takibinizi kolaylaştıralım.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up animate-fade-up-delay-3 flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/kayit">
              <Button
                size="lg"
                className="text-base px-8 h-13 bg-ink hover:bg-ink-light text-white rounded-full font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-ink/10"
              >
                Ücretsiz Başla
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="#nasil-calisir">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-13 rounded-full border-paper-lines hover:border-ink/20 hover:bg-surface transition-all font-medium"
              >
                Nasıl Çalışır?
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <DashboardMockup />
      </div>
    </section>
  );
}
