import { StepDialog } from "./step-dialog";

const steps = [
  {
    number: "1",
    title: "Yükleyin",
    description: "Makbuz, fiş veya faturanızı sürükleyip bırakın. Çoklu yükleme desteklenir.",
  },
  {
    number: "2",
    title: "Taransın",
    description: "OCR motoru belgenizi anında okur. Firma, tarih, tutar ve KDV otomatik çıkarılır.",
  },
  {
    number: "3",
    title: "Yönetin",
    description: "Doğrulayın, kategorize edin, raporlayın. Muhasebeciye hazır dosyalar oluşturun.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="py-24 sm:py-32 bg-surface border-t border-paper-lines">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint font-medium mb-4">
            Nasıl çalışır
          </p>
          <h2 className="text-3xl sm:text-[40px] font-bold text-ink tracking-tight">
            Üç kolay adım.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-paper-lines" />

          {steps.map((step) => (
            <StepDialog key={step.number} stepNumber={step.number}>
              <div className="text-center relative">
                {/* Number circle */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-paper-lines bg-paper text-ink font-bold text-lg mb-6 relative z-10 group-hover:border-receipt-gold/50 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-ink mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-ink-muted leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
                <span className="inline-block mt-4 text-xs font-medium text-ink-faint hover:text-brand transition-colors">
                  Detayları gör →
                </span>
              </div>
            </StepDialog>
          ))}
        </div>
      </div>
    </section>
  );
}
