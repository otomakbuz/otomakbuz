export function Testimonial() {
  return (
    <section className="py-24 sm:py-32 bg-paper">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <blockquote>
          <p className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-ink tracking-tight leading-[1.2]">
            &ldquo;Otomakbuz ile aylık 20 saatlik muhasebe hazırlığını 2 saate düşürdük.&rdquo;
          </p>
          <footer className="mt-8">
            <p className="text-ink-muted text-base">
              — Ahmet Yılmaz, Kurucu · TechStartup A.Ş.
            </p>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
