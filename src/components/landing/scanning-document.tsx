"use client";

import { Sparkles } from "lucide-react";

/**
 * Scanning Document — decorative hero animation
 *
 * A paper receipt being OCR-scanned. Scan line sweeps vertically, and
 * extracted field chips fade in as the line passes. Loops continuously.
 * Positioned absolutely on the left side of the hero.
 */
export function ScanningDocument() {
  return (
    <div className="absolute left-4 xl:left-8 top-[52%] -translate-y-1/2 hidden lg:block pointer-events-none z-[5]">
      <div className="relative w-[230px] xl:w-[260px]">
        {/* Soft glow */}
        <div className="absolute -inset-6 bg-receipt-gold/8 rounded-full blur-3xl" />

        {/* Receipt paper */}
        <div
          className="relative bg-[#fdfaf2] rounded-sm shadow-2xl shadow-ink/20 border border-paper-lines/80 overflow-hidden animate-scan-doc-float"
          style={{
            transform: "rotate(-6deg) perspective(1200px) rotateY(8deg)",
            transformOrigin: "center center",
          }}
        >
          {/* Torn top edge */}
          <div
            className="h-2.5 bg-paper"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
              maskImage:
                "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
            }}
          />

          {/* Receipt body */}
          <div className="p-5 font-mono text-[11px] leading-relaxed text-ink">
            <div className="text-center font-bold tracking-[0.15em] text-[12px] mb-1">
              MİGROS TİCARET A.Ş.
            </div>
            <div className="text-center text-ink-faint text-[9px] mb-2">
              Kadıköy Şb. · VKN: 6170087398
            </div>
            <div className="text-center text-ink-faint text-[9px] mb-3">
              03.04.2026 · 14:32
            </div>
            <div className="border-t border-dashed border-paper-lines my-2" />

            <div className="flex justify-between">
              <span>Süt 1L</span>
              <span className="tabular-nums">₺32,50</span>
            </div>
            <div className="flex justify-between">
              <span>Ekmek Tam Buğday</span>
              <span className="tabular-nums">₺15,00</span>
            </div>
            <div className="flex justify-between">
              <span>Yumurta 30lu</span>
              <span className="tabular-nums">₺85,00</span>
            </div>
            <div className="flex justify-between">
              <span>Zeytinyağı 1L</span>
              <span className="tabular-nums">₺245,00</span>
            </div>
            <div className="flex justify-between">
              <span>Peynir Beyaz</span>
              <span className="tabular-nums">₺132,50</span>
            </div>

            <div className="border-t border-dashed border-paper-lines my-2" />

            <div className="flex justify-between text-ink-faint">
              <span>ARA TOPLAM</span>
              <span className="tabular-nums">₺510,00</span>
            </div>
            <div className="flex justify-between text-ink-faint">
              <span>KDV %10</span>
              <span className="tabular-nums">₺46,36</span>
            </div>
            <div className="flex justify-between font-bold text-[12px] mt-1">
              <span>TOPLAM</span>
              <span className="tabular-nums">₺556,36</span>
            </div>

            <div className="border-t border-dashed border-paper-lines my-2" />

            <div className="text-center text-ink-faint text-[9px] mb-1">
              Ödeme: Kredi Kartı ****4821
            </div>
            <div className="text-center text-ink-faint text-[9px]">
              TEŞEKKÜR EDERİZ
            </div>

            {/* Barcode */}
            <div className="mt-3 flex items-end justify-center gap-[1px] h-6">
              {Array.from({ length: 38 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-ink"
                  style={{
                    width: i % 3 === 0 ? 2 : 1,
                    height: i % 4 === 0 ? "100%" : i % 2 === 0 ? "80%" : "60%",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom torn edge */}
          <div
            className="h-2.5 bg-paper"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
              maskImage:
                "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
            }}
          />

          {/* Scan line — sweeps top to bottom */}
          <div className="pointer-events-none absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-receipt-gold to-transparent shadow-[0_0_24px_6px_rgba(212,165,116,0.85)] animate-scan-doc-sweep" />

          {/* Scan fill — gold tint covering scanned portion */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-receipt-gold/0 via-receipt-gold/10 to-receipt-gold/0 animate-scan-doc-fill" />
        </div>

        {/* OCR status badge */}
        <div
          className="absolute -top-3 -right-3 flex items-center gap-1.5 bg-ink text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-lg animate-scan-doc-badge"
          style={{ transform: "rotate(4deg)" }}
        >
          <Sparkles className="h-3 w-3 text-receipt-gold" />
          <span>OCR Tarıyor</span>
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-receipt-gold animate-scan-doc-dot-1" />
            <span className="w-1 h-1 rounded-full bg-receipt-gold animate-scan-doc-dot-2" />
            <span className="w-1 h-1 rounded-full bg-receipt-gold animate-scan-doc-dot-3" />
          </span>
        </div>

      </div>
    </div>
  );
}
