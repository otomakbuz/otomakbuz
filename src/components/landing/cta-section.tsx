import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 bg-paper border-t border-paper-lines">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-[40px] font-bold text-ink tracking-tight leading-tight mb-5">
          İlk belgenizi yükleyin.
        </h2>
        <p className="text-lg text-ink-muted mb-10">
          Ücretsiz başlayın, kredi kartı gerekmez.
        </p>
        <Link href="/kayit">
          <Button
            size="lg"
            className="text-base px-10 h-13 bg-ink hover:bg-ink-light text-white rounded-full font-medium transition-all hover:-translate-y-0.5"
          >
            Ücretsiz Başla
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
