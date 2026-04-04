export function LogoStrip() {
  const companies = ["Migros", "Trendyol", "Hepsiburada", "BİM", "Getir", "Yemeksepeti"];

  return (
    <section className="py-16 border-t border-paper-lines">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-faint mb-10 font-medium">
          1.000+ işletme tarafından tercih ediliyor
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((name) => (
            <span
              key={name}
              className="text-xl font-bold text-ink/15 select-none tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
